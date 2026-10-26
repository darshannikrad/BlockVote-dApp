# 🗳️ BlockVote — Decentralized E-Voting System

A blockchain-based decentralized application (dApp) for secure, transparent, and tamper-proof electronic voting built on Ethereum smart contracts.

## 📋 BT Mini-Project

**Project Title:** Develop a Blockchain based application dApp (de-centralized app) for e-voting system

## ✨ Features

- **Secure Voting** — One person, one vote enforced on-chain via smart contract
- **Election Management** — Admin creates elections with candidates, start/end times
- **Voter Registration** — Admin whitelists eligible voter Ethereum addresses
- **Vote Privacy** — Votes are hashed using keccak256 for cryptographic verification
- **Real-Time Results** — Transparent, instant vote counting on the blockchain
- **Election Phases** — Lifecycle management: Created → Registration → Voting → Ended
- **Winner Determination** — Automatic on-chain winner calculation
- **Event Logging** — All actions emit events for full auditability

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Solidity ^0.8.19** | Smart Contract Language |
| **Hardhat** | Ethereum Development Framework |
| **React.js 18** | Frontend UI Library |
| **Ethers.js v5** | Blockchain Interaction Library |
| **MetaMask** | Web3 Wallet Provider |
| **Chai + Mocha** | Testing Framework |

## 📦 Prerequisites

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **Git** (optional, for cloning)

## 🚀 Installation & Setup

### 1. Install Backend Dependencies
```bash
cd blockvote-dapp
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Compile Smart Contracts
```bash
npx hardhat compile
```

### 4. Run Tests
```bash
npx hardhat test
```

### 5. Start Local Blockchain
```bash
npx hardhat node
```

### 6. Deploy Contract (in a new terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Copy the deployed contract address and update it in `frontend/src/utils/contractABI.js`.

### 7. Configure MetaMask
1. Open MetaMask → Add Network
2. Network Name: `Hardhat Local`
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`
5. Currency: `ETH`
6. Import one of the Hardhat test accounts using the private key shown in terminal

### 8. Start Frontend
```bash
cd frontend
npm start
```
The app will open at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
blockvote-dapp/
├── contracts/
│   └── Voting.sol              # Solidity smart contract (450 lines)
├── scripts/
│   └── deploy.js               # Deployment script with sample data
├── test/
│   └── Voting.test.js          # Comprehensive test suite
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js              # Main React app with routing
│       ├── App.css             # Professional dark-theme styling
│       ├── index.js            # React entry point
│       ├── index.css           # Global CSS reset
│       ├── components/
│       │   ├── AdminPanel.js   # Election & candidate management
│       │   ├── VoterRegistration.js  # Voter status & registration
│       │   ├── VotingBooth.js  # Candidate selection & vote casting
│       │   ├── Results.js      # Live results with bar charts
│       │   ├── Header.js       # Navigation & wallet connection
│       │   └── Footer.js       # Project info footer
│       ├── context/
│       │   └── BlockchainContext.js  # Web3 state management
│       └── utils/
│           ├── contractABI.js  # Contract ABI & address
│           └── helpers.js      # Formatting utilities
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Backend dependencies
└── README.md
```

## 🔧 Usage

### As Admin (Contract Deployer):
1. Navigate to `/admin`
2. Create a new election
3. Add candidates (name, party, description)
4. Change phase to **Registration** → register voter addresses
5. Change phase to **Voting** → voters can now cast ballots
6. Change phase to **Ended** → results are finalized

### As Voter:
1. Connect MetaMask wallet
2. Check registration status at `/register`
3. Go to `/` (Voting Booth) when election is in Voting phase
4. Select a candidate and click "Cast Vote"
5. Confirm the transaction in MetaMask
6. View results at `/results`

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with verbose output
npx hardhat test --verbose
```

## 🌐 Deploying to Sepolia Testnet

1. Create a `.env` file:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key
```

2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

BT Mini-Project Team — Department of Computer Science & Engineering
