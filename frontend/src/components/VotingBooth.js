import React, { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { formatTimestamp, getPhaseLabel, getPhaseColor } from "../utils/helpers";

const VotingBooth = () => {
  const {
    account,
    connectWallet,
    election,
    candidates,
    voterStatus,
    castVote,
    txPending,
    selectedElectionId,
    electionCount,
    setSelectedElectionId,
  } = useBlockchain();

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  // Voting phase is 2 (0: Created, 1: Registration, 2: Voting, 3: Ended)
  const isVotingActive = election && election.phase === 2;
  const canVote =
    account &&
    isVotingActive &&
    voterStatus.isRegistered &&
    !voterStatus.hasVoted &&
    !txPending;

  const handleVoteClick = (candidate) => {
    setSelectedCandidate(candidate);
    setConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    try {
      await castVote(selectedCandidate.id);
      setConfirmModal(false);
      setSelectedCandidate(null);
    } catch (err) {
      // Error handled in BlockchainContext
    }
  };

  // If wallet not connected
  if (!account) {
    return (
      <div className="connect-prompt-card">
        <div className="prompt-icon">🗳️</div>
        <h2>Connect Your Web3 Wallet</h2>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>
          BlockVote uses Ethereum smart contracts for tamper-proof ballot tallying and cryptographic privacy. Please connect your MetaMask wallet to participate in elections.
        </p>
        <button className="btn btn-primary btn-lg" onClick={connectWallet}>
          Connect MetaMask
        </button>
      </div>
    );
  }

  // If no elections exist yet
  if (!election || electionCount === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <h2>No Elections Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>
          There are currently no elections created on the smart contract.
        </p>
        <p style={{ fontSize: "0.9rem", color: "var(--accent-cyan)" }}>
          If you are the admin, visit the Admin Panel to create an election.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Election Selector (if multiple exist) */}
      {electionCount > 1 && (
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <label style={{ color: "var(--text-muted)", fontWeight: "600" }}>Select Election:</label>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(Number(e.target.value))}
          >
            {Array.from({ length: electionCount }, (_, i) => i + 1).map((id) => (
              <option key={id} value={id}>
                Election #{id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Hero Header */}
      <div className="election-hero">
        <div className="election-hero-top">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <span
                className="badge"
                style={{
                  backgroundColor: `${getPhaseColor(election.phase)}22`,
                  color: getPhaseColor(election.phase),
                  border: `1px solid ${getPhaseColor(election.phase)}`,
                }}
              >
                ● {getPhaseLabel(election.phase)}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                Election #{election.id}
              </span>
            </div>
            <h1 className="election-title">{election.name}</h1>
            <p style={{ color: "var(--text-muted)", maxWidth: "800px" }}>
              {election.description}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff" }}>
              {election.totalVotes}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Votes Cast
            </div>
          </div>
        </div>

        <div className="election-meta">
          <div className="meta-item">
            <span>📅 Starts:</span>
            <strong>{formatTimestamp(election.startTime)}</strong>
          </div>
          <div className="meta-item">
            <span>⏳ Ends:</span>
            <strong>{formatTimestamp(election.endTime)}</strong>
          </div>
          <div className="meta-item">
            <span>👥 Candidates:</span>
            <strong>{candidates.length}</strong>
          </div>
        </div>
      </div>

      {/* Voter Status Banner */}
      {voterStatus.hasVoted ? (
        <div className="alert alert-success">
          <span style={{ fontSize: "1.25rem" }}>✅</span>
          <div>
            <strong>You have cast your vote for this election!</strong>
            <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: "2px" }}>
              Receipt Hash: <code>{voterStatus.voteHash}</code>
            </div>
          </div>
        </div>
      ) : !voterStatus.isRegistered ? (
        <div className="alert alert-warning">
          <span style={{ fontSize: "1.25rem" }}>⚠️</span>
          <div>
            <strong>You are not registered to vote in this election.</strong>
            <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>
              Contact the election administrator to register your wallet address (<code>{account}</code>).
            </div>
          </div>
        </div>
      ) : !isVotingActive ? (
        <div className="alert alert-info">
          <span style={{ fontSize: "1.25rem" }}>ℹ️</span>
          <div>
            <strong>Voting is currently not open.</strong>
            <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>
              Current phase is <strong>{getPhaseLabel(election.phase)}</strong>. Ballots can only be cast when the phase is set to <strong>Voting Active</strong>.
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-success">
          <span style={{ fontSize: "1.25rem" }}>🗳️</span>
          <div>
            <strong>You are registered and eligible to vote!</strong> Select a candidate below to cast your ballot securely.
          </div>
        </div>
      )}

      {/* Candidate Grid */}
      <div style={{ margin: "2rem 0 1rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Candidates Running</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Review candidate agendas and submit your choice. Every vote is cryptographically verified on Ethereum.
        </p>
      </div>

      <div className="grid-3">
        {candidates.map((cand) => {
          const isUserVote = voterStatus.hasVoted && voterStatus.votedCandidateId === cand.id;

          return (
            <div
              key={cand.id}
              className={`candidate-card ${isUserVote ? "voted-for" : ""}`}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="candidate-badge-num">#{cand.id + 1}</div>
                  {isUserVote && (
                    <span className="badge" style={{ background: "rgba(6, 214, 160, 0.2)", color: "var(--color-success)" }}>
                      ✓ Your Vote
                    </span>
                  )}
                </div>

                <div className="candidate-name">{cand.name}</div>
                <div className="candidate-party">{cand.party}</div>
                <div className="candidate-desc">{cand.description}</div>
              </div>

              <div>
                <button
                  className={`btn ${isUserVote ? "btn-success" : "btn-primary"}`}
                  style={{ width: "100%" }}
                  disabled={!canVote || isUserVote}
                  onClick={() => handleVoteClick(cand)}
                >
                  {isUserVote
                    ? "✓ Voted"
                    : voterStatus.hasVoted
                    ? "Ballot Submitted"
                    : !voterStatus.isRegistered
                    ? "Registration Required"
                    : !isVotingActive
                    ? "Voting Inactive"
                    : txPending
                    ? "Processing..."
                    : `Vote for ${cand.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && selectedCandidate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div className="card" style={{ maxWidth: "480px", width: "100%" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Confirm Your Vote</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              You are about to cast your official ballot for:
            </p>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                padding: "1.25rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                {selectedCandidate.name}
              </div>
              <div style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: "600" }}>
                {selectedCandidate.party}
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--color-warning)", marginBottom: "1.5rem" }}>
              ⚠️ Note: On-chain votes are final and cannot be modified or withdrawn once confirmed.
            </p>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setConfirmModal(false)}
                disabled={txPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleConfirmVote}
                disabled={txPending}
              >
                {txPending ? "Submitting..." : "Confirm & Cast"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingBooth;
