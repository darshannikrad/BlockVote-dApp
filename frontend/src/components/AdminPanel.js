import React, { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { getPhaseLabel, getPhaseColor, formatAddress } from "../utils/helpers";

const AdminPanel = () => {
  const {
    account,
    adminAddress,
    isAdmin,
    election,
    selectedElectionId,
    setSelectedElectionId,
    electionCount,
    createElection,
    addCandidate,
    registerVoter,
    setElectionPhase,
    txPending,
    connectWallet,
  } = useBlockchain();

  // Create Election Form State
  const [newElection, setNewElection] = useState({
    name: "",
    description: "",
    durationHours: 24,
  });

  // Add Candidate Form State
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    party: "",
    description: "",
  });

  // Register Voter Form State
  const [voterAddressInput, setVoterAddressInput] = useState("");

  if (!account) {
    return (
      <div className="connect-prompt-card">
        <div className="prompt-icon">🔒</div>
        <h2>Admin Authentication Required</h2>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>
          Please connect the administrator MetaMask account to manage elections, candidates, phases, and voter registrations.
        </p>
        <button className="btn btn-primary btn-lg" onClick={connectWallet}>
          Connect Admin Wallet
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "3rem auto", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
        <h2 style={{ color: "var(--color-danger)" }}>Access Denied: Admin Only</h2>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>
          Your connected account (<code>{formatAddress(account)}</code>) is not authorized as the contract administrator.
        </p>
        <div className="alert alert-info" style={{ textAlign: "left", marginTop: "1.5rem" }}>
          <div>
            <strong>Authorized Contract Deployer:</strong>
            <div style={{ wordBreak: "break-all", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
              {adminAddress || "Fetching contract admin..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateElectionSubmit = async (e) => {
    e.preventDefault();
    if (!newElection.name.trim()) return;
    const now = Math.floor(Date.now() / 1000);
    const durationSec = Number(newElection.durationHours) * 3600;
    const startTime = now;
    const endTime = now + durationSec;

    await createElection(newElection.name, newElection.description, startTime, endTime);
    setNewElection({ name: "", description: "", durationHours: 24 });
  };

  const handleAddCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!newCandidate.name.trim() || !election) return;
    await addCandidate(
      selectedElectionId,
      newCandidate.name,
      newCandidate.party,
      newCandidate.description
    );
    setNewCandidate({ name: "", party: "", description: "" });
  };

  const handleRegisterVoterSubmit = async (e) => {
    e.preventDefault();
    if (!voterAddressInput.trim() || !election) return;
    await registerVoter(selectedElectionId, voterAddressInput.trim());
    setVoterAddressInput("");
  };

  const handlePhaseChange = async (targetPhase) => {
    if (!election) return;
    await setElectionPhase(selectedElectionId, targetPhase);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Election Administration</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Manage election lifecycle phases, register candidate profiles, and whitelist verified voter addresses.
        </p>
      </div>

      {/* Current Election Selector & Status */}
      {election && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="card-header">
            <div>
              <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>ACTIVE ELECTION</span>
              <h2 className="card-title">
                #{election.id} - {election.name}
              </h2>
            </div>
            {electionCount > 1 && (
              <select
                className="form-select"
                style={{ width: "auto" }}
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(Number(e.target.value))}
              >
                {Array.from({ length: electionCount }, (_, i) => i + 1).map((id) => (
                  <option key={id} value={id}>
                    Switch to Election #{id}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Current Phase: </span>
              <span
                className="badge"
                style={{
                  backgroundColor: `${getPhaseColor(election.phase)}22`,
                  color: getPhaseColor(election.phase),
                  border: `1px solid ${getPhaseColor(election.phase)}`,
                }}
              >
                {getPhaseLabel(election.phase)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total Votes: </span>
              <strong>{election.totalVotes}</strong>
            </div>
          </div>

          {/* Phase Management Buttons */}
          <div style={{ marginTop: "1.5rem" }}>
            <label className="form-label">Transition Election Phase</label>
            <div className="phase-btn-group">
              {[
                { phase: 0, label: "0 - Created" },
                { phase: 1, label: "1 - Registration" },
                { phase: 2, label: "2 - Voting Active" },
                { phase: 3, label: "3 - Ended" },
              ].map((item) => (
                <button
                  key={item.phase}
                  className={`phase-pill ${election.phase === item.phase ? "current-phase" : ""}`}
                  onClick={() => handlePhaseChange(item.phase)}
                  disabled={txPending || election.phase === item.phase}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Register Voter Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1rem" }}>
            👤 Register Eligible Voter
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Add an Ethereum wallet address to the election's voter registry. Allowed during Created and Registration phases.
          </p>

          <form onSubmit={handleRegisterVoterSubmit}>
            <div className="form-group">
              <label className="form-label">Voter Ethereum Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={voterAddressInput}
                onChange={(e) => setVoterAddressInput(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={txPending || !election}
            >
              {txPending ? "Registering..." : "Whitelist & Register Voter"}
            </button>
          </form>
        </div>

        {/* Add Candidate Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1rem" }}>
            ➕ Add Candidate
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Register an official candidate for Election #{selectedElectionId}.
          </p>

          <form onSubmit={handleAddCandidateSubmit}>
            <div className="form-group">
              <label className="form-label">Candidate Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jane Doe"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Party / Organization</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Progressive Alliance"
                value={newCandidate.party}
                onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Manifesto / Description</label>
              <textarea
                className="form-textarea"
                placeholder="Candidate platform and goals..."
                value={newCandidate.description}
                onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={txPending || !election}
            >
              {txPending ? "Adding Candidate..." : "Add Candidate to Ballot"}
            </button>
          </form>
        </div>
      </div>

      {/* Create New Election Form */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 className="card-title" style={{ marginBottom: "1rem" }}>
          🏛️ Create New Election
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Launch a new decentralized election with custom metadata and voting window.
        </p>

        <form onSubmit={handleCreateElectionSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Election Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2026 University Council"
                value={newElection.name}
                onChange={(e) => setNewElection({ ...newElection, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (Hours)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="720"
                value={newElection.durationHours}
                onChange={(e) => setNewElection({ ...newElection, durationHours: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Election Description</label>
            <textarea
              className="form-textarea"
              placeholder="Detailed guidelines, rules, and scope..."
              value={newElection.description}
              onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-success"
            style={{ width: "100%" }}
            disabled={txPending}
          >
            {txPending ? "Deploying Election..." : "Deploy New Election"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
