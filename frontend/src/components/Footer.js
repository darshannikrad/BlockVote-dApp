import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <strong>BlockVote</strong> &copy; {new Date().getFullYear()} &mdash; Decentralized & Cryptographically Verifiable E-Voting System.
        </div>
        <div className="footer-badge">
          <span>⚡</span> Powered by Ethereum Smart Contracts &amp; Hardhat
        </div>
      </div>
    </footer>
  );
};

export default Footer;
