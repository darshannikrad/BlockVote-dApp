// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BlockVote - Decentralized E-Voting System
 * @author BlockVote Team
 * @notice Complete smart contract for managing secure, private, and transparent elections on Ethereum
 * @dev Implements election phases, voter registration, vote privacy hashing, and on-chain tallying
 */
contract Voting {
    // --- Enums ---

    /// @notice Operational phases of an election lifecycle
    enum Phase {
        Created,
        Registration,
        Voting,
        Ended
    }

    // --- Structs ---

    /// @notice Details of an election
    struct Election {
        uint256 id;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        Phase phase;
        uint256 totalVotes;
    }

    /// @notice Candidate running in an election
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string description;
        uint256 voteCount;
    }

    /// @notice Voter status and vote commitment
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
        address voterAddress;
        bytes32 voteHash;
    }

    // --- State Variables ---

    /// @notice Contract administrator (deployer)
    address public admin;

    /// @notice Total number of elections created
    uint256 public electionCount;

    /// @notice Mapping from election ID to Election details
    mapping(uint256 => Election) public elections;

    /// @notice Mapping from election ID to list of Candidates
    mapping(uint256 => Candidate[]) internal electionCandidates;

    /// @notice Mapping from election ID to voter address to Voter details
    mapping(uint256 => mapping(address => Voter)) public voters;

    /// @notice Mapping from election ID to list of registered voter addresses
    mapping(uint256 => address[]) internal registeredVoters;

    // --- Events ---

    event ElectionCreated(
        uint256 indexed electionId,
        string name,
        uint256 startTime,
        uint256 endTime
    );

    event CandidateAdded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        string name,
        string party
    );

    event VoterRegistered(
        uint256 indexed electionId,
        address indexed voterAddress
    );

    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        bytes32 voteHash
    );

    event ElectionPhaseChanged(
        uint256 indexed electionId,
        Phase newPhase
    );

    event AdminTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );

    // --- Modifiers ---

    /// @notice Restricts function access to the contract administrator
    modifier onlyAdmin() {
        require(msg.sender == admin, "BlockVote: Only admin can perform this action");
        _;
    }

    /// @notice Restricts voting to the Voting phase and active timeframe
    modifier onlyDuringVoting(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "BlockVote: Election does not exist");
        require(
            elections[_electionId].phase == Phase.Voting,
            "BlockVote: Election is not in voting phase"
        );
        if (elections[_electionId].startTime > 0 && elections[_electionId].endTime > 0) {
            require(
                block.timestamp >= elections[_electionId].startTime,
                "BlockVote: Voting has not started yet"
            );
            require(
                block.timestamp <= elections[_electionId].endTime,
                "BlockVote: Voting has ended"
            );
        }
        _;
    }

    /// @notice Restricts action to registered voters for the specific election
    modifier onlyRegisteredVoter(uint256 _electionId) {
        require(
            voters[_electionId][msg.sender].isRegistered,
            "BlockVote: Voter is not registered for this election"
        );
        _;
    }

    /// @notice Ensures the caller has not already cast a vote in this election
    modifier hasNotVoted(uint256 _electionId) {
        require(
            !voters[_electionId][msg.sender].hasVoted,
            "BlockVote: Voter has already cast a vote"
        );
        _;
    }

    /// @notice Ensures election exists
    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "BlockVote: Election does not exist");
        _;
    }

    // --- Constructor ---

    constructor() {
        admin = msg.sender;
    }

    // --- Admin Functions ---

    /**
     * @notice Creates a new election with specified parameters
     * @param _name Name of the election
     * @param _description Description of election purpose and rules
     * @param _startTime Unix timestamp when voting opens
     * @param _endTime Unix timestamp when voting closes
     * @return electionId The unique identifier of the newly created election
     */
    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin returns (uint256) {
        require(bytes(_name).length > 0, "BlockVote: Election name cannot be empty");
        if (_startTime > 0 && _endTime > 0) {
            require(_endTime > _startTime, "BlockVote: End time must be after start time");
        }

        electionCount++;
        uint256 newElectionId = electionCount;

        elections[newElectionId] = Election({
            id: newElectionId,
            name: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            phase: Phase.Created,
            totalVotes: 0
        });

        emit ElectionCreated(newElectionId, _name, _startTime, _endTime);
        return newElectionId;
    }

    /**
     * @notice Adds a candidate to an election
     * @param _electionId ID of the election
     * @param _name Candidate's full name
     * @param _party Political party or affiliation
     * @param _description Candidate manifesto or biography
     */
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _party,
        string memory _description
    ) external onlyAdmin electionExists(_electionId) {
        require(
            elections[_electionId].phase == Phase.Created ||
            elections[_electionId].phase == Phase.Registration,
            "BlockVote: Candidates can only be added during Created or Registration phase"
        );
        require(bytes(_name).length > 0, "BlockVote: Candidate name cannot be empty");

        uint256 candidateId = electionCandidates[_electionId].length;

        electionCandidates[_electionId].push(
            Candidate({
                id: candidateId,
                name: _name,
                party: _party,
                description: _description,
                voteCount: 0
            })
        );

        emit CandidateAdded(_electionId, candidateId, _name, _party);
    }

    /**
     * @notice Registers an eligible voter address for a specific election
     * @param _electionId ID of the election
     * @param _voterAddress Ethereum address of voter
     */
    function registerVoter(
        uint256 _electionId,
        address _voterAddress
    ) external onlyAdmin electionExists(_electionId) {
        require(_voterAddress != address(0), "BlockVote: Invalid voter address");
        require(
            elections[_electionId].phase == Phase.Created ||
            elections[_electionId].phase == Phase.Registration,
            "BlockVote: Voter registration is not active"
        );
        require(
            !voters[_electionId][_voterAddress].isRegistered,
            "BlockVote: Voter is already registered"
        );

        voters[_electionId][_voterAddress] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedCandidateId: 0,
            voterAddress: _voterAddress,
            voteHash: bytes32(0)
        });

        registeredVoters[_electionId].push(_voterAddress);

        emit VoterRegistered(_electionId, _voterAddress);
    }

    /**
     * @notice Updates the operational phase of an election
     * @param _electionId ID of the election
     * @param _newPhase New phase to transition to
     */
    function setElectionPhase(
        uint256 _electionId,
        Phase _newPhase
    ) external onlyAdmin electionExists(_electionId) {
        elections[_electionId].phase = _newPhase;
        emit ElectionPhaseChanged(_electionId, _newPhase);
    }

    /**
     * @notice Transfers admin rights to a new address
     * @param _newAdmin New admin address
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "BlockVote: New admin cannot be zero address");
        address prev = admin;
        admin = _newAdmin;
        emit AdminTransferred(prev, _newAdmin);
    }

    // --- Voter Functions ---

    /**
     * @notice Casts a vote for a candidate in an active election
     * @dev Generates a cryptographic voteHash to preserve voter privacy while updating candidate tally
     * @param _electionId ID of the election
     * @param _candidateId Index of candidate voted for
     */
    function castVote(
        uint256 _electionId,
        uint256 _candidateId
    )
        external
        onlyDuringVoting(_electionId)
        onlyRegisteredVoter(_electionId)
        hasNotVoted(_electionId)
    {
        require(
            _candidateId < electionCandidates[_electionId].length,
            "BlockVote: Invalid candidate ID"
        );

        // Generate cryptographic hash of the vote for privacy & verification receipt
        bytes32 voteHash = keccak256(
            abi.encodePacked(msg.sender, _candidateId, _electionId, block.timestamp)
        );

        // Update voter status
        Voter storage voter = voters[_electionId][msg.sender];
        voter.hasVoted = true;
        voter.votedCandidateId = _candidateId;
        voter.voteHash = voteHash;

        // Update candidate & election tallies
        electionCandidates[_electionId][_candidateId].voteCount++;
        elections[_electionId].totalVotes++;

        emit VoteCast(_electionId, msg.sender, voteHash);
    }

    // --- View Functions ---

    /**
     * @notice Retrieves all candidates running in an election
     * @param _electionId ID of the election
     * @return Array of Candidate structs
     */
    function getCandidates(
        uint256 _electionId
    ) external view electionExists(_electionId) returns (Candidate[] memory) {
        return electionCandidates[_electionId];
    }

    /**
     * @notice Retrieves count of candidates in an election
     * @param _electionId ID of the election
     * @return Number of candidates
     */
    function getCandidateCount(
        uint256 _electionId
    ) external view electionExists(_electionId) returns (uint256) {
        return electionCandidates[_electionId].length;
    }

    /**
     * @notice Retrieves specific candidate details
     * @param _electionId ID of the election
     * @param _candidateId ID of candidate
     */
    function getCandidate(
        uint256 _electionId,
        uint256 _candidateId
    ) external view electionExists(_electionId) returns (Candidate memory) {
        require(
            _candidateId < electionCandidates[_electionId].length,
            "BlockVote: Candidate index out of bounds"
        );
        return electionCandidates[_electionId][_candidateId];
    }

    /**
     * @notice Checks voter status for an address
     * @param _electionId ID of the election
     * @param _voter Address to query
     * @return Voter struct details
     */
    function getVoter(
        uint256 _electionId,
        address _voter
    ) external view electionExists(_electionId) returns (Voter memory) {
        return voters[_electionId][_voter];
    }

    /**
     * @notice Retrieves election details
     * @param _electionId ID of the election
     * @return Election struct
     */
    function getElection(
        uint256 _electionId
    ) external view electionExists(_electionId) returns (Election memory) {
        return elections[_electionId];
    }

    /**
     * @notice Returns list of registered voter addresses for an election
     * @param _electionId ID of the election
     * @return Array of addresses
     */
    function getRegisteredVoters(
        uint256 _electionId
    ) external view electionExists(_electionId) returns (address[] memory) {
        return registeredVoters[_electionId];
    }

    /**
     * @notice Determines and returns the election winner
     * @param _electionId ID of the election
     * @return winnerCandidateId ID of candidate with highest votes
     * @return winnerName Name of candidate
     * @return winnerParty Party of candidate
     * @return winningVoteCount Vote count achieved by candidate
     */
    function getWinner(
        uint256 _electionId
    )
        external
        view
        electionExists(_electionId)
        returns (
            uint256 winnerCandidateId,
            string memory winnerName,
            string memory winnerParty,
            uint256 winningVoteCount
        )
    {
        uint256 candidateCount = electionCandidates[_electionId].length;
        require(candidateCount > 0, "BlockVote: No candidates in this election");

        uint256 maxVotes = 0;
        uint256 winningIndex = 0;

        for (uint256 i = 0; i < candidateCount; i++) {
            if (electionCandidates[_electionId][i].voteCount > maxVotes) {
                maxVotes = electionCandidates[_electionId][i].voteCount;
                winningIndex = i;
            }
        }

        Candidate memory winner = electionCandidates[_electionId][winningIndex];
        return (winner.id, winner.name, winner.party, winner.voteCount);
    }
}
