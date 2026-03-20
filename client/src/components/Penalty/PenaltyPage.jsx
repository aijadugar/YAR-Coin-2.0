import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PenaltyPage.css";
import { useLocation } from "react-router-dom";

const Penalty = () => {
  const location = useLocation();
  const prefillWallet = location.state?.studentWallet || "";
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [dotCount, setDotCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "teacher") {
      alert("Access denied. Teachers only.");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
  if (isLoading) {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4); 
    }, 500); 
    return () => clearInterval(interval);
  } else {
    setDotCount(0); 
  }
}, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const teacherWallet = localStorage.getItem("walletAddress");

    if (!teacherWallet) {
      setMessage({
        text: "Teacher wallet not found. Please login again.",
        type: "error",
      });
      return;
    }

    if (!prefillWallet) {
      setMessage({
        text: "Student wallet is required",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const baseUrl = import.meta.env.VITE_BASE_URL;

    try {
      const response = await fetch(
        `${baseUrl}/apply/panelty`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromWallet: prefillWallet,   
            toWallet: teacherWallet,       
            amount: amount.toString(),
            description: reason || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error);
      }

      setMessage({
        text: "Penalty applied successfully",
        type: "success",
      });

      setAmount("");
      setReason("");


    } catch (error) {
      console.error("Backend Error:", error);
      setMessage({
        text: "Failed to apply penalty",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="penalty-wrapper">
      <div className="penalty-container">
        <div className="penalty-card">
          <h2 className="penalty-title">Penalty System</h2>

          {message.text && (
            <div className={`penalty-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Student Wallet Address</label>
            <input
              type="text"
              placeholder="Enter student wallet address"
              value={prefillWallet}
              readOnly
              style={{ cursor: "not-allowed", opacity: 0.7 }}
            />

            <label>Deduction Amount (YARC)</label>
            <input
              type="number"
              placeholder="Enter YARC amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />

            <label>Reason (optional)</label>
            <textarea
              placeholder="Enter reason for adjustment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
            />

            <button type="submit" className="apply-btn" disabled={isLoading}>
              {isLoading ? `Processing${".".repeat(dotCount)}` : "Apply Penalty"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Penalty;