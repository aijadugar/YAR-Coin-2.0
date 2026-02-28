import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PenaltyPage.css";

const Penalty = () => {
  const [candidateWallet, setCandidateWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  // 🔐 Protect Route (Only Teacher)
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "teacher") {
      alert("Access denied. Teachers only.");
      navigate("/");
    }
  }, [navigate]);

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

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(
        "https://fictional-journey-9796755g5qgwc7gwg-5000.app.github.dev/apply/panelty",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromWallet: candidateWallet,   // student
            toWallet: teacherWallet,       // teacher
            amount: Number(amount),
            description: reason || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Penalty failed");
      }

      setMessage({
        text: "Penalty applied successfully",
        type: "success",
      });

      // Reset form
      setCandidateWallet("");
      setAmount("");
      setReason("");

      console.log("Backend Response:", data);

    } catch (error) {
      console.error("Backend Error:", error);
      setMessage({
        text: "Failed to apply penalty ❌",
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
              {isLoading ? "Processing..." : "Apply Penalty"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Penalty;