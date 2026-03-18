import React, { useState, useEffect } from "react";
import "./Dex.css";

export default function Dex() {

  const [yarcAmount, setYarcAmount] = useState("");
  const [currentUsd, setCurrentUsd] = useState(0);
  const [totalUsd, setTotalUsd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const walletAddress = localStorage.getItem("walletAddress");

  // 🔥 Fetch Transactions when History opens
  useEffect(() => {



    const fetchTransactions = async () => {
      if (!walletAddress || !showHistory) return;

      const baseUrl = import.meta.env.VITE_BASE_URL;

      try {
        const response = await fetch(
          `${baseUrl}/transactions/${walletAddress}`
        );

        const data = await response.json();

        if (data.success) {
          setTransactions(data.transactions);
        }

      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };

    fetchTransactions();

  }, [walletAddress, showHistory]);

  const handleConvert = async (e) => {
    e.preventDefault();

    if (!yarcAmount || yarcAmount <= 0) {
      alert("Enter valid YARC amount");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(
        `${baseUrl}/convert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            walletAddress: walletAddress,
            yarAmount: Number(yarcAmount)
          })
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (data.success) {
        setCurrentUsd(data.convertedUsd || 0);
        setTotalUsd(data.totalUsd || 0);
        setYarcAmount("");
      } else {
        alert(data.message || "Conversion failed");
      }

    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Format Date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="dex-page">

      <div className="dex-card">
        <h2>YARCoin DEX</h2>

        <form onSubmit={handleConvert} className="dex-form">

          <label>Enter YARC Balance</label>
          <input
            type="number"
            placeholder="Enter YARC amount"
            value={yarcAmount}
            onChange={(e) => setYarcAmount(e.target.value)}
          />

          <div className="display-row">

            <div className="usd-display">
              <p>Current USD</p>
              <h3>$ {currentUsd}</h3>
            </div>

            <div className="usd-display">
              <p>Total USD Balance</p>
              <h3>$ {totalUsd}</h3>
            </div>

          </div>

          <button type="submit" className="convert-btn" disabled={loading}>
            {loading ? "Converting..." : "Convert to USD"}
          </button>

          <button
            type="button"
            className="history-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Close History" : "Transaction History"}
          </button>

        </form>
      </div>

      {showHistory && (
        <div className="history-panel">
          <h3>Transaction History</h3>

          <div className="history-content">

            {transactions.length === 0 ? (
              <p className="no-transactions">No transactions found</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx._id} className="transaction-card">
                  <p><strong>YAR:</strong> {tx.fromYar}</p>
                  <p><strong>USD:</strong> ${tx.usdBalance}</p>
                  <p><strong>Total USD:</strong> ${tx.totalUsd}</p>
                  <p className="tx-date">{formatDate(tx.createdAt)}</p>
                </div>
              ))
            )}

          </div>
        </div>
      )}

    </div>
  );
}