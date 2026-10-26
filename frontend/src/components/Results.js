import React, { useState, useEffect, useCallback } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import {
  calculatePercentage,
  getPhaseLabel,
  getPhaseColor,
  formatTimestamp,
} from "../utils/helpers";

const Results = () => {
  const {
    election,
    candidates,
    selectedElectionId,
    electionCount,
    setSelectedElectionId,
    getWinner,
    loadElectionData,
  } = useBlockchain();

  const [winner, setWinner] = useState(null);
  const [loadingWinner, setLoadingWinner] = useState(false);

  const fetchWinner = useCallback(async () => {
    if (!election || candidates.length === 0) return;
    try {
      setLoadingWinner(true);
      const res = await getWinner(selectedElectionId);
      setWinner(res);
    } catch (e) {
      console.error("Winner fetch error:", e);
    } finally {
      setLoadingWinner(false);
    }
  }, [election, candidates.length, getWinner, selectedElectionId]);

  useEffect(() => {
    fetchWinner();
  }, [fetchWinner]);

  if (!election) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <h2>No Election Data Available</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
          Please make sure an election has been deployed on the blockchain.
        </p>
      </div>
    );
  }

  const totalVotes = election.totalVotes || 0;
  const isElectionEnded = election.phase === 3;

  return (
    <div className="results-container">
      {/* Header and Election Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Live Election Results</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Real-time on-chain ballot tally directly computed by smart contracts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {electionCount > 1 && (
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
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadElectionData(selectedElectionId)}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Winner Banner (if votes exist) */}
      {winner && totalVotes > 0 && (
        <div className="winner-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div className="winner-crown">🏆</div>
            <div className="winner-details">
              <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-success)" }}>
                {isElectionEnded ? "Official Election Winner" : "Current Vote Leader"}
              </span>
              <h3>{winner.winnerName}</h3>
              <div className="winner-party-text">{winner.winnerParty}</div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff" }}>
              {winner.winningVoteCount} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>votes</span>
            </div>
            <div style={{ color: "var(--color-success)", fontWeight: "700" }}>
              {calculatePercentage(winner.winningVoteCount, totalVotes)} of total
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="results-stats-row">
        <div className="stat-box">
          <div className="stat-number">{totalVotes}</div>
          <div className="stat-label">Total Votes Tallied</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{candidates.length}</div>
          <div className="stat-label">Competing Candidates</div>
        </div>
        <div className="stat-box">
          <div
            className="stat-number"
            style={{ color: getPhaseColor(election.phase), fontSize: "1.5rem" }}
          >
            {getPhaseLabel(election.phase)}
          </div>
          <div className="stat-label">Status</div>
        </div>
      </div>

      {/* CSS-Only Bar Chart Visualization */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Ballot Breakdown &amp; Vote Distribution</h2>
          <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
            {election.name}
          </span>
        </div>

        {candidates.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No candidates registered yet.</p>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            {candidates.map((cand) => {
              const pctNumber = totalVotes > 0 ? (cand.voteCount / totalVotes) * 100 : 0;
              const isWinner = winner && winner.winnerCandidateId === cand.id && cand.voteCount > 0;

              return (
                <div key={cand.id} className="bar-chart-item">
                  <div className="bar-chart-labels">
                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "#ffffff" }}>
                        {cand.name}
                      </strong>
                      <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                        ({cand.party})
                      </span>
                      {isWinner && (
                        <span
                          className="badge"
                          style={{
                            marginLeft: "0.75rem",
                            background: "rgba(6, 214, 160, 0.2)",
                            color: "var(--color-success)",
                          }}
                        >
                          👑 Leader
                        </span>
                      )}
                    </div>

                    <div style={{ fontFamily: "var(--font-mono)" }}>
                      <strong>{cand.voteCount}</strong> votes (
                      {calculatePercentage(cand.voteCount, totalVotes)})
                    </div>
                  </div>

                  {/* Visual Bar Track */}
                  <div className="bar-chart-track">
                    <div
                      className={`bar-chart-fill ${isWinner ? "winner-bar" : ""}`}
                      style={{
                        width: `${Math.max(pctNumber, cand.voteCount > 0 ? 5 : 0)}%`,
                      }}
                    >
                      {pctNumber >= 10 && `${pctNumber.toFixed(1)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Election Details Card */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: "1rem" }}>
          ℹ️ Election Specifications
        </h3>

        <div className="grid-2" style={{ fontSize: "0.92rem" }}>
          <div>
            <span className="form-label">Election ID</span>
            <div style={{ color: "#ffffff", fontWeight: "600" }}>#{election.id}</div>
          </div>

          <div>
            <span className="form-label">Current Phase</span>
            <div>
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
          </div>

          <div>
            <span className="form-label">Start Time</span>
            <div style={{ color: "#ffffff" }}>{formatTimestamp(election.startTime)}</div>
          </div>

          <div>
            <span className="form-label">End Time</span>
            <div style={{ color: "#ffffff" }}>{formatTimestamp(election.endTime)}</div>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <span className="form-label">Description</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            {election.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;
