import React from "react";
import { NavLink } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { formatAddress } from "../utils/helpers";

const Header = () => {
  const { account, connectWallet, network, isAdmin, loading } = useBlockchain();

  const getNetworkName = () => {
    if (!network) return "Not Connected";
    if (network.chainId === 31337) return "Hardhat Local";
    if (network.chainId === 11155111) return "Sepolia Testnet";
    if (network.chainId === 1) return "Ethereum Mainnet";
    return network.name || `Chain ID ${network.chainId}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <NavLink to="/" className="logo-section">
          <div className="logo-icon">🗳️</div>
          <div>
            <div className="logo-text">BlockVote</div>
            <div className="logo-tagline">Decentralized E-Voting</div>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Voting Booth
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Voter Status
          </NavLink>
          <NavLink
            to="/results"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Live Results
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Admin Panel {isAdmin && "⭐"}
          </NavLink>
        </nav>

        {/* Network & Wallet Controls */}
        <div className="header-actions">
          {account && (
            <div className="network-badge">
              <span className="network-dot"></span>
              {getNetworkName()}
            </div>
          )}

          {account ? (
            <button className="btn btn-secondary btn-sm" title={account}>
              <span>👤</span> {formatAddress(account)}
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect MetaMask"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
