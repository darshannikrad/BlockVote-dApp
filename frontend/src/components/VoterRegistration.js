import React from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { formatAddress, getPhaseLabel } from "../utils/helpers";

const VoterRegistration = () => {
  const {
    account,
    connectWallet,
    election,
    voterStatus,
    adminAddress,
    selectedElectionId,
  } = useBlockchain();

  if (!account) {
    return (
      <div className="connect-prompt-card">
        <div className="prompt-icon">📋</div>
        <h2>Voter Verification</h2>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>
          Connect your Web3 wallet to verify your voter registration credentials on the Ethereum blockchain.
        </p>
        <button className="btn btn-primary btn-lg" onClick={connectWallet}>
          Connect MetaMask
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Voter Registration &amp; Status</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Transparent verification of your cryptographic voting credentials for Election #{selectedElectionId}.
        </p>
      </div>

      <div className="grid-2">
        {/* Voter Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Voting Identity</h3>
            <span
              className={`status-badge ${
                voterStatus.isRegistered ? "registered" : "unregistered"
              }`}
            >
              {voterStatus.isRegistered ? "✓ Registered" : "✕ Not Registered"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <span className="form-label">Connected Wallet Address</span>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  background: "rgba(255,255,255,0.04)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  wordBreak: "break-all",
                }}
              >
                {account}
              </div>
            </div>

            <div className="grid-2">
              <div>
                <span className="form-label">Ballot Status</span>
                <div>
                  {voterStatus.hasVoted ? (
                    <span className="badge" style={{ background: "rgba(6, 214, 160, 0.2)", color: "var(--color-success)" }}>
                      ✓ Vote Recorded
                    </span>
                  ) : (
                    <span className="badge" style={{ background: "rgba(247, 127, 0, 0.2)", color: "var(--color-warning)" }}>
                      ⏳ Not Yet Cast
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="form-label">Active Election</span>
                <div style={{ fontWeight: "600", color: "#ffffff" }}>
                  {election ? election.name : "N/A"}
                </div>
              </div>
            </div>

            {voterStatus.hasVoted && voterStatus.voteHash && (
              <div>
                <span className="form-label">Cryptographic Vote Receipt (Hash)</span>
                <div className="receipt-box">
                  {voterStatus.voteHash}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.4rem" }}>
                  This Keccak256 hash mathematically proves your ballot was committed to the Ethereum ledger while keeping your candidate choice private.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Card */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1rem" }}>
            📖 How to Get Registered
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.92rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ color: "var(--accent-primary)", fontWeight: "700" }}>1.</span>
              <div>
                <strong>Whitelisting Process:</strong> The election administrator reviews eligible voters and adds wallet addresses during the <em>Registration</em> phase.
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ color: "var(--accent-primary)", fontWeight: "700" }}>2.</span>
              <div>
                <strong>Provide Your Address:</strong> Share your public Ethereum address (<code>{formatAddress(account)}</code>) with the election authority before the registration deadline.
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ color: "var(--accent-primary)", fontWeight: "700" }}>3.</span>
              <div>
                <strong>Current Phase:</strong> Registration is only open during the <em>Created</em> or <em>Registration</em> phase (Current: <strong>{election ? getPhaseLabel(election.phase) : "Loading"}</strong>).
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ color: "var(--accent-primary)", fontWeight: "700" }}>4.</span>
              <div>
                <strong>One Person, One Vote:</strong> Once registered, you are entitled to cast exactly 1 vote. Sybil attacks and double voting are strictly forbidden by smart contract constraints.
              </div>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
            <div>
              <strong>Contract Admin Contact:</strong>
              <div style={{ wordBreak: "break-all", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginTop: "2px" }}>
                {adminAddress || "Loading admin address..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterRegistration;
