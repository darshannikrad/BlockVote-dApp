import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { BlockchainProvider, useBlockchain } from "./context/BlockchainContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import VotingBooth from "./components/VotingBooth";
import AdminPanel from "./components/AdminPanel";
import VoterRegistration from "./components/VoterRegistration";
import Results from "./components/Results";
import "./App.css";

const NotificationBanner = () => {
  const { notification } = useBlockchain();
  if (!notification) return null;

  return (
    <div className={`notification-banner notification-${notification.type}`}>
      <span>
        {notification.type === "success" && "✅"}
        {notification.type === "error" && "⚠️"}
        {notification.type === "info" && "ℹ️"}
      </span>
      <span>{notification.message}</span>
    </div>
  );
};

const MainApp = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<VotingBooth />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/register" element={<VoterRegistration />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <NotificationBanner />
    </div>
  );
};

function App() {
  return (
    <BlockchainProvider>
      <Router>
        <MainApp />
      </Router>
    </BlockchainProvider>
  );
}

export default App;
