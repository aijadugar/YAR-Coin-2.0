import React, { useEffect, useState } from "react";
import "./NFTHistory.css";
import NoNFT from '../../assets/No_NFTS.png';

const NFTHistory = () => {
  const [history, setHistory] = useState([]);
  const [totalNFT, setTotalNFT] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedTx, setCopiedTx] = useState(null); // Track which tx hash was copied

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
        const response = await fetch(`${baseUrl}/mint/nft/${walletAddress}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch nft history");
        }

        // Backend now returns { success, count, nfts }
        setHistory(data.nfts || []);
        setTotalNFT(data.count || 0);

      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Unable to load NFT history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [walletAddress]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = async (text, txId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTx(txId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedTx(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedTx(txId);
        setTimeout(() => setCopiedTx(null), 2000);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
        alert("Failed to copy to clipboard");
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return <div className="nft-history-loading">Loading...</div>;
  }

  if (error) {
    return <div className="nft-history-error">{error}</div>;
  }

  return (
    <div className="nft-history-wrapper">
      <div className="nft-history-container">

        <h2 className="history-title">My NFT History</h2>

        <div className="total-nft-card">
          Total NFT: <span>{totalNFT}</span>
        </div>

        {history.length === 0 ? (
          <>
          <div className="no-nft-content">
              <img src={NoNFT} alt="no-nft-yet" className="no-nft-image" />
              <div className="no-history">No NFTs yet!</div>
          </div>
          </>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item._id} className="history-card">

                <div className="history-row">
                  <strong>Token ID:</strong> {item.tokenId}
                </div>

                <div className="history-row">
                  <strong>Title:</strong> {item.title || "No Title"}
                </div>

                <div className="history-row">
                  <strong>Description:</strong> {item.description || "No Description"}
                </div>

                <div className="history-row tx-hash-row">
                  <strong>Tx Hash:</strong> 
                  <span className="tx-hash-text">{item.txHash}</span>
                  <button 
                    className={`copy-btn ${copiedTx === item.txHash ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(item.txHash, item.txHash)}
                    title="Copy to clipboard"
                  >
                    {copiedTx === item.txHash ? 'Copied' : 'Copy'}
                  </button>
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

export default NFTHistory;