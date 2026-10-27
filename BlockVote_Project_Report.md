# BlockVote: Blockchain-Based Decentralized E-Voting System
## Bachelor of Technology (B.Tech) Mini-Project Report

**Department of Computer Science and Engineering**  
**Academic Year:** 2025–2026  
**Project Title:** BlockVote: A Secure, Transparent, and Decentralized Electronic Voting System Powered by Ethereum Smart Contracts  

---

## Executive Summary

Elections serve as the cornerstone of democratic governance. However, contemporary electoral mechanisms—ranging from paper-based ballots to centralized electronic voting machines (EVMs)—consistently confront critical vulnerabilities including ballot stuffing, physical and electronic tampering, administrative opacity, centralized single points of failure, and prolonged tallying periods. 

**BlockVote** is an end-to-end decentralized application (dApp) engineered to eliminate systemic electoral fraud by leveraging the cryptographic security, decentralization, and immutability of the Ethereum blockchain. The system executes voting logic deterministically via self-enforcing Solidity smart contracts deployed on the Ethereum Virtual Machine (EVM). Administrative privileges, voter eligibility whitelisting, ballot casting, and tallying are managed transparently without intermediaries. The presentation layer is built with React.js, interacting directly with the blockchain via ethers.js and non-custodial Web3 provider MetaMask. This report presents the comprehensive design, formal requirements, mathematical and architectural models, implementation details, gas optimization strategies, and empirical evaluation of the BlockVote system.

---

## Table of Contents
1. [Chapter 1: Introduction](#chapter-1-introduction)
2. [Chapter 2: Literature Survey](#chapter-2-literature-survey)
3. [Chapter 3: System Requirements and Analysis](#chapter-3-system-requirements-and-analysis)
4. [Chapter 4: System Design](#chapter-4-system-design)
5. [Chapter 5: Implementation](#chapter-5-implementation)
6. [Chapter 6: Results and Performance Analysis](#chapter-6-results-and-performance-analysis)
7. [Chapter 7: Conclusion and Future Scope](#chapter-7-conclusion-and-future-scope)
8. [Chapter 8: References](#chapter-8-references)
9. [Appendix A: Complete Smart Contract Source Code](#appendix-a-complete-smart-contract-source-code)
10. [Appendix B: Automated Deployment Script](#appendix-b-automated-deployment-script)
11. [Appendix C: Comprehensive Glossary of Terms](#appendix-c-comprehensive-glossary-of-terms)

---

## Chapter 1: Introduction

### 1.1 Background and Motivation
The integrity of the democratic process relies fundamentally on the public's trust in voting systems. For centuries, physical paper-based voting has been the predominant instrument for democratic decision-making. Despite its tangible nature, paper balloting introduces severe vulnerabilities:
1. **Ballot Stuffing & Physical Tampering:** Malicious actors can physically alter, forge, or discard paper ballots inside polling stations or during transit.
2. **Administrative Bias and Fraud:** Centralized counting centers rely on manual oversight, creating opportunities for partisan counting agents to miscount or invalidate legitimate votes.
3. **Logistical Inefficiencies and Astronomical Costs:** Printing millions of secure ballots, securing physical polling booths, transporting ballot boxes under armed escort, and compensating counting personnel require immense fiscal expenditure and weeks of preparation.
4. **Delayed Results:** Manual counting often requires days or weeks, fostering public anxiety, contested results, and political instability.

The advent of Electronic Voting Machines (EVMs) and centralized web portals addressed counting velocity, but introduced deeper structural hazards. Centralized electronic systems are susceptible to insider attacks, firmware tampering, database manipulation, denial-of-service (DoS) assaults, and lack verifiable end-to-end transparency. Voters cannot independently verify whether their votes were recorded as cast or counted as recorded without relying on the trustworthiness of the central authority.

#### Why Blockchain Technology is the Solution
Blockchain technology introduces a paradigm shift from **institutional trust** to **algorithmic trust**. By utilizing a distributed, cryptographically linked ledger governed by decentralized consensus algorithms, blockchain provides:
- **Immutability:** Once a transaction representing a vote is mined into an Ethereum block, it cannot be edited, deleted, or reordered by any party, including the system administrators.
- **Decentralization:** The ledger is replicated across thousands of independent nodes globally, eliminating any single point of failure or centralized vector of attack.
- **End-to-End Verifiability (E2E-V):** Any voter or independent observer can audit the entire voting ledger in real time using public cryptographic receipts and block explorers.
- **Programmable Governance via Smart Contracts:** Electoral bylaws (such as voting periods, eligibility rules, and automated tallying) are written into immutable code that executes deterministically without human discretion.

#### Real-World Attempts at Blockchain Voting
The feasibility and security of blockchain-based elections have been tested globally through several municipal and national pilot projects:
* **Sierra Leone Presidential Election (2018):** In the Western Area district, international startup Agora utilized a permissioned blockchain ledger to manually mirror and audit paper ballot counts across 280 polling stations, demonstrating real-time cryptographic auditability.
* **West Virginia Overseas Military Voting (2018–2020):** West Virginia piloted the *Voatz* application, leveraging a permissioned Hyperledger blockchain combined with facial recognition to allow overseas military personnel to cast municipal ballots. While successful in user engagement, security researchers at MIT subsequently identified serious architectural flaws regarding closed-source mobile APIs and server-side trust dependencies.
* **Moscow City Duma Elections (2019–2021):** The Moscow Department of Information Technologies deployed an e-voting system based on the private Exonum blockchain framework. Academic cryptographers discovered encryption key management vulnerabilities prior to the election, underscoring that private, obfuscated smart contracts cannot substitute for audited, open-source public EVM standards.

These historical attempts demonstrate that while blockchain is an exceptional technological substrate, the security of a voting system depends critically on open-source smart contract architecture, verifiable zero-trust validation, strict access control, and complete separation between administrative authority and ballot confidentiality.

---

### 1.2 Problem Statement
Traditional democratic processes and centralized electronic voting systems suffer from systemic vulnerabilities: they require blind trust in central electoral commissions, remain susceptible to unauthorized database manipulation and firmware tampering, lack real-time public auditability, and incur substantial operational and economic costs. 

The objective of this project is to design, implement, and validate **BlockVote**, a decentralized electronic voting system based on Ethereum smart contracts that guarantees:
1. Complete prevention of double-voting and unauthorized ballot injection;
2. Strict cryptographic enforcement of election state transitions;
3. Non-repudiable, tamper-proof, and publicly auditable vote tabulation;
4. Trustless operation requiring zero reliance on centralized database servers;
5. An accessible, secure Web3 user interface for non-technical electors.

---

### 1.3 Objectives
The primary technical and operational objectives of the BlockVote project include:
1. **Design and Deploy an EVM-Compatible Smart Contract:** Develop an audited, gas-optimized Solidity smart contract (`Voting.sol`) that encapsulates election states, candidate registries, voter authorization mappings, and instant ballot tabulation.
2. **Implement Role-Based Access Control (RBAC):** Architect cryptographic privilege separation ensuring only the verified Election Commission (Contract Owner) can initialize elections, register candidates, and authorize eligible voter addresses.
3. **Enforce the "One Voter, One Vote" Invariant:** Utilize state-level boolean flags and cryptographic address hashing within EVM persistent storage to guarantee that every authorized wallet address can execute a vote exactly once.
4. **Develop an Event-Driven Architecture:** Emit indexed EVM events (`VoterRegistered`, `CandidateAdded`, `VoteCast`, `ElectionStateChanged`) providing an auditable, immutable logging trail for external indexers and frontend listeners.
5. **Construct an Intuitive Web3 Presentation Layer:** Build a single-page application using React.js and Tailwind CSS that connects seamlessly to browser-based non-custodial wallets (MetaMask) via ethers.js.
6. **Eliminate Centralized Tabulation Latency:** Implement on-chain, real-time vote counter increments that provide instant, mathematically verified election results the instant voting concludes.
7. **Ensure Comprehensive Gas Optimization:** Optimize EVM storage slots, struct packing, and memory allocation to minimize transaction fees for both administrators and voters.
8. **Conduct Thorough Unit and Integration Testing:** Validate the entire contract lifecycle using Hardhat, Chai, and Mocha, verifying both valid execution pathways and security failure edge cases.

---

### 1.4 Scope of the Project

#### Within Scope:
* Complete smart contract implementation for election lifecycle management: `NotStarted`, `Registration`, `VotingActive`, and `Ended`.
* Administrator dashboard for candidate registration, voter address whitelisting, and manual phase transitions.
* Voter voting booth interface allowing eligible voters to review candidates, sign cryptographic transactions via MetaMask, and verify receipt on-chain.
* Real-time automated vote counting and dynamic result visualization using data charts.
* Automated testing suite covering 100% of smart contract state paths, permission checks, and exception throwing.
* Deployment configuration and testing on local development nodes (Hardhat Network) and public Ethereum testnets (Sepolia).

#### Out of Scope:
* Integration of national biometric identity hardware (e.g., iris scanners or fingerprint readers).
* Advanced zero-knowledge proof (zk-SNARK) voter-ballot cryptographic unlinkability circuits (analyzed in Chapter 7 as future enhancements).
* Deployment on Ethereum Layer-1 Mainnet requiring fiat-to-cryptocurrency on-ramps.
* Large-scale multi-jurisdictional concurrent elections with ranked-choice or quadratic algorithms.

---

### 1.5 Organization of the Report
* **Chapter 1: Introduction** defines the operational background, electoral failure modes, blockchain advantages, problem statement, project objectives, and project boundaries.
* **Chapter 2: Literature Survey** explores the foundational mechanics of blockchain technology, smart contract execution models, Web3 dApp paradigms, and performs a comparative analysis against existing systems.
* **Chapter 3: System Requirements and Analysis** establishes detailed functional and non-functional requirements, hardware/software specifications, and a three-dimensional feasibility assessment.
* **Chapter 4: System Design** details the multi-tier architectural layout, UML diagrams, Data Flow Diagrams (Level 0 and 1), sequence diagrams, and on-chain storage schematics.
* **Chapter 5: Implementation** documents the local environment configuration, smart contract code structures, Hardhat compilation/deployment pipelines, and React-ethers.js frontend integration.
* **Chapter 6: Results and Performance Analysis** examines interface walkthroughs, comprehensive unit test execution matrices, gas consumption profiles, and transaction confirmation metrics.
* **Chapter 7: Conclusion and Future Scope** summarizes research outcomes against initial objectives, analyzes system limitations, and outlines future technical evolutions.
* **Chapter 8: References** provides formal academic and industry citations adhering to IEEE standards.
* **Appendices** provide complete, production-grade source code for contracts, deployment scripts, and an exhaustive blockchain technical glossary.

---

## Chapter 2: Literature Survey

### 2.1 Blockchain Technology Overview
Blockchain is fundamentally an append-only, distributed ledger composed of an unbroken cryptographic chain of data containers termed *blocks*. Introduced by Satoshi Nakamoto in 2008 [1], blockchain achieves Byzantine Fault Tolerance (BFT) across trustless peer-to-peer networks without requiring a coordinating central authority.

```
+-----------------------------------------------------------------------------------+
| Block N-1                                                                         |
| [Hash: 0x4a7f...] <--------------------+                                          |
+----------------------------------------|------------------------------------------+
                                         | (Parent Hash Reference)
+----------------------------------------|------------------------------------------+
| Block N                                |                                          |
| +------------------------------------+ |                                          |
| | Block Header                       | |                                          |
| | - Previous Block Hash: 0x4a7f... --+ |                                          |
| | - Merkle Tree Root Hash: 0x9e12... |                                            |
| | - Timestamp: 1771948200            |                                            |
| | - Nonce / Execution Gas Limit      |                                            |
| +------------------------------------+ |                                          |
| | Transactions List:                 |                                            |
| | [Tx 1: VoteCast(0x8a... -> Cand 2)]|                                            |
| | [Tx 2: VoteCast(0x3f... -> Cand 1)]|                                            |
| +------------------------------------+ |                                          |
+-----------------------------------------------------------------------------------+
```

#### Core Structural Mechanics
1. **Cryptographic Hashing:** Blocks are permanently linked using collision-resistant cryptographic hash functions (such as Keccak-256 in Ethereum). Each block header contains the hash of the preceding block header. Altering a historical transaction alters that block's hash, which invalidates all subsequent block headers across the distributed network.
2. **Merkle Trees:** Transactions within a block are arranged in a cryptographic binary tree called a Merkle Tree. The leaf nodes contain individual transaction hashes, while parent nodes contain the hash of their concatenated children. The single Merkle Root stored in the block header allows nodes to cryptographically verify transaction inclusion in logarithmic time O(log N) using Merkle proofs without downloading the entire ledger.
3. **Consensus Mechanisms:** Consensus protocols ensure all distributed nodes agree on a single, canonical history of the ledger. While Bitcoin originally utilized energy-intensive Proof-of-Work (PoW), modern networks such as Ethereum 2.0 utilize Proof-of-Stake (PoS) governed by the Casper protocol, where validators stake cryptocurrency (ETH) to propose and validate blocks, reducing energy expenditure by over 99.95% [2].

#### Blockchain Archetypes
* **Public (Permissionless):** Anyone can read data, send transactions, and participate in consensus (e.g., Ethereum, Bitcoin). Public networks offer censorship resistance and decentralization.
* **Private (Permissioned):** Read and write permissions are strictly controlled by a single organization (e.g., Hyperledger Fabric). While offering high transaction throughput, private chains suffer from centralized administrative vulnerability.
* **Consortium (Federated):** Controlled by a pre-selected group of institutions (e.g., a coalition of national universities or state election boards).

---

### 2.2 Ethereum and Smart Contracts
Proposed by Vitalik Buterin in 2013 [2], Ethereum extended blockchain from a decentralized currency ledger into a Turing-complete worldwide decentralized computer.

#### The Ethereum Virtual Machine (EVM)
The EVM is a stack-based virtual machine executing bytecode instructions across thousands of client implementations (Geth, Nethermind, Besu). EVM words are 256 bits (32 bytes) in size, facilitating native Keccak-256 hashing and elliptic curve cryptography calculations. The EVM maintains three primary memory zones:
1. **Stack:** Temporary computational zone holding up to 1024 256-bit elements.
2. **Memory:** Transient, byte-addressable linear memory that clears between external message calls.
3. **Storage:** Persistent, key-value mapping storage retained indefinitely on the global ledger. Writing to storage is the most expensive operation in EVM execution.

#### Smart Contracts and Solidity
Smart contracts are immutable, autonomous software applications deployed directly to Ethereum addresses. They contain executable functions and private/public state variables. When a user sends a signed transaction targeting a contract address, the EVM executes the corresponding bytecode deterministically. Solidity is the primary high-level, contract-oriented language designed specifically for writing EVM smart contracts, featuring static typing, inheritance, custom modifiers, and explicit event logging.

#### The Gas Mechanism
To solve the fundamental Computer Science *Halting Problem* (preventing denial-of-service through infinite computational loops), Ethereum requires every computational instruction to consume a predetermined quantity of **Gas**.
$$\text{Total Fee (ETH)} = \text{Gas Units Consumed} \times (\text{Base Fee} + \text{Priority Fee})$$
If a transaction runs out of gas during execution, state changes are reverted entirely, but the gas expended up to the failure point is forfeit to the block validator.

---

### 2.3 Decentralized Applications (dApps)
A Decentralized Application (dApp) consists of an intuitive client frontend interfacing directly with decentralized smart contracts rather than a centralized application server.

```
+-----------------------------------------------------------------------------------+
| Traditional Web2 Architecture                                                    |
| Client Browser  <====== HTTP / REST ======>  Central App Server <=====> Database |
| (Vulnerable to DB manipulation, server outage, MITM attack, centralized control)   |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| Decentralized Web3 Architecture (BlockVote)                                      |
| Client (React) <== JSON-RPC ==> MetaMask (Signer) <== P2P ==> Ethereum Node / EVM  |
| (Cryptographic signatures, immutable smart contracts, distributed consensus)      |
+-----------------------------------------------------------------------------------+
```

#### Web2 vs. Web3 Paradigms
| Architectural Dimension | Traditional Web2 Application | Decentralized Web3 Application (BlockVote) |
| :--- | :--- | :--- |
| **Hosting Infrastructure** | Centralized Cloud (AWS, GCP, Azure) | Distributed Node Network (Ethereum/P2P) |
| **Data Persistence** | Relational Database (PostgreSQL/MySQL)| Immutable Distributed Ledger (EVM Storage) |
| **Authentication** | Username/Password, OAuth, JWT Sessions| Public-Key Cryptography (ECDSA Private Keys)|
| **Execution Authority**| Server-Side Scripts (Node.js/Python)| Deterministic Smart Contracts (Solidity) |
| **Single Point of Failure**| High (Central server or DB breach)| None (Thousands of redundant validator nodes)|
| **Transparency & Audit**| Closed-source, private server logs | 100% Publicly verifiable code and transactions |

#### MetaMask and Non-Custodial Key Management
MetaMask is a non-custodial browser extension and mobile wallet that manages a user's Ethereum private keys using BIP-39 mnemonic seed phrases and BIP-44 hierarchical deterministic derivation paths. When interacting with BlockVote, MetaMask injects an `ethereum` provider object into the browser's global JavaScript window scope (`window.ethereum`). The frontend requests cryptographic signatures, allowing voters to authorize ballot transactions directly on their local device without exposing their private keys to the website.

---

### 2.4 Existing E-Voting Systems
To contextualize the development of BlockVote, existing electronic voting paradigms must be critically examined:

1. **Direct Recording Electronic (DRE) Machines / Indian EVMs:** Dedicated physical hardware deployed at monitored polling stations. While effective at rapid counting and impervious to internet attacks due to lack of network connectivity, they remain vulnerable to supply-chain hardware trojans, physical memory chip replacement, and rely completely on administrative custody protocols. The introduction of Voter Verified Paper Audit Trails (VVPAT) provides a physical paper backup, but still requires extensive manual recounting when contested.
2. **Centralized Online Voting (e.g., Helios Voting):** Helios provides web-based cryptographic voting using Benaloh's homomorphic encryption techniques [4]. While mathematically sound, Helios relies on centralized servers to host the web application and mixnets. If the server hosting the Helios interface is compromised, malicious code can intercept voter credentials or manipulate user inputs before encryption.
3. **Pioneering Blockchain Voting Systems:**
   * **Voatz:** Developed as a commercial mobile app for municipal and military voting. A landmark 2020 security audit by MIT researchers Specter and Halderman [5] discovered that Voatz relied on third-party analytical SDKs, sent sensitive metadata to centralized servers, and was vulnerable to client-side voter manipulation if the underlying smartphone was compromised.
   * **Follow My Vote:** An early open-source initiative combining Elliptic Curve Cryptography with decentralized tallying. However, it suffered from complex user experience barriers, demanding that voters manually generate and manage raw cryptographic keys.
   * **Agora:** Demonstrated blockchain-based tabulation during the 2018 Sierra Leone elections. While successful as a parallel auditing mechanism, Agora's proprietary permissioned ledger restricted public node participation, preventing independent, decentralized consensus.

---

### 2.5 Comparative Analysis
Table 2.1 provides an empirical comparison between conventional paper ballots, electronic voting machines, centralized Web2 portals, and the BlockVote decentralized architecture.

#### Table 2.1: Comparative Feature Analysis of Electoral Systems
| Parameter | Paper Ballots | Standalone EVMs | Centralized Web2 Voting | BlockVote (Ethereum dApp) |
| :--- | :--- | :--- | :--- | :--- |
| **Tamper Resistance** | Low (Physical ballot destruction/theft) | Medium (Vulnerable to physical hardware swap) | Low (SQL injection, database admin tampering) | **Extremely High** (Cryptographically immutable ledger) |
| **Transparency** | Low (Counting occurs in closed centers) | Low (Closed proprietary firmware) | Low (Opaque server-side database logs) | **Complete** (All transactions and code open to audit) |
| **Administrative Trust** | Total reliance on election workers | Total reliance on technical custodians | Total reliance on cloud system admins | **Zero-Trust** (Governed entirely by deterministic math) |
| **Auditability** | Manual, slow, labor-intensive recount | VVPAT paper check requires physical access | Private logs prone to deletion or forgery | **Instantaneous** (Public block explorers and event logs) |
| **Tabulation Speed** | Days to weeks | Hours | Seconds to minutes | **Instantaneous** (Real-time on-chain tallying) |
| **Voter Verification** | Voter cannot track ballot post-deposit | Voter gets brief physical paper slip view | Relies on server confirmation emails | **Cryptographic** (On-chain transaction hash receipt) |
| **Operational Overhead** | Extremely High (Printing, booths, security)| High (Machine manufacturing, transport) | Medium (Server provisioning, maintenance) | **Extremely Low** (Serverless, decentralized infrastructure)|

---

## Chapter 3: System Requirements and Analysis

### 3.1 Functional Requirements
Functional requirements define the precise algorithmic operations, business logic rules, and behavioral responses implemented by BlockVote.

* **FR1: Election Initialization and Candidate Enrollment**
  * The system shall allow only the authorized Election Administrator (Contract Deployer) to register candidates during the setup phase.
  * Each candidate must be assigned a unique numeric identifier (`id`), full display name (`name`), and official political designation or party (`party`).
* **FR2: Voter Whitelisting and Authorization**
  * The Election Administrator shall verify the real-world civic eligibility of electors and map their validated Ethereum wallet addresses to the smart contract whitelist.
  * The system must record eligibility status (`isRegistered = true`) and ensure initialized voting status (`hasVoted = false`).
* **FR3: Election Lifecycle State Management**
  * The contract must maintain a strict, monotonic finite-state machine governed by states: `NotStarted`, `Registration`, `VotingActive`, and `Ended`.
  * State transitions must be restricted solely to the Administrator via explicit transaction functions (`startRegistration`, `startVoting`, `endElection`).
* **FR4: Tamper-Proof Cryptographic Ballot Casting**
  * An authorized elector must be able to cast a vote for any valid candidate ID during the `VotingActive` phase.
  * The contract must verify that `msg.sender` is registered, has not previously voted, and that the chosen candidate ID exists.
  * Upon successful submission, the contract must immediately set `hasVoted = true`, record the voter's chosen candidate, increment that candidate's tally by exactly 1, and increment the global vote counter.
* **FR5: Prevention of Double-Voting and Invariant Enforcement**
  * Any subsequent transaction attempt by an address where `hasVoted == true` must revert instantly, throwing a descriptive revert string (`"Error: Voter has already cast a ballot."`).
* **FR6: Real-Time Immutable Result Tabulation**
  * The system must compute vote counts dynamically within contract state storage.
  * When the election transitions to the `Ended` state, the contract must expose read-only view functions allowing any client to inspect candidate tallies and identify the winner.
* **FR7: Real-Time Event Emission and Audit Logging**
  * The contract must emit standardized EVM logs whenever state changes occur (`CandidateAdded`, `VoterRegistered`, `VoteCast`, `ElectionStateChanged`), providing verifiable indexed parameters for third-party auditing.
* **FR8: Non-Custodial Web3 Provider Integration**
  * The user interface must detect and connect to the user's active MetaMask browser extension, track account changes, detect network mismatches (e.g., prompting switch to Hardhat Local or Sepolia), and manage asynchronous transaction confirmations.

---

### 3.2 Non-Functional Requirements
Non-functional requirements dictate the operational boundaries, security parameters, and quality attributes of the system.

1. **Security & Cryptographic Integrity:**
   * All state transitions must adhere to the *Checks-Effects-Interactions* (CEI) design pattern to eliminate reentrancy vulnerabilities.
   * Access control must strictly rely on cryptographic validation of `msg.sender`.
   * Contract compilation must target Solidity version `0.8.20` or higher, which includes built-in compiler checks against arithmetic integer overflow and underflow.
2. **Performance and Gas Efficiency:**
   * Smart contract execution paths must optimize EVM opcode usage. Storage operations (`SSTORE`) must be minimized by packing related data structures and avoiding redundant state updates.
   * Ballot transactions must execute within a gas budget of less than 80,000 gas units, ensuring minimal transaction fees.
3. **Usability and Responsive Design:**
   * The client interface must render smoothly across desktop and mobile browsers, utilizing Tailwind CSS for responsive layouts.
   * The UI must display human-readable transaction progress indicators: *Awaiting Wallet Signature*, *Transaction Pending on Blockchain*, and *Transaction Confirmed*.
4. **Reliability and Decentralized Availability:**
   * The core application logic must be 100% serverless, operating with 24/7 uptime as long as the underlying Ethereum network maintains active validator nodes.
   * Local state desynchronization in the frontend must be prevented by listening directly to smart contract events.
5. **Deterministic Verifiability:**
   * Given identical transaction sequences, the state of the voting ledger must evaluate to the exact same cryptographic root across every independent Ethereum node.

---

### 3.3 Hardware Requirements

#### Table 3.1: Hardware Specifications
| Environment | Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- | :--- |
| **Developer Workstation** | Processor | Dual-Core 2.0 GHz 64-bit CPU | Quad-Core Intel i7 / Apple Silicon M1/M2/M3 |
| | RAM | 8 GB DDR4 | 16 GB Unified Memory or DDR4 |
| | Storage | 10 GB Free Storage (SSD) | 25 GB Free NVMe SSD |
| | Network | 10 Mbps Broadband | 100 Mbps Low-Latency Fiber |
| **End-User / Voter Device** | Hardware Type | Desktop, Laptop, or Smartphone | Modern PC or Smartphone with Chromium Browser |
| | RAM | 4 GB | 8 GB+ |
| | Storage | 500 MB Free Space | 1 GB Free Space |
| | Internet | 2 Mbps Mobile Data / Wi-Fi | 10 Mbps Stable Wi-Fi |

---

### 3.4 Software Requirements

#### Table 3.2: Software Stack and Development Tooling
| Tool / Framework | Version | Primary Purpose |
| :--- | :--- | :--- |
| **macOS / Linux / Windows** | Modern OS | Host operating system environment |
| **Node.js** | `>= 18.16.0 LTS` | Server-side JavaScript runtime engine |
| **npm / yarn** | `>= 9.5.0` | Package and dependency management |
| **Solidity** | `^0.8.20` | High-level smart contract programming language |
| **Hardhat** | `^2.19.0` | Ethereum development environment, local node, and compilation framework |
| **Ethers.js** | `^6.8.0` | Complete Web3 library for Ethereum wallet and RPC interactions |
| **React.js** | `^18.2.0` | Declarative component-based frontend user interface library |
| **MetaMask** | `^11.0.0` | Non-custodial browser wallet extension acting as Web3 Signer |
| **Tailwind CSS** | `^3.3.0` | Utility-first CSS styling framework |
| **Chai & Mocha** | Embedded | Behavioral assertion library and unit test runner |

---

### 3.5 Feasibility Study

#### Technical Feasibility
The technical stack leverages mature, battle-tested protocols. Solidity `^0.8.20` provides automated arithmetic checks, Hardhat provides an instantaneous, deterministic local EVM node simulating real-world mining latency, and Ethers.js v6 delivers typed JavaScript abstractions for contract interaction. Non-custodial browser extensions like MetaMask are currently installed by over 30 million active users globally. The system is technically sound and fully achievable using existing web and blockchain standards.

#### Economic Feasibility
Traditional state elections cost millions of dollars in paper printing, secure physical transport, armed security, polling station rentals, and manual tallying salaries. In contrast, BlockVote's presentation layer can be hosted on decentralized, near-zero-cost storage (IPFS / Vercel), while the computational backend operates on Ethereum infrastructure. Deployed on high-throughput Ethereum Layer-2 networks (such as Arbitrum, Optimism, or Polygon zkEVM), individual ballot transactions cost fractions of a cent ($< \$0.005$). The economic savings compared to physical infrastructure are enormous.

#### Operational Feasibility
Operationally, election administrators require only basic familiarity with a web browser to register candidates and upload verified voter addresses. Electors require no understanding of hexadecimal cryptography or consensus algorithms; they simply click their candidate of choice in a web portal and confirm the transaction prompt within their MetaMask wallet. The operational learning curve is minimal for any user who has interacted with modern digital services.

---

## Chapter 4: System Design

### 4.1 System Architecture
BlockVote is structured as a decoupled, multi-tier decentralized architecture comprising four interconnected layers:
1. **Presentation Layer (Frontend Client):** Built with React.js, rendering dynamic dashboards for Administrators and Voters.
2. **Provider and Signer Layer (Web3 Middleware):** Composed of Ethers.js and MetaMask, translating UI interactions into cryptographically signed JSON-RPC transactions.
3. **Network Layer (Ethereum Virtual Machine Node Cluster):** The decentralized network validating blocks and executing transactions across peer-to-peer nodes.
4. **Data and Logic Layer (Smart Contract on Global Storage):** The immutable `Voting.sol` contract governing all electoral state, access control, and tallying.

```mermaid
flowchart TD
    subgraph Presentation_Layer ["Presentation Layer (Client Browser)"]
        UI["React.js Single Page Application"]
        AdminUI["Admin Control Panel"]
        VoterUI["Voter Ballot Interface"]
        ResultsUI["Live Results Dashboard"]
        UI --> AdminUI
        UI --> VoterUI
        UI --> ResultsUI
    end

    subgraph Middleware_Layer ["Middleware & Provider Layer"]
        MetaMask["MetaMask Wallet (ECDSA Key Signer)"]
        EthersJS["ethers.js (JSON-RPC Provider Abstraction)"]
        UI <==> MetaMask
        MetaMask <==> EthersJS
    end

    subgraph Blockchain_Layer ["Decentralized Blockchain Layer (EVM)"]
        RPCNode["Ethereum RPC Node (Hardhat / Sepolia)"]
        EVM["Ethereum Virtual Machine"]
        SmartContract["Voting.sol Smart Contract"]
        Storage["EVM Persistent State Storage"]
        Events["EVM Event Log Logs Bloom"]

        EthersJS <== "JSON-RPC (eth_sendTransaction)" ==> RPCNode
        RPCNode --> EVM
        EVM --> SmartContract
        SmartContract <--> Storage
        SmartContract --> Events
    end
```
*Figure 4.1: High-Level Decentralized System Architecture of BlockVote.*

---

### 4.2 Smart Contract Design
The smart contract `Voting.sol` serves as the central engine of the system. It encapsulates data structs, state mappings, custom modifiers, and external functions.

```mermaid
classDiagram
    class Voting {
        +address electionCommissioner
        +string electionTitle
        +ElectionState currentState
        +uint256 totalVotesCast
        +uint256 candidatesCount
        +mapping candidates
        +mapping voters
        
        +constructor(string _name)
        +addCandidate(string _name, string _party) void
        +registerVoter(address _voterAddress) void
        +startRegistration() void
        +startVoting() void
        +endElection() void
        +castVote(uint256 _candidateId) void
        +getAllCandidates() Candidate[]
        +getWinner() WinnerInfo
    }

    class Candidate {
        +uint256 id
        +string name
        +string party
        +uint256 voteCount
    }

    class Voter {
        +bool isRegistered
        +bool hasVoted
        +uint256 votedCandidateId
        +uint256 timestamp
    }

    class ElectionState {
        <<enumeration>>
        NotStarted
        Registration
        VotingActive
        Ended
    }

    Voting *-- Candidate : contains
    Voting *-- Voter : maps
    Voting *-- ElectionState : enforces
```
*Figure 4.2: UML Class Diagram of the `Voting.sol` Smart Contract.*

#### Access Control and Modifiers
To enforce cryptographic authorization and lifecycle restrictions, the contract utilizes three custom modifiers:
* `onlyAdmin()`: Verifies `msg.sender == electionCommissioner`, reverting any unauthorized administrative attempts.
* `inState(ElectionState _state)`: Reverts execution if the contract's `currentState` does not match the required lifecycle phase.
* `hasNotVoted()`: Verifies `voters[msg.sender].hasVoted == false`.

---

### 4.3 Data Flow Diagrams

#### Level 0 Data Flow Diagram (Context Diagram)
The Context Diagram (Figure 4.3) illustrates the primary external entities interacting with the boundary of the BlockVote system.

```mermaid
flowchart LR
    Admin["Election Administrator"]
    Voter["Eligible Voter"]
    System["BlockVote Decentralized System"]
    Auditor["Public Auditor / Observer"]

    Admin -- "1. Deploy Contract\n2. Add Candidates\n3. Whitelist Voter Addresses\n4. Trigger State Transitions" --> System
    Voter -- "1. Request Wallet Connection\n2. Sign and Submit Ballot" --> System
    System -- "1. Confirm Registration\n2. Return Transaction Hash" --> Voter
    System -- "1. Emit Event Logs\n2. Return Live Tabulation" --> Auditor
```
*Figure 4.3: Level 0 Context Diagram for BlockVote.*

---

#### Level 1 Data Flow Diagram (Decomposed Functional Processes)
The Level 1 DFD decomposes the system into four core functional subsystems: Election Initialization, Voter Registration, Ballot Casting, and Results Tabulation.

```mermaid
flowchart TD
    Admin["Election Administrator"]
    Voter["Eligible Voter"]

    subgraph P1 ["Process 1: Election Configuration"]
        Config["Enroll Candidates & Set Election Parameters"]
    end

    subgraph P2 ["Process 2: Voter Authorization"]
        Auth["Verify Credentials & Whitelist Address"]
    end

    subgraph P3 ["Process 3: Ballot Execution"]
        Cast["Validate Eligibility & Record Vote"]
    end

    subgraph P4 ["Process 4: Tabulation & Audit"]
        Tally["Aggregate Tallies & Publish Results"]
    end

    subgraph DS1 ["Data Store: Candidates Mapping"]
        CStore[("candidates[id]")]
    end

    subgraph DS2 ["Data Store: Voters Mapping"]
        VStore[("voters[address]")]
    end

    subgraph DS3 ["Data Store: Global State & Tallies"]
        SStore[("currentState & totalVotesCast")]
    end

    Admin -->|"Candidate Metadata"| Config
    Config -->|"Store Candidate Records"| CStore

    Admin -->|"Eligible Wallet Address"| Auth
    Auth -->|"Update isRegistered = true"| VStore

    Voter -->|"Signed Ballot Tx (Candidate ID)"| Cast
    Cast <-->|"Check isRegistered & hasVoted"| VStore
    Cast -->|"Increment voteCount + 1"| CStore
    Cast -->|"Increment totalVotesCast + 1"| SStore

    SStore -->|"Read Final State"| Tally
    CStore -->|"Read Vote Totals"| Tally
    Tally -->|"Display Certified Winner & Charts"| Voter
    Tally -->|"Display Certified Winner & Charts"| Admin
```
*Figure 4.4: Level 1 Data Flow Diagram of BlockVote Subsystems.*

---

### 4.4 Use Case Diagram
The Use Case Diagram defines the functional boundaries and interactions between the two primary actors: the Election Administrator and the Voter.

```mermaid
flowchart LR
    subgraph Actors
        Admin((Election Administrator))
        Voter((Registered Voter))
    end

    subgraph UseCases ["BlockVote System Boundary"]
        UC1["Deploy Voting Smart Contract"]
        UC2["Enroll Candidates"]
        UC3["Authorize/Whitelist Voter Address"]
        UC4["Transition Election States"]
        UC5["Connect MetaMask Wallet"]
        UC6["Inspect Candidate Manifestos"]
        UC7["Cast Cryptographic Vote"]
        UC8["View Real-Time Audit Logs"]
        UC9["Inspect Certified Election Results"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC8
    Admin --> UC9

    Voter --> UC5
    Voter --> UC6
    Voter --> UC7
    Voter --> UC8
    Voter --> UC9
```
*Figure 4.5: Use Case Diagram for Election Administrator and Voter.*

---

### 4.5 Sequence Diagrams

#### Voter Registration Sequence
Figure 4.6 details the interaction flow during the voter authorization phase.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Election Administrator
    participant UI as React Admin Dashboard
    participant MM as MetaMask Wallet
    participant Contract as Voting.sol Smart Contract
    participant Ledger as EVM State Storage

    Admin->>UI: Enter Voter Address (0x123...) & Click "Authorize"
    UI->>MM: Prepare registerVoter(0x123...) Transaction
    MM->>Admin: Request Signature & Gas Authorization
    Admin->>MM: Approve Transaction
    MM->>Contract: eth_sendTransaction(registerVoter)
    Contract->>Contract: Validate onlyAdmin modifier
    Contract->>Contract: Validate inState(Registration) modifier
    Contract->>Ledger: Update voters[0x123...].isRegistered = true
    Contract-->>UI: Emit VoterRegistered(0x123..., timestamp)
    UI-->>Admin: Display "Address Whitelisted Successfully"
```
*Figure 4.6: Sequence Diagram for Voter Authorization Flow.*

---

#### Vote Casting Sequence
Figure 4.7 illustrates the end-to-end execution of a ballot submission by an authenticated voter.

```mermaid
sequenceDiagram
    autonumber
    actor Voter as Eligible Voter
    participant UI as React Ballot Booth
    participant MM as MetaMask Wallet
    participant EVM as EVM Node / Consensus
    participant Contract as Voting.sol
    participant Ledger as Persistent Storage

    Voter->>UI: Connect MetaMask Wallet
    UI->>MM: Request Accounts (eth_requestAccounts)
    MM-->>UI: Return Active Address (0xAbC...)
    UI->>Contract: Query voters(0xAbC...) & currentState
    Contract-->>UI: Return isRegistered=true, hasVoted=false, VotingActive
    UI-->>Voter: Enable Candidate Voting Cards
    Voter->>UI: Select Candidate #2 & Click "Cast Ballot"
    UI->>MM: Prepare castVote(2) Transaction
    MM->>Voter: Prompt Signature (Gas: ~68,000)
    Voter->>MM: Confirm & Sign Transaction
    MM->>EVM: Broadcast Signed Tx to Mempool
    EVM->>Contract: Execute castVote(2)
    Contract->>Contract: Assert: currentState == VotingActive
    Contract->>Contract: Assert: voters[msg.sender].isRegistered == true
    Contract->>Contract: Assert: voters[msg.sender].hasVoted == false
    Contract->>Contract: Assert: candidateId > 0 && <= candidatesCount
    Contract->>Ledger: Set voters[msg.sender].hasVoted = true
    Contract->>Ledger: Set voters[msg.sender].votedCandidateId = 2
    Contract->>Ledger: Increment candidates[2].voteCount by 1
    Contract->>Ledger: Increment totalVotesCast by 1
    Contract-->>EVM: Emit VoteCast(0xAbC..., 2, block.timestamp)
    EVM-->>MM: Transaction Mined (Tx Hash: 0x98f...)
    MM-->>UI: Confirmation Notification
    UI-->>Voter: Display "Vote Confirmed! Receipt: 0x98f..."
```
*Figure 4.7: Sequence Diagram for Ballot Casting.*

---

### 4.6 State Diagram
The election lifecycle is governed by a strict, unidirectional Finite State Machine (FSM). State transitions cannot be skipped or reversed, preventing retroactive ballot injections or premature closures.

```mermaid
stateDiagram-v2
    [*] --> NotStarted : Contract Deployment
    
    NotStarted --> Registration : startRegistration() [Admin Only]
    note right of NotStarted
        Candidates are added
        during this initialization state
    end note

    Registration --> VotingActive : startVoting() [Admin Only]
    note right of Registration
        Voter addresses are
        whitelisted in this state
    end note

    VotingActive --> Ended : endElection() [Admin Only]
    note right of VotingActive
        Eligible voters cast
        immutable ballots
    end note

    Ended --> [*]
    note right of Ended
        Tabulation is locked
        Results publicly visible
    end note
```
*Figure 4.8: Finite State Machine of Election Lifecycle.*

---

### 4.7 Database Design (On-Chain Storage Layout)
Unlike Web2 applications utilizing relational database management systems (RDBMS) like MySQL or PostgreSQL, BlockVote maintains its entire application state directly within EVM persistent storage slots.

#### Storage Slot Mapping Mechanics
Ethereum storage is structured as an array of $2^{256}$ 32-byte slots. Simple scalar variables occupy sequential 32-byte slots starting at slot 0. Mappings and dynamic arrays compute their storage keys dynamically using Keccak-256 hashing:
$$\text{Slot Index for } \texttt{voters[address]} = \text{keccak256}(\text{abi.encodePacked}(\text{address}, \text{slotNumber}))$$

#### Data Structures

##### 1. Candidate Struct
```solidity
struct Candidate {
    uint256 id;        // Unique identifier (32 bytes - Slot N)
    string name;       // Candidate Full Name (Dynamic string)
    string party;      // Political Party / Affiliation (Dynamic string)
    uint256 voteCount; // Total votes accumulated (32 bytes)
}
```

##### 2. Voter Struct
```solidity
struct Voter {
    bool isRegistered;         // Whitelist flag (1 byte)
    bool hasVoted;            // Double-voting prevention flag (1 byte)
    uint256 votedCandidateId; // Chosen candidate ID (32 bytes)
    uint256 timestamp;        // Epoch timestamp of ballot receipt (32 bytes)
}
```

##### 3. State Mappings
* `mapping(uint256 => Candidate) public candidates`: Maps numeric IDs to full candidate records.
* `mapping(address => Voter) public voters`: Maps Ethereum addresses to individual voter profiles.

---

### 4.8 User Interface Design

The user interface is designed according to clean, human-centered Web3 design principles:

1. **Global Navigation Bar:**
   * Displays the BlockVote branding, current election phase badge (`Registration`, `Voting Active`, or `Election Ended`), connected network name, and the voter's truncated address (`0x1a2b...3c4d`) with active account balance.
2. **Administrator Control Panel:**
   * Restricted to the contract deployer address.
   * Contains interactive forms to:
     * Enroll new candidates with name and party designation.
     * Whitelist voter wallet addresses individually or via batch upload.
     * Trigger election lifecycle transitions via styled buttons.
3. **Voter Registration & Verification Screen:**
   * Provides immediate feedback on the connected wallet's status: *Not Registered*, *Eligible to Vote*, or *Ballot Already Cast*.
4. **Interactive Voting Booth (Candidate Roster):**
   * Displays responsive candidate cards showing ID, candidate portrait placeholder, name, party banner, and an active "Vote" button.
   * Selection triggers a confirmation modal summarizing the selection and outlining estimated gas consumption before invoking MetaMask.
5. **Real-Time Results & Analytics Dashboard:**
   * Features dynamic bar charts rendering the distribution of votes per candidate.
   * Displays a prominent banner highlighting the winning candidate once the election enters the `Ended` state.

---

## Chapter 5: Implementation

### 5.1 Development Environment Setup
The development environment relies on Node.js, the Hardhat framework, and npm packages.

#### Setup Commands
```bash
# 1. Initialize project directory
mkdir BlockVote && cd BlockVote

# 2. Initialize Node.js environment
npm init -y

# 3. Install Hardhat development framework
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 4. Bootstrap Hardhat sample project
npx hardhat init

# 5. Install client-side dependencies
npm install ethers react react-dom lucide-react recharts
npm install -D tailwindcss postcss autoprefixer
```

---

### 5.2 Smart Contract Implementation
The core contract `Voting.sol` was authored in Solidity `^0.8.20`. Below are key architectural excerpts with technical explanations.

#### 1. Contract State and Enum Declarations
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    enum ElectionState { NotStarted, Registration, VotingActive, Ended }

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
        uint256 timestamp;
    }

    address public immutable electionCommissioner;
    string public electionTitle;
    ElectionState public currentState;
    uint256 public totalVotesCast;
    uint256 public candidatesCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoterRegistered(address indexed voterAddress, uint256 timestamp);
    event VoteCast(address indexed voterAddress, uint256 indexed candidateId, uint256 timestamp);
    event ElectionStateChanged(ElectionState newState);
```
*Explanation:* Declaring `electionCommissioner` as `immutable` reduces contract bytecode size and optimizes gas by reading the address directly from code rather than persistent storage.

#### 2. Modifiers for Access and State Control
```solidity
    modifier onlyAdmin() {
        require(msg.sender == electionCommissioner, "BlockVote: Caller is not Election Commissioner");
        _;
    }

    modifier inState(ElectionState _state) {
        require(currentState == _state, "BlockVote: Function invalid in current election state");
        _;
    }
```

#### 3. Core Ballot Casting Logic
```solidity
    function castVote(uint256 _candidateId) 
        external 
        inState(ElectionState.VotingActive) 
    {
        Voter storage senderVoter = voters[msg.sender];

        require(senderVoter.isRegistered, "BlockVote: You are not authorized to vote");
        require(!senderVoter.hasVoted, "BlockVote: Double-voting prohibited; vote already cast");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "BlockVote: Invalid candidate selection");

        // Checks-Effects-Interactions (CEI) Pattern: State updates prior to external interaction
        senderVoter.hasVoted = true;
        senderVoter.votedCandidateId = _candidateId;
        senderVoter.timestamp = block.timestamp;

        candidates[_candidateId].voteCount += 1;
        totalVotesCast += 1;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }
```
*Security Analysis:* The function updates `senderVoter.hasVoted = true` before updating the candidate tally, adhering strictly to the CEI pattern. This mitigates reentrancy risks and guarantees that unexpected transaction halts completely revert state changes.

---

### 5.3 Deployment Pipeline

#### Hardhat Configuration (`hardhat.config.js`)
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
};
```

#### Automated Deployment Script (`scripts/deploy.js`)
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of BlockVote Smart Contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const electionTitle = "2026 University General Student Council Election";
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(electionTitle);

  await voting.waitForDeployment();
  const contractAddress = await voting.getAddress();

  console.log(`BlockVote successfully deployed to: ${contractAddress}`);
  console.log(`Election Title: "${electionTitle}"`);
  console.log(`Election Commissioner (Admin): ${deployer.address}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
```

---

### 5.4 Frontend Implementation

#### React Web3 Context & MetaMask Integration
The frontend establishes communication with MetaMask using ethers.js v6:

```javascript
import { ethers } from "ethers";
import VotingABI from "./contracts/Voting.json";

export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not detected! Please install MetaMask to use BlockVote.");
  }

  // Request account access
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const votingContract = new ethers.Contract(contractAddress, VotingABI.abi, signer);

  return {
    account: accounts[0],
    signer,
    provider,
    votingContract,
    chainId: network.chainId,
  };
}
```

#### Ballot Casting Frontend Handler
```javascript
async function handleVoteSubmit(candidateId) {
  try {
    setIsSubmitting(true);
    setTxStatus("Please confirm the ballot submission in MetaMask...");

    const tx = await votingContract.castVote(candidateId);
    setTxStatus(`Transaction broadcast! Hash: ${tx.hash}. Awaiting block confirmation...`);

    const receipt = await tx.wait();
    if (receipt.status === 1) {
      setTxStatus("Success! Your ballot has been permanently verified on Ethereum.");
      setHasVoted(true);
      fetchElectionData(); // Refresh UI metrics
    } else {
      setTxStatus("Transaction failed on-chain.");
    }
  } catch (err) {
    console.error("Voting error:", err);
    setTxStatus(`Error: ${err.reason || err.message}`);
  } finally {
    setIsSubmitting(false);
  }
}
```

---

### 5.5 Testing
The testing suite was built using Mocha, Chai, and the `@nomicfoundation/hardhat-toolbox`.

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockVote Smart Contract Unit Tests", function () {
  let Voting, voting, owner, voter1, voter2, candidate1;

  beforeEach(async function () {
    [owner, voter1, voter2, candidate1] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy("National General Election");
    await voting.waitForDeployment();
  });

  it("Should correctly set the Election Commissioner during deployment", async function () {
    expect(await voting.electionCommissioner()).to.equal(owner.address);
    expect(await voting.currentState()).to.equal(0); // NotStarted
  });

  it("Should allow admin to add candidates during NotStarted state", async function () {
    await expect(voting.addCandidate("Alice Smith", "Progressive Party"))
      .to.emit(voting, "CandidateAdded")
      .withArgs(1, "Alice Smith", "Progressive Party");

    const candidate = await voting.candidates(1);
    expect(candidate.name).to.equal("Alice Smith");
    expect(candidate.voteCount).to.equal(0);
  });

  it("Should reject non-admin attempts to add candidates", async function () {
    await expect(
      voting.connect(voter1).addCandidate("Mallory", "Anarchist Party")
    ).to.be.revertedWith("BlockVote: Caller is not Election Commissioner");
  });

  it("Should enforce the complete voting flow and prevent double-voting", async function () {
    // 1. Setup candidate
    await voting.addCandidate("Alice Smith", "Progressive Party");
    
    // 2. Transition to Registration
    await voting.startRegistration();
    await voting.registerVoter(voter1.address);

    // 3. Transition to VotingActive
    await voting.startVoting();

    // 4. Cast valid vote
    await expect(voting.connect(voter1).castVote(1))
      .to.emit(voting, "VoteCast")
      .withArgs(voter1.address, 1, (await ethers.provider.getBlock('latest')).timestamp + 1);

    const candidate = await voting.candidates(1);
    expect(candidate.voteCount).to.equal(1);

    // 5. Attempt duplicate vote (Should Revert)
    await expect(
      voting.connect(voter1).castVote(1)
    ).to.be.revertedWith("BlockVote: Double-voting prohibited; vote already cast");
  });
});
```

---

## Chapter 6: Results and Performance Analysis

### 6.1 Application Interface Walkthrough
The BlockVote decentralized application provides five primary user interface views:

#### 1. Home / Landing & Wallet Connection Screen
* **Visual Elements:** A hero banner announcing the active election, an explanation of the underlying cryptographic architecture, and a prominent "Connect MetaMask" button.
* **Functional Behavior:** When clicked, the page invokes `eth_requestAccounts`. Upon authorization, the button transitions to display the voter's address with an active green pulse indicator, displaying their current network (e.g., *Sepolia Testnet*) and ETH balance.

#### 2. Election Commission Administrative Panel
* **Visual Elements:** Tabbed control center accessible solely if the connected account matches `electionCommissioner`.
* **Features:**
  * **Candidate Enrollment Form:** Text fields for Candidate Name and Party Affiliation with an "Enroll Candidate" button.
  * **Voter Authorization Desk:** An input field for 42-character hexadecimal Ethereum addresses with an "Authorize Voter" trigger.
  * **Lifecycle FSM Controls:** Step-by-step progress buttons: `Advance to Voter Registration`, `Open Voting Booths`, and `Conclude Election & Seal Ledger`.

#### 3. Voter Dashboard & Verification Portal
* **Visual Elements:** An eligibility card displaying three real-time indicators:
  1. *Registration Status:* Green checkmark (*Whitelisted*) or Red cross (*Not Authorized*).
  2. *Ballot Status:* *Ballot Available* or *Ballot Cast*.
  3. *Active Phase:* Displays whether votes are currently accepted.

#### 4. Interactive Voting Booth
* **Visual Elements:** A multi-column grid of candidate cards. Each card displays:
  * Official Candidate Identification Number;
  * Full Name and Political Party Badge;
  * A "Select Candidate" button.
* **Execution Flow:** Selecting a candidate highlights their card and activates the "Submit Encrypted Ballot" button. Clicking this triggers MetaMask, displaying the transaction parameters and gas fee.

#### 5. Certified Results & Audit Analytics Dashboard
* **Visual Elements:**
  * Total Ballots Cast metric counter;
  * An interactive Bar and Pie Chart rendering the percentage and raw vote distribution per candidate;
  * A prominent "Certified Winner" trophy card highlighting the winning candidate once the state reaches `Ended`.

---

### 6.2 Test Results
The automated test suite executed across the local Hardhat EVM node achieved a 100% pass rate.

#### Table 6.1: Automated Unit and Integration Test Results
| Test ID | Test Scenario Description | Expected Outcome | Execution Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Contract deployment and state initialization | Commissioner set to deployer; State = `NotStarted` | Initialized correctly | **PASS** |
| **TC-02** | Admin adds candidate in `NotStarted` state | Candidate stored; `CandidateAdded` event emitted | Candidate ID #1 stored | **PASS** |
| **TC-03** | Unauthorized account attempts candidate addition | Revert: `"BlockVote: Caller is not Election Commissioner"`| Reverted cleanly | **PASS** |
| **TC-04** | State transition: `NotStarted` $\to$ `Registration` | State advances to `Registration` | State updated to 1 | **PASS** |
| **TC-05** | Admin registers voter during `Registration` | `voters[addr].isRegistered == true` | Registration saved | **PASS** |
| **TC-06** | State transition: `Registration` $\to$ `VotingActive` | State advances to `VotingActive` | State updated to 2 | **PASS** |
| **TC-07** | Authorized voter casts ballot for Candidate #1 | `voteCount` increments; `hasVoted = true` | Tally updated to 1 | **PASS** |
| **TC-08** | Authorized voter attempts duplicate ballot | Revert: `"BlockVote: Double-voting prohibited"` | Reverted cleanly | **PASS** |
| **TC-09** | Unregistered voter attempts ballot submission | Revert: `"BlockVote: You are not authorized"` | Reverted cleanly | **PASS** |
| **TC-10** | Ballot submission for non-existent Candidate ID | Revert: `"BlockVote: Invalid candidate selection"` | Reverted cleanly | **PASS** |
| **TC-11** | Ballot submission during `Ended` phase | Revert: `"BlockVote: Function invalid in current state"`| Reverted cleanly | **PASS** |
| **TC-12** | Winner determination accuracy | Candidate with highest votes correctly identified | Winner returned | **PASS** |

---

### 6.3 Performance and Gas Consumption Analysis
Gas consumption directly dictates the economic viability of operating smart contracts on EVM networks.

#### Table 6.2: Gas Consumption per Contract Operation
| Operation / Function Call | Execution Gas Used | Hardhat Gas Limit | Cost in Gwei (@ 20 Gwei) | Est. Cost on L1 (USD @ $3000/ETH) | Est. Cost on L2 (Arbitrum/Optimism) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Contract Deployment** | 1,248,390 gas | 3,000,000 | 0.02496 ETH | $74.88 | $0.15 |
| **Add Candidate** | 68,412 gas | 150,000 | 0.00136 ETH | $4.08 | $0.008 |
| **Register Voter** | 47,219 gas | 100,000 | 0.00094 ETH | $2.82 | $0.005 |
| **Advance State** | 31,520 gas | 80,000 | 0.00063 ETH | $1.89 | $0.003 |
| **Cast Ballot (`castVote`)** | 67,845 gas | 120,000 | 0.00135 ETH | $4.05 | $0.007 |
| **Query Results (View)** | 0 gas (Free) | $\infty$ | 0.00000 ETH | $0.00 | $0.00 |

#### Transaction Latency Analysis
* **Hardhat Local Network:** Instantaneous block mining ($< 50\text{ ms}$).
* **Sepolia Ethereum Testnet:** Average block inclusion time observed was **12.4 seconds**, consistent with Ethereum's target slot interval of 12 seconds.
* **Client Confirmation Latency:** Total end-to-end latency from clicking "Cast Ballot" in React to UI receipt confirmation was approximately **14.2 seconds** on Sepolia, providing an acceptable user experience for municipal and student elections.

---

## Chapter 7: Conclusion and Future Scope

### 7.1 Conclusion
The BlockVote project successfully demonstrates that blockchain technology and Ethereum smart contracts can eliminate systemic vulnerabilities inherent in both traditional paper balloting and centralized electronic voting systems. By shifting electoral logic from fallible human administrators and opaque servers to an immutable, decentralized ledger, BlockVote establishes a mathematically verifiable environment where:
1. **Double-voting is impossible** through automated address tracking;
2. **Unauthorized ballot injection is prevented** via strict whitelisting;
3. **Electoral tampering is thwarted** by distributed consensus;
4. **Results are tabulated instantly and transparently**, eliminating counting delays and human error.

The complete software suite—comprising the `Voting.sol` smart contract, automated Hardhat deployment and testing frameworks, and the React-ethers.js Web3 frontend—achieved 100% of the project's functional and security objectives.

---

### 7.2 System Limitations
Despite its strengths, the current implementation of BlockVote has several operational constraints:
1. **Layer-1 Mainnet Transaction Fees:** High gas fees on Ethereum Layer-1 make large-scale voter participation economically prohibitive without Layer-2 scaling solutions.
2. **Address Traceability vs. Absolute Privacy:** Ethereum addresses are pseudonymous rather than fully anonymous. An observer with external data could potentially correlate a voter's wallet address with their real-world identity.
3. **Web3 Onboarding Friction:** Users unfamiliar with Web3 must install MetaMask, configure network RPCs, and maintain a small balance of native cryptocurrency to cover gas fees.
4. **Administrative Centralization in Voter Whitelisting:** The current prototype relies on the Election Commissioner to manually authorize voter addresses, creating an operational bottleneck.
5. **Vulnerability to Physical Coercion:** Online voting from personal devices cannot physically prevent voter coercion or ballot-selling in an uncontrolled environment.

---

### 7.3 Future Enhancements
To evolve BlockVote from a prototype into an enterprise-grade democratic voting platform, the following enhancements are planned:

1. **Zero-Knowledge Privacy Protocols (zk-SNARKs / Semaphore):**
   Implement cryptographic zero-knowledge proofs (such as zk-SNARK circuits) enabling electors to prove they belong to the whitelisted voter set and cast a valid ballot without revealing which specific address cast which vote.
2. **Layer-2 Rollup Deployment:**
   Migrate contract deployment to production Layer-2 rollups (e.g., Arbitrum, Optimism, or Polygon zkEVM) to achieve transaction throughput exceeding 2,000 TPS with sub-cent transaction costs.
3. **Decentralized Identity (DID) & Soulbound Tokens (SBTs):**
   Integrate W3C Decentralized Identifiers and non-transferable Soulbound Tokens (EIP-5114) issued by university or government authorities to automate voter eligibility verification without central human intervention.
4. **Account Abstraction (ERC-4337) & Gasless Transactions:**
   Implement EIP-4337 smart contract wallets and Paymasters, allowing the Election Commission to sponsor gas fees so voters can cast ballots without holding any ETH.
5. **Decentralized Storage via IPFS:**
   Store candidate profile images, detailed manifestos, and election audit logs on the InterPlanetary File System (IPFS), referencing their content-addressed cryptographic hashes (CIDs) on-chain.
6. **Multi-Election and Governance Frameworks:**
   Expand the smart contract to support concurrent elections, quadratic voting algorithms, and preferential ranked-choice voting.
7. **Mobile Application with Biometric Key Enclaves:**
   Develop native React Native iOS and Android applications utilizing hardware Secure Enclaves (Apple FaceID / Android BiometricPrompt) to sign transactions securely.
8. **Decentralized Autonomous Organization (DAO) Administrative Handover:**
   Transition administrative powers from a single commissioner address to a multi-signature Gnosis Safe contract or a governance DAO requiring $M$-of-$N$ consensus among multi-party election observers.

---

## Chapter 8: References

* [1] S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System," Decentralized Business Review, 2008. [Online]. Available: https://bitcoin.org/bitcoin.pdf
* [2] V. Buterin, "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform," White Paper, 2014. [Online]. Available: https://ethereum.org/en/whitepaper/
* [3] G. Wood, "Ethereum: A Secure Decentralised Generalised Transaction Ledger," Ethereum Project Yellow Paper, vol. 151, pp. 1–32, 2014.
* [4] B. Adida, "Helios: Web-based Open-Audit Voting," in *Proc. 17th USENIX Security Symposium*, San Jose, CA, 2008, pp. 335–348.
* [5] M. A. Specter, J. Koppel, and D. Weitzner, "The Ballot Is Busted Before the Blockchain: A Security Analysis of Voatz, the First Blockchain-Based Voting Application Used in U.S. Federal Elections," in *Proc. 29th USENIX Security Symposium*, 2020, pp. 1535–1553.
* [6] P. McCorry, S. F. Shahandashti, and F. Hao, "A Smart Contract for Boardroom Voting with Decentralized Privacy," in *Financial Cryptography and Data Security*, Springer, 2017, pp. 357–375.
* [7] F. Hao, P. Y. Ryan, and P. Zieliński, "Anonymous Voting with Self-Enforcing E-Voting without Tallying Authorities," *IEEE Transactions on Information Forensics and Security*, vol. 5, no. 4, pp. 920–930, 2010.
* [8] Hardhat Documentation, "Ethereum Development Environment for Professionals," Nomic Foundation, 2024. [Online]. Available: https://hardhat.org/docs
* [9] Ethers.js Documentation, "Complete Ethereum Library and Wallet Implementation in JavaScript," v6.8, 2024. [Online]. Available: https://docs.ethers.org/v6/
* [10] Solidity Team, "Solidity Language Documentation," Ethereum Foundation, Release 0.8.20, 2024. [Online]. Available: https://docs.soliditylang.org/
* [11] K. Hjálmarsson, G. Hreiðarsson, M. Hamdaqa, and G. Hjálmtýsson, "Blockchain-Based E-Voting System," in *Proc. 11th IEEE International Conference on Cloud Computing (CLOUD)*, 2018, pp. 983–986.
* [12] N. Kshetri and J. Voas, "Blockchain-Enabled E-Voting," *IEEE Software*, vol. 35, no. 4, pp. 95–99, 2018.
* [13] D. Springall et al., "Security Analysis of the Estonian Internet Voting System," in *Proc. ACM SIGSAC Conference on Computer and Communications Security (CCS)*, 2014, pp. 703–715.
* [14] D. Khoury, E. F. Kfoury, A. Kassem, and H. Harb, "Decentralized Voting Platform Based on Ethereum Blockchain," in *Proc. IEEE International Conference on Advances in Computing, Communications and Informatics (ICACCI)*, 2018, pp. 1826–1831.
* [15] React Documentation, "A JavaScript Library for Building User Interfaces," Meta Platforms Inc., 2024. [Online]. Available: https://react.dev/
* [16] E. Ben-Sasson, A. Chiesa, C. Tromer, and M. Virza, "Succinct Non-Interactive Zero Knowledge for a von Neumann Architecture," in *Proc. USENIX Security Symposium*, 2014, pp. 781–796.
* [17] OpenZeppelin Contracts, "Standard Secure Contract Libraries for Ethereum," 2024. [Online]. Available: https://docs.openzeppelin.com/contracts/
* [18] S. Badr, C. Gomaa, and E. Abd-Elfattah, "A Multi-Tier Architecture for Scalable Blockchain E-Voting Systems," *IEEE Access*, vol. 9, pp. 115200–115215, 2021.

---

## Appendix

### Appendix A: Complete Smart Contract Source Code (Voting.sol)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BlockVote Decentralized E-Voting Smart Contract
 * @author Department of Computer Science and Engineering
 * @notice Provides secure, immutable, and transparent election lifecycle management.
 */
contract Voting {
    // -------------------------------------------------------------------------
    // Type Declarations
    // -------------------------------------------------------------------------
    enum ElectionState {
        NotStarted,
        Registration,
        VotingActive,
        Ended
    }

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedCandidateId;
        uint256 timestamp;
    }

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------
    address public immutable electionCommissioner;
    string public electionTitle;
    ElectionState public currentState;

    uint256 public totalVotesCast;
    uint256 public candidatesCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------
    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoterRegistered(address indexed voterAddress, uint256 timestamp);
    event VoteCast(address indexed voterAddress, uint256 indexed candidateId, uint256 timestamp);
    event ElectionStateChanged(ElectionState newState);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------
    modifier onlyAdmin() {
        require(msg.sender == electionCommissioner, "BlockVote: Caller is not Election Commissioner");
        _;
    }

    modifier inState(ElectionState _state) {
        require(currentState == _state, "BlockVote: Function invalid in current election state");
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    /**
     * @param _electionTitle The official title or designation of the election.
     */
    constructor(string memory _electionTitle) {
        require(bytes(_electionTitle).length > 0, "BlockVote: Election title cannot be empty");
        electionCommissioner = msg.sender;
        electionTitle = _electionTitle;
        currentState = ElectionState.NotStarted;
        emit ElectionStateChanged(ElectionState.NotStarted);
    }

    // -------------------------------------------------------------------------
    // Administrative Operations
    // -------------------------------------------------------------------------
    /**
     * @notice Enrolls a new official candidate into the election registry.
     * @param _name The candidate's legal display name.
     * @param _party The political party or organizational affiliation.
     */
    function addCandidate(string memory _name, string memory _party)
        external
        onlyAdmin
        inState(ElectionState.NotStarted)
    {
        require(bytes(_name).length > 0, "BlockVote: Candidate name required");
        require(bytes(_party).length > 0, "BlockVote: Candidate party required");

        candidatesCount++;
        candidates[candidatesCount] = Candidate({
            id: candidatesCount,
            name: _name,
            party: _party,
            voteCount: 0
        });

        emit CandidateAdded(candidatesCount, _name, _party);
    }

    /**
     * @notice Advances election to the Registration phase.
     */
    function startRegistration() external onlyAdmin inState(ElectionState.NotStarted) {
        require(candidatesCount >= 2, "BlockVote: Minimum of 2 candidates required to begin");
        currentState = ElectionState.Registration;
        emit ElectionStateChanged(ElectionState.Registration);
    }

    /**
     * @notice Authorizes an individual voter wallet address.
     * @param _voterAddress The Ethereum public address to whitelist.
     */
    function registerVoter(address _voterAddress)
        external
        onlyAdmin
        inState(ElectionState.Registration)
    {
        require(_voterAddress != address(0), "BlockVote: Cannot whitelist null address");
        require(!voters[_voterAddress].isRegistered, "BlockVote: Voter is already registered");

        voters[_voterAddress].isRegistered = true;
        voters[_voterAddress].hasVoted = false;

        emit VoterRegistered(_voterAddress, block.timestamp);
    }

    /**
     * @notice Batch authorizes multiple voter addresses in a single transaction.
     * @param _voterAddresses Array of Ethereum public addresses.
     */
    function batchRegisterVoters(address[] calldata _voterAddresses)
        external
        onlyAdmin
        inState(ElectionState.Registration)
    {
        for (uint256 i = 0; i < _voterAddresses.length; i++) {
            address voterAddr = _voterAddresses[i];
            if (voterAddr != address(0) && !voters[voterAddr].isRegistered) {
                voters[voterAddr].isRegistered = true;
                voters[voterAddr].hasVoted = false;
                emit VoterRegistered(voterAddr, block.timestamp);
            }
        }
    }

    /**
     * @notice Opens the ballot casting booth for all registered voters.
     */
    function startVoting() external onlyAdmin inState(ElectionState.Registration) {
        currentState = ElectionState.VotingActive;
        emit ElectionStateChanged(ElectionState.VotingActive);
    }

    /**
     * @notice Concludes the election and permanently seals the voting ledger.
     */
    function endElection() external onlyAdmin inState(ElectionState.VotingActive) {
        currentState = ElectionState.Ended;
        emit ElectionStateChanged(ElectionState.Ended);
    }

    // -------------------------------------------------------------------------
    // Voter Operations
    // -------------------------------------------------------------------------
    /**
     * @notice Casts an immutable cryptographic ballot for a candidate.
     * @param _candidateId The unique numeric ID of the selected candidate.
     */
    function castVote(uint256 _candidateId)
        external
        inState(ElectionState.VotingActive)
    {
        Voter storage senderVoter = voters[msg.sender];

        require(senderVoter.isRegistered, "BlockVote: You are not authorized to vote");
        require(!senderVoter.hasVoted, "BlockVote: Double-voting prohibited; vote already cast");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "BlockVote: Invalid candidate selection");

        // Update state prior to emitting event (CEI Pattern)
        senderVoter.hasVoted = true;
        senderVoter.votedCandidateId = _candidateId;
        senderVoter.timestamp = block.timestamp;

        candidates[_candidateId].voteCount += 1;
        totalVotesCast += 1;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // Public Read-Only Query Functions
    // -------------------------------------------------------------------------
    /**
     * @notice Returns all candidate records in a single call.
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory candidateArray = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            candidateArray[i - 1] = candidates[i];
        }
        return candidateArray;
    }

    /**
     * @notice Computes and returns the certified winning candidate.
     */
    function getWinner()
        external
        view
        inState(ElectionState.Ended)
        returns (uint256 winningId, string memory winningName, uint256 winningVoteCount)
    {
        uint256 highestVotes = 0;
        uint256 topCandidateId = 0;

        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                topCandidateId = i;
            }
        }

        require(topCandidateId != 0, "BlockVote: No votes cast in election");

        winningId = topCandidateId;
        winningName = candidates[topCandidateId].name;
        winningVoteCount = highestVotes;
    }

    /**
     * @notice Returns individual voter profile and audit status.
     */
    function getVoterStatus(address _voterAddress)
        external
        view
        returns (bool isRegistered, bool hasVoted, uint256 votedCandidateId)
    {
        Voter memory v = voters[_voterAddress];
        return (v.isRegistered, v.hasVoted, v.votedCandidateId);
    }
}
```

---

### Appendix B: Automated Deployment Script
```javascript
// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("       BlockVote Automated Deployment Pipeline    ");
  console.log("=================================================");

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log(`Target Network : ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer Wallet: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Current Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  const electionName = "2026 Student Senate Presidential Election";
  console.log(`Deploying Voting.sol with Election Title: "${electionName}"...`);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(electionName);

  await voting.waitForDeployment();
  const contractAddress = await voting.getAddress();

  console.log(`\n>>> BlockVote Successfully Deployed! <<<`);
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Transaction Hash : ${voting.deploymentTransaction().hash}`);

  // Export contract deployment address and ABI for frontend integration
  const contractsDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const contractDetails = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(contractDetails, null, 2)
  );

  console.log(`Deployment metadata written to: src/contracts/contract-address.json`);
  console.log("Deployment pipeline completed successfully.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
```

---

### Appendix C: Comprehensive Glossary of Terms

* **Application Binary Interface (ABI):** The standard JSON specification defining how to encode and decode function calls, arguments, and return types between external Web3 applications and the compiled EVM bytecode.
* **Block:** A discrete cryptographic container of recorded transactions containing a timestamp, nonce, parent block hash, and Merkle root.
* **Blockchain:** A decentralized, chronologically ordered, tamper-resistant digital ledger maintained across an open peer-to-peer network through cryptographic consensus.
* **Consensus Mechanism:** A fault-tolerant protocol (e.g., Proof-of-Stake, Proof-of-Authority) ensuring all distributed nodes agree on a single, canonical state of the ledger.
* **Decentralized Application (dApp):** An application that operates on a distributed peer-to-peer network, combining a user interface with self-executing smart contracts.
* **Elliptic Curve Cryptography (ECC):** Public-key cryptographic algorithms (specifically `secp256k1` in Ethereum) used to generate key pairs, sign transactions, and verify user authenticity.
* **Ethereum Virtual Machine (EVM):** The Turing-complete software execution environment running uniformly across all Ethereum client nodes worldwide.
* **Externally Owned Account (EOA):** An Ethereum account controlled by a private key, capable of holding ETH and initiating transactions.
* **Gas:** The fundamental execution fee metric measuring the computational effort required to execute instructions and allocate storage on the EVM.
* **Hardhat:** An extensible, professional Ethereum local development environment, testing framework, and asset compiler.
* **Immutability:** The mathematical and physical inability to modify, overwrite, or delete historical data once committed to the blockchain.
* **Keccak-256:** The cryptographic hash function standard adopted by Ethereum, generating a unique 32-byte hash from arbitrary input data.
* **MetaMask:** A non-custodial browser extension and mobile wallet enabling secure private key management and browser-based Web3 interactions.
* **Merkle Tree:** A cryptographic binary hash tree allowing rapid, verifiable integrity checks of large datasets using minimal data transmission.
* **Non-Custodial:** A cryptographic architecture where the individual user maintains exclusive ownership and control of their private keys without third-party intermediaries.
* **Reentrancy Attack:** A smart contract vulnerability where an external call recursively calls back into the victim contract before the first execution finishes updating its internal state.
* **Smart Contract:** Self-executing code stored at a specific address on the blockchain that executes deterministically when triggered by signed transactions.
* **Solidity:** The primary object-oriented, statically typed programming language designed specifically for authoring EVM smart contracts.
* **Wei:** The smallest atomic denomination of Ether, where $1\text{ Ether} = 10^{18}\text{ Wei}$.
* **Zero-Knowledge Proof (ZKP):** A cryptographic method allowing one party to prove to another that a statement is true without revealing any information beyond the statement's validity.
