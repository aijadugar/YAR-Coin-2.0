import React, { useState } from "react";
import "./PenaltyPage.css";

const Penalty = () => {
  const [candidateWallet, setCandidateWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // 🔥 Dummy penalty history (API baad me connect karenge)
  const [penalties] = useState([
    {
      _id: "1",
      candidateWallet: "0x123...abc",
      amount: 5,
      reason: "Low participation",
      createdAt: new Date()
    },
    {
      _id: "2",
      candidateWallet: "0x456...xyz",
      amount: 3,
      reason: "Late submission",
      createdAt: new Date()
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Candidate Wallet:", candidateWallet);
    console.log("Deduction Amount:", amount);
    console.log("Reason:", reason);

    alert("Adjustment Submitted (API not connected yet)");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="penalty-wrapper">

      <div className="penalty-container">
        <div className="penalty-card">
          <h2 className="penalty-title">Mentor Adjustment Panel</h2>

          <form onSubmit={handleSubmit}>

            <label>Candidate Wallet Address</label>
            <input
              type="text"
              placeholder="Enter candidate wallet address"
              value={candidateWallet}
              onChange={(e) => setCandidateWallet(e.target.value)}
              required
            />

            <label>Deduction Amount (YARC)</label>
            <input
              type="number"
              placeholder="Enter YARC amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
            />

            <label>Reason (optional)</label>
            <textarea
              placeholder="Enter reason for adjustment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
            />

            <button type="submit" className="apply-btn">
              Apply Adjustment
            </button>

            <button
              type="button"
              className="history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Close Penalty History" : "View Penalty History"}
            </button>

          </form>
        </div>
      </div>

      {/* 🔥 Side History Panel */}
      {showHistory && (
        <div className="history-panel">
          <h3>Penalty History</h3>

          <div className="history-content">
            {penalties.length === 0 ? (
              <p className="no-transactions">No penalties found</p>
            ) : (
              penalties.map((penalty) => (
                <div key={penalty._id} className="transaction-card">
                  <p><strong>Wallet:</strong> {penalty.candidateWallet}</p>
                  <p><strong>Deducted:</strong> {penalty.amount} YARC</p>
                  <p><strong>Reason:</strong> {penalty.reason}</p>
                  <p className="tx-date">
                    {formatDate(penalty.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Penalty;