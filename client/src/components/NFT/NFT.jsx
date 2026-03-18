import React, { useState } from "react";
import "./NFT.css";

const NFT = () => {
  const [studentWallet, setStudentWallet] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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

  if (!studentWallet) {
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
    const response = await fetch(`${baseUrl}/mint/nft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        assignedTo: studentWallet,
        assignedBy: teacherWallet,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    const txUrl = `https://sepolia.etherscan.io/tx/${data.txHash}`;

    setMessage({
      text: `NFT minted! Token ID: ${data.tokenId}`,
      type: "success",
    });

    console.log("Tx:", txUrl);

    setStudentWallet("");
    setTitle("");
    setDescription("");

  } catch (error) {
    console.error("NFT Error:", error);

    setMessage({
      text: error.message,
      type: "error",
    });

  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="nft-wrapper">
      <div className="nft-container">
        <div className="nft-card">
          <h2 className="nft-title">NFT Reward System</h2>

          {message.text && (
            <div className={`nft-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Student Wallet Address</label>
            <input
              type="text"
              placeholder="Enter student wallet address"
              value={studentWallet}
              onChange={(e) => setStudentWallet(e.target.value)}
              required
            />

            <label>NFT Title</label>
            <input
              type="text"
              placeholder="Enter NFT title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label>NFT Description</label>
            <textarea
              placeholder="Enter NFT description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />

            <button type="submit" className="mint-btn" disabled={isLoading}>
              {isLoading ? "Minting..." : "Mint NFT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NFT;