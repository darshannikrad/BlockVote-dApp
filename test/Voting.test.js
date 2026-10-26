const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockVote - Voting Smart Contract", function () {
  let Voting;
  let voting;
  let admin, voter1, voter2, voter3, nonVoter;

  const ELECTION_NAME = "2026 Student Union Election";
  const ELECTION_DESC = "Official election for student union leadership";

  beforeEach(async function () {
    [admin, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.deployed();
  });

  describe("Deployment & Initialization", function () {
    it("Should set the deployer as admin", async function () {
      expect(await voting.admin()).to.equal(admin.address);
    });

    it("Should start with 0 elections", async function () {
      expect(await voting.electionCount()).to.equal(0);
    });
  });

  describe("Election Management", function () {
    it("Should allow admin to create an election and emit ElectionCreated event", async function () {
      const startTime = Math.floor(Date.now() / 1000) - 100;
      const endTime = startTime + 3600;

      await expect(
        voting.createElection(ELECTION_NAME, ELECTION_DESC, startTime, endTime)
      )
        .to.emit(voting, "ElectionCreated")
        .withArgs(1, ELECTION_NAME, startTime, endTime);

      expect(await voting.electionCount()).to.equal(1);

      const election = await voting.getElection(1);
      expect(election.id).to.equal(1);
      expect(election.name).to.equal(ELECTION_NAME);
      expect(election.description).to.equal(ELECTION_DESC);
      expect(election.phase).to.equal(0); // Phase.Created
      expect(election.totalVotes).to.equal(0);
    });

    it("Should prevent non-admin from creating an election", async function () {
      await expect(
        voting.connect(voter1).createElection(ELECTION_NAME, ELECTION_DESC, 0, 0)
      ).to.be.revertedWith("BlockVote: Only admin can perform this action");
    });

    it("Should reject election with empty name", async function () {
      await expect(
        voting.createElection("", ELECTION_DESC, 0, 0)
      ).to.be.revertedWith("BlockVote: Election name cannot be empty");
    });

    it("Should reject election if end time is before start time", async function () {
      await expect(
        voting.createElection(ELECTION_NAME, ELECTION_DESC, 2000, 1000)
      ).to.be.revertedWith("BlockVote: End time must be after start time");
    });
  });

  describe("Phase Management", function () {
    beforeEach(async function () {
      await voting.createElection(ELECTION_NAME, ELECTION_DESC, 0, 0);
    });

    it("Should allow admin to update election phases and emit ElectionPhaseChanged", async function () {
      // Transition from Created (0) to Registration (1)
      await expect(voting.setElectionPhase(1, 1))
        .to.emit(voting, "ElectionPhaseChanged")
        .withArgs(1, 1);

      let election = await voting.getElection(1);
      expect(election.phase).to.equal(1); // Registration

      // Transition to Voting (2)
      await voting.setElectionPhase(1, 2);
      election = await voting.getElection(1);
      expect(election.phase).to.equal(2); // Voting

      // Transition to Ended (3)
      await voting.setElectionPhase(1, 3);
      election = await voting.getElection(1);
      expect(election.phase).to.equal(3); // Ended
    });

    it("Should prevent non-admin from updating election phase", async function () {
      await expect(
        voting.connect(voter1).setElectionPhase(1, 1)
      ).to.be.revertedWith("BlockVote: Only admin can perform this action");
    });

    it("Should revert when changing phase for non-existent election", async function () {
      await expect(
        voting.setElectionPhase(999, 1)
      ).to.be.revertedWith("BlockVote: Election does not exist");
    });
  });

  describe("Candidate Management", function () {
    beforeEach(async function () {
      await voting.createElection(ELECTION_NAME, ELECTION_DESC, 0, 0);
    });

    it("Should allow admin to add candidates and emit CandidateAdded", async function () {
      await expect(
        voting.addCandidate(1, "Alice", "Blockchain Party", "Decentralized future")
      )
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, 0, "Alice", "Blockchain Party");

      await expect(
        voting.addCandidate(1, "Bob", "Smart Contracts Union", "Fair automation")
      )
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, 1, "Bob", "Smart Contracts Union");

      expect(await voting.getCandidateCount(1)).to.equal(2);

      const candidates = await voting.getCandidates(1);
      expect(candidates.length).to.equal(2);
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[0].party).to.equal("Blockchain Party");
      expect(candidates[0].voteCount).to.equal(0);
      expect(candidates[1].name).to.equal("Bob");
    });

    it("Should prevent non-admin from adding candidates", async function () {
      await expect(
        voting.connect(voter1).addCandidate(1, "Alice", "Party A", "Desc")
      ).to.be.revertedWith("BlockVote: Only admin can perform this action");
    });

    it("Should reject candidate addition when election is in Voting phase", async function () {
      await voting.setElectionPhase(1, 2); // Voting
      await expect(
        voting.addCandidate(1, "Alice", "Party A", "Desc")
      ).to.be.revertedWith("BlockVote: Candidates can only be added during Created or Registration phase");
    });

    it("Should reject candidate with empty name", async function () {
      await expect(
        voting.addCandidate(1, "", "Party A", "Desc")
      ).to.be.revertedWith("BlockVote: Candidate name cannot be empty");
    });
  });

  describe("Voter Registration", function () {
    beforeEach(async function () {
      await voting.createElection(ELECTION_NAME, ELECTION_DESC, 0, 0);
      await voting.setElectionPhase(1, 1); // Registration phase
    });

    it("Should allow admin to register eligible voters and emit VoterRegistered", async function () {
      await expect(voting.registerVoter(1, voter1.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(1, voter1.address);

      const voter = await voting.getVoter(1, voter1.address);
      expect(voter.isRegistered).to.be.true;
      expect(voter.hasVoted).to.be.false;
      expect(voter.voterAddress).to.equal(voter1.address);
    });

    it("Should prevent non-admin from registering voters", async function () {
      await expect(
        voting.connect(voter1).registerVoter(1, voter2.address)
      ).to.be.revertedWith("BlockVote: Only admin can perform this action");
    });

    it("Should prevent duplicate voter registration", async function () {
      await voting.registerVoter(1, voter1.address);
      await expect(
        voting.registerVoter(1, voter1.address)
      ).to.be.revertedWith("BlockVote: Voter is already registered");
    });

    it("Should prevent registering zero address", async function () {
      await expect(
        voting.registerVoter(1, ethers.constants.AddressZero)
      ).to.be.revertedWith("BlockVote: Invalid voter address");
    });

    it("Should prevent voter registration after Registration phase has ended", async function () {
      await voting.setElectionPhase(1, 2); // Voting phase
      await expect(
        voting.registerVoter(1, voter2.address)
      ).to.be.revertedWith("BlockVote: Voter registration is not active");
    });
  });

  describe("Voting Mechanics & Security", function () {
    beforeEach(async function () {
      await voting.createElection(ELECTION_NAME, ELECTION_DESC, 0, 0);
      await voting.addCandidate(1, "Alice", "Crypto Party", "Manifesto 1");
      await voting.addCandidate(1, "Bob", "DAO Party", "Manifesto 2");
      await voting.registerVoter(1, voter1.address);
      await voting.registerVoter(1, voter2.address);
      await voting.setElectionPhase(1, 2); // Set to Voting phase
    });

    it("Should allow a registered voter to cast a vote and emit VoteCast with privacy hash", async function () {
      const tx = await voting.connect(voter1).castVote(1, 0); // Vote for Alice (0)
      const receipt = await tx.wait();

      // Find VoteCast event
      const event = receipt.events.find((e) => e.event === "VoteCast");
      expect(event).to.not.be.undefined;
      expect(event.args.electionId).to.equal(1);
      expect(event.args.voter).to.equal(voter1.address);
      expect(event.args.voteHash).to.not.equal(ethers.constants.HashZero);

      // Verify voter state
      const voter = await voting.getVoter(1, voter1.address);
      expect(voter.hasVoted).to.be.true;
      expect(voter.votedCandidateId).to.equal(0);
      expect(voter.voteHash).to.equal(event.args.voteHash);

      // Verify candidate vote count and election totalVotes
      const candidate0 = await voting.getCandidate(1, 0);
      expect(candidate0.voteCount).to.equal(1);

      const election = await voting.getElection(1);
      expect(election.totalVotes).to.equal(1);
    });

    it("Should prevent double voting from the same voter", async function () {
      await voting.connect(voter1).castVote(1, 0);

      await expect(
        voting.connect(voter1).castVote(1, 1)
      ).to.be.revertedWith("BlockVote: Voter has already cast a vote");
    });

    it("Should prevent unregistered voter from voting", async function () {
      await expect(
        voting.connect(nonVoter).castVote(1, 0)
      ).to.be.revertedWith("BlockVote: Voter is not registered for this election");
    });

    it("Should prevent voting when election is not in Voting phase", async function () {
      await voting.setElectionPhase(1, 1); // Registration phase
      await expect(
        voting.connect(voter2).castVote(1, 0)
      ).to.be.revertedWith("BlockVote: Election is not in voting phase");

      await voting.setElectionPhase(1, 3); // Ended phase
      await expect(
        voting.connect(voter2).castVote(1, 0)
      ).to.be.revertedWith("BlockVote: Election is not in voting phase");
    });

    it("Should prevent voting for non-existent candidate", async function () {
      await expect(
        voting.connect(voter1).castVote(1, 99)
      ).to.be.revertedWith("BlockVote: Invalid candidate ID");
    });
  });

  describe("Winner Determination & Results", function () {
    beforeEach(async function () {
      await voting.createElection(ELECTION_NAME, ELECTION_DESC, 0, 0);
      await voting.addCandidate(1, "Alice", "Crypto Party", "Manifesto 1");
      await voting.addCandidate(1, "Bob", "DAO Party", "Manifesto 2");
      await voting.addCandidate(1, "Charlie", "Open Source Party", "Manifesto 3");

      await voting.registerVoter(1, voter1.address);
      await voting.registerVoter(1, voter2.address);
      await voting.registerVoter(1, voter3.address);

      await voting.setElectionPhase(1, 2); // Voting
    });

    it("Should determine the correct winner based on highest votes", async function () {
      // voter1 votes for Bob (1)
      await voting.connect(voter1).castVote(1, 1);
      // voter2 votes for Bob (1)
      await voting.connect(voter2).castVote(1, 1);
      // voter3 votes for Charlie (2)
      await voting.connect(voter3).castVote(1, 2);

      // Transition to Ended
      await voting.setElectionPhase(1, 3);

      const [winnerId, winnerName, winnerParty, winningVoteCount] =
        await voting.getWinner(1);

      expect(winnerId).to.equal(1);
      expect(winnerName).to.equal("Bob");
      expect(winnerParty).to.equal("DAO Party");
      expect(winningVoteCount).to.equal(2);
    });

    it("Should handle election with zero votes gracefully", async function () {
      const [winnerId, winnerName, , winningVoteCount] = await voting.getWinner(1);
      expect(winnerId).to.equal(0);
      expect(winnerName).to.equal("Alice");
      expect(winningVoteCount).to.equal(0);
    });

    it("Should revert getWinner if election has no candidates", async function () {
      await voting.createElection("Empty Election", "No candidates", 0, 0);
      await expect(voting.getWinner(2)).to.be.revertedWith(
        "BlockVote: No candidates in this election"
      );
    });
  });
});
