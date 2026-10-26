const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying BlockVote Smart Contract to network:", hre.network.name);
  console.log("--------------------------------------------------");

  const [deployer, voter1, voter2] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // 1. Deploy Voting contract
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.deployed();

  console.log(">>> Voting Contract deployed successfully!");
  console.log(">>> Contract Address:", voting.address);
  console.log(">>> Admin Address:   ", deployer.address);

  // 2. Create a sample election for demo purposes
  console.log("\nSetting up sample election for demo...");
  const currentTime = Math.floor(Date.now() / 1000);
  const startTime = currentTime - 300; // 5 minutes ago
  const endTime = currentTime + 86400 * 7; // 7 days from now

  const tx1 = await voting.createElection(
    "2026 Student Body Presidential Election",
    "Official university election to vote for the Student Government President.",
    startTime,
    endTime
  );
  await tx1.wait();
  console.log("Created Election ID: 1");

  // 3. Add 3 Candidates
  console.log("Adding sample candidates...");
  const txCand1 = await voting.addCandidate(
    1,
    "Alice Johnson",
    "Crypto Progressive Party",
    "Championing on-chain student governance, transparent club budgets, and campus web3 hubs."
  );
  await txCand1.wait();

  const txCand2 = await voting.addCandidate(
    1,
    "Bob Smith",
    "Decentralized Alliance",
    "Focused on peer-to-peer academic resources, green campus computing, and student privacy."
  );
  await txCand2.wait();

  const txCand3 = await voting.addCandidate(
    1,
    "Charlie Davis",
    "Open Source Initiative",
    "Pledging 100% open educational materials, tech hackathon grants, and digital freedom."
  );
  await txCand3.wait();
  console.log("Added 3 Candidates: Alice Johnson, Bob Smith, Charlie Davis");

  // 4. Register sample voters (deployer + additional accounts if available)
  console.log("Registering initial voters...");
  const txReg1 = await voting.registerVoter(1, deployer.address);
  await txReg1.wait();
  console.log(`Registered voter (Admin/Deployer): ${deployer.address}`);

  if (voter1) {
    const txReg2 = await voting.registerVoter(1, voter1.address);
    await txReg2.wait();
    console.log(`Registered voter 2: ${voter1.address}`);
  }
  if (voter2) {
    const txReg3 = await voting.registerVoter(1, voter2.address);
    await txReg3.wait();
    console.log(`Registered voter 3: ${voter2.address}`);
  }

  // 5. Set election phase to Voting (Phase 2: Created=0, Registration=1, Voting=2, Ended=3)
  const txPhase = await voting.setElectionPhase(1, 2); // Voting
  await txPhase.wait();
  console.log("Set Election Phase to 'Voting' (Phase 2)");

  // 6. Automatically sync deployed address to frontend contractABI.js
  const abiPath = path.join(__dirname, "../frontend/src/utils/contractABI.js");
  if (fs.existsSync(abiPath)) {
    let content = fs.readFileSync(abiPath, "utf8");
    content = content.replace(
      /export const CONTRACT_ADDRESS = ".*?";/,
      `export const CONTRACT_ADDRESS = "${voting.address}";`
    );
    fs.writeFileSync(abiPath, content);
    console.log("Updated frontend contractABI.js with new contract address.");
  }

  console.log("--------------------------------------------------");
  console.log("Deployment and setup complete!");
  console.log("Contract Address:", voting.address);
  console.log("--------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
