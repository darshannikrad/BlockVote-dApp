import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contractABI";

const BlockchainContext = createContext(null);

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState(null);
  const [adminAddress, setAdminAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [electionCount, setElectionCount] = useState(0);
  const [selectedElectionId, setSelectedElectionId] = useState(1);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voterStatus, setVoterStatus] = useState({
    isRegistered: false,
    hasVoted: false,
    votedCandidateId: 0,
    voteHash: "",
  });

  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }

  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 6000);
  }, []);

  // Initialize Provider & Read-Only Contract
  const initContract = useCallback(async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        const net = await web3Provider.getNetwork();
        setNetwork(net);

        const votingContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          web3Provider
        );
        setContract(votingContract);

        // Fetch Admin
        try {
          const adm = await votingContract.admin();
          setAdminAddress(adm);
        } catch (e) {
          console.warn("Could not fetch admin. Contract may not be deployed yet:", e.message);
        }

        // Fetch Election Count
        try {
          const count = await votingContract.electionCount();
          setElectionCount(Number(count));
        } catch (e) {
          console.warn("Could not fetch election count:", e.message);
        }

        // Check if accounts already connected
        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          const currentSigner = web3Provider.getSigner();
          setSigner(currentSigner);
          const signedContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            currentSigner
          );
          setContract(signedContract);
        }
      } else {
        // Fallback for browsers without MetaMask: Read-only local RPC or info
        const fallbackProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        setProvider(fallbackProvider);
        const fallbackContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          fallbackProvider
        );
        setContract(fallbackContract);
      }
    } catch (err) {
      console.error("Initialization error:", err);
    }
  }, []);

  // Connect MetaMask Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      showNotification("MetaMask is not installed. Please install MetaMask to use BlockVote.", "error");
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const currentAccount = accounts[0];
        setAccount(currentAccount);

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const currentSigner = web3Provider.getSigner();
        setSigner(currentSigner);

        const signedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          currentSigner
        );
        setContract(signedContract);

        const net = await web3Provider.getNetwork();
        setNetwork(net);

        const adm = await signedContract.admin();
        setAdminAddress(adm);
        setIsAdmin(currentAccount.toLowerCase() === adm.toLowerCase());

        showNotification("Wallet connected successfully!", "success");
      }
    } catch (err) {
      console.error("Connect error:", err);
      showNotification(err.message || "Failed to connect wallet", "error");
    } finally {
      setLoading(false);
    }
  };

  // Check admin status when account or adminAddress changes
  useEffect(() => {
    if (account && adminAddress) {
      setIsAdmin(account.toLowerCase() === adminAddress.toLowerCase());
    } else {
      setIsAdmin(false);
    }
  }, [account, adminAddress]);

  // Load election details
  const loadElectionData = useCallback(
    async (electionId = selectedElectionId) => {
      if (!contract) return;
      try {
        setLoading(true);
        const count = await contract.electionCount();
        const totalElections = Number(count);
        setElectionCount(totalElections);

        if (totalElections === 0) {
          setElection(null);
          setCandidates([]);
          return;
        }

        const validId = Math.min(Math.max(1, electionId), totalElections);
        setSelectedElectionId(validId);

        const el = await contract.getElection(validId);
        setElection({
          id: Number(el.id),
          name: el.name,
          description: el.description,
          startTime: Number(el.startTime),
          endTime: Number(el.endTime),
          phase: Number(el.phase),
          totalVotes: Number(el.totalVotes),
        });

        // Also fetch candidates
        await loadCandidates(validId);

        // If user connected, check voter status
        if (account) {
          await checkVoterStatus(validId, account);
        }
      } catch (err) {
        console.error("Error loading election data:", err);
      } finally {
        setLoading(false);
      }
    },
    [contract, account, selectedElectionId]
  );

  // Load candidate list for current election
  const loadCandidates = useCallback(
    async (electionId = selectedElectionId) => {
      if (!contract) return;
      try {
        const rawCandidates = await contract.getCandidates(electionId);
        const formatted = rawCandidates.map((c) => ({
          id: Number(c.id),
          name: c.name,
          party: c.party,
          description: c.description,
          voteCount: Number(c.voteCount),
        }));
        setCandidates(formatted);
      } catch (err) {
        console.error("Error loading candidates:", err);
        setCandidates([]);
      }
    },
    [contract, selectedElectionId]
  );

  // Check voter status
  const checkVoterStatus = useCallback(
    async (electionId = selectedElectionId, voterAddress = account) => {
      if (!contract || !voterAddress) return;
      try {
        const v = await contract.getVoter(electionId, voterAddress);
        setVoterStatus({
          isRegistered: Boolean(v.isRegistered),
          hasVoted: Boolean(v.hasVoted),
          votedCandidateId: Number(v.votedCandidateId),
          voterAddress: v.voterAddress,
          voteHash: v.voteHash,
        });
      } catch (err) {
        console.error("Error checking voter status:", err);
        setVoterStatus({
          isRegistered: false,
          hasVoted: false,
          votedCandidateId: 0,
          voteHash: "",
        });
      }
    },
    [contract, account, selectedElectionId]
  );

  // Cast a Vote
  const castVote = async (candidateId) => {
    if (!contract || !signer) {
      showNotification("Please connect your wallet first", "error");
      return;
    }
    try {
      setTxPending(true);
      const tx = await contract.castVote(selectedElectionId, candidateId);
      showNotification("Vote transaction submitted. Awaiting confirmation...", "info");
      const receipt = await tx.wait();

      // Retrieve vote hash from events
      const voteEvent = receipt.events?.find((e) => e.event === "VoteCast");
      const hash = voteEvent?.args?.voteHash || "Confirmed";

      showNotification(`Vote cast successfully! Receipt: ${hash.substring(0, 10)}...`, "success");
      await loadElectionData(selectedElectionId);
      return receipt;
    } catch (err) {
      console.error("Vote cast error:", err);
      const reason = err.reason || err.data?.message || err.message || "Failed to cast vote";
      showNotification(reason, "error");
      throw err;
    } finally {
      setTxPending(false);
    }
  };

  // Admin: Create Election
  const createElection = async (name, description, startTime, endTime) => {
    if (!contract || !signer) throw new Error("Wallet not connected");
    try {
      setTxPending(true);
      const tx = await contract.createElection(name, description, startTime, endTime);
      showNotification("Creating election on blockchain...", "info");
      await tx.wait();
      showNotification("Election created successfully!", "success");
      const newCount = await contract.electionCount();
      setElectionCount(Number(newCount));
      setSelectedElectionId(Number(newCount));
      await loadElectionData(Number(newCount));
    } catch (err) {
      console.error("Create election error:", err);
      showNotification(err.reason || err.message, "error");
      throw err;
    } finally {
      setTxPending(false);
    }
  };

  // Admin: Add Candidate
  const addCandidate = async (electionId, name, party, description) => {
    if (!contract || !signer) throw new Error("Wallet not connected");
    try {
      setTxPending(true);
      const tx = await contract.addCandidate(electionId, name, party, description);
      showNotification("Adding candidate on blockchain...", "info");
      await tx.wait();
      showNotification(`Candidate "${name}" added successfully!`, "success");
      await loadCandidates(electionId);
    } catch (err) {
      console.error("Add candidate error:", err);
      showNotification(err.reason || err.message, "error");
      throw err;
    } finally {
      setTxPending(false);
    }
  };

  // Admin: Register Voter
  const registerVoter = async (electionId, voterAddr) => {
    if (!contract || !signer) throw new Error("Wallet not connected");
    try {
      setTxPending(true);
      const tx = await contract.registerVoter(electionId, voterAddr);
      showNotification(`Registering voter ${voterAddr.substring(0, 8)}...`, "info");
      await tx.wait();
      showNotification("Voter registered successfully!", "success");
      if (account.toLowerCase() === voterAddr.toLowerCase()) {
        await checkVoterStatus(electionId, account);
      }
    } catch (err) {
      console.error("Register voter error:", err);
      showNotification(err.reason || err.message, "error");
      throw err;
    } finally {
      setTxPending(false);
    }
  };

  // Admin: Set Election Phase
  const setElectionPhase = async (electionId, newPhase) => {
    if (!contract || !signer) throw new Error("Wallet not connected");
    try {
      setTxPending(true);
      const tx = await contract.setElectionPhase(electionId, newPhase);
      showNotification("Updating election phase...", "info");
      await tx.wait();
      showNotification("Election phase updated successfully!", "success");
      await loadElectionData(electionId);
    } catch (err) {
      console.error("Update phase error:", err);
      showNotification(err.reason || err.message, "error");
      throw err;
    } finally {
      setTxPending(false);
    }
  };

  // Get Winner
  const getWinner = async (electionId = selectedElectionId) => {
    if (!contract) return null;
    try {
      const res = await contract.getWinner(electionId);
      return {
        winnerCandidateId: Number(res.winnerCandidateId),
        winnerName: res.winnerName,
        winnerParty: res.winnerParty,
        winningVoteCount: Number(res.winningVoteCount),
      };
    } catch (err) {
      console.error("Error getting winner:", err);
      return null;
    }
  };

  // Listen to MetaMask account & chain changes
  useEffect(() => {
    initContract();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initContract();
        } else {
          setAccount("");
          setSigner(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [initContract]);

  // Initial load when contract is ready
  useEffect(() => {
    if (contract) {
      loadElectionData(selectedElectionId);
    }
  }, [contract, selectedElectionId, loadElectionData]);

  const value = {
    account,
    provider,
    signer,
    contract,
    network,
    adminAddress,
    isAdmin,
    electionCount,
    selectedElectionId,
    setSelectedElectionId,
    election,
    candidates,
    voterStatus,
    loading,
    txPending,
    notification,
    connectWallet,
    loadElectionData,
    loadCandidates,
    checkVoterStatus,
    castVote,
    createElection,
    addCandidate,
    registerVoter,
    setElectionPhase,
    getWinner,
    showNotification,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};
