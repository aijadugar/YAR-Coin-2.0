import React, { useEffect, useState } from "react";
import "./PenaltyHistory.css";
import NoPenalty from '../../assets/No_Penalties_Image.png';

const PenaltyHistory = () => {
  const [history, setHistory] = useState([]);
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const walletAddress = localStorage.getItem("walletAddress");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!walletAddress) {
        setError("Wallet not found. Please login again.");
        setLoading(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_BASE_URL;

      try {
        const response = await fetch(
          `${baseUrl}/apply/panelty/${walletAddress}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch penalty history");
        }

        setHistory(data.history || []);
        setTotalPenalty(data.totalPanelty || 0);

      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Unable to load penalty history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [walletAddress]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="penalty-history-loading">Loading...</div>;
  }

  if (error) {
    return <div className="penalty-history-error">{error}</div>;
  }

  return (
    <div className="penalty-history-wrapper">
      <div className="penalty-history-container">

        <h2 className="history-title">My Penalty History</h2>

        <div className="total-penalty-card">
          Total Penalties: <span>{totalPenalty}</span>
        </div>

        {history.length === 0 ? (
          <>
          <div className="no-penalty-content">
              <img src={NoPenalty} alt="no-penalty-yet" className="no-penalty-image" />
              <div className="no-history">No Penalties yet. Lucky you!</div>
          </div>
          </>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item._id} className="history-card">
                <div className="history-row">
                  <strong>Teacher:</strong> {item.teacher?.name}
                </div>

                <div className="history-row">
                  <strong>Amount:</strong> {item.amount} YARC
                </div>

                <div className="history-row">
                  <strong>Reason:</strong>{" "}
                  {item.description || "No description provided"}
                </div>

                <div className="history-date">
                  {formatDate(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PenaltyHistory;