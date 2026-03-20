import React, { useState, useEffect } from "react";
import "./Dex.css";
import { ethers } from "ethers";

export default function Dex() {

  const [yarcAmount, setYarcAmount] = useState("");
  const [currentUsd, setCurrentUsd] = useState(0);
  const [totalUsd, setTotalUsd] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const walletAddress = localStorage.getItem("walletAddress");
  const [dotCount, setDotCount] = useState(0);


  useEffect(() => {
      if (loading) {
        const interval = setInterval(() => {
          setDotCount(prev => (prev + 1) % 4); // 0,1,2,3
        }, 500); // 500ms per dot
        return () => clearInterval(interval);
      } else {
        setDotCount(0); // reset when not loading
      }
    }, [loading]);


  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletAddress || !showHistory){
        return
      };

      const baseUrl = import.meta.env.VITE_BASE_URL;
      const url = `${baseUrl}/dex/transactions/${walletAddress}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setTransactions(data.transactions);
        }

      } catch (error) {
        console.error("Fetch error:", error);
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

    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const YAR_TOKEN_ADDRESS = import.meta.env.VITE_YAR_CONTRACT_ADDRESS;
    const DEX_ADDRESS = import.meta.env.VITE_DEX_CONTRACT_ADDRESS;

    const yarAbi = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];

    const dexAbi = [
      "function convertYARtoUSD(uint256 amount) public"
    ];

    const yarToken = new ethers.Contract(YAR_TOKEN_ADDRESS, yarAbi, signer);
    const dex = new ethers.Contract(DEX_ADDRESS, dexAbi, signer);

    const decimals = await yarToken.decimals();
    const amount = ethers.parseUnits(yarcAmount.toString(), decimals);

    const balance = await yarToken.balanceOf(userAddress);
    if (balance < amount) {
      alert("Not enough YAR balance");
      setLoading(false);
      return;
    }

    const currentAllowance = await yarToken.allowance(userAddress, DEX_ADDRESS);

    if (currentAllowance < amount) {
      const approveTx = await yarToken.approve(DEX_ADDRESS, amount);
      await approveTx.wait();
    }

    const convertTx = await dex.convertYARtoUSD(amount);
    const receipt = await convertTx.wait();

    if (receipt.status !== 1) {
      alert("Transaction failed on blockchain");
      setLoading(false);
      return;
    }

    // console.log("Converted!", convertTx.hash);

    const baseUrl = import.meta.env.VITE_BASE_URL;

    const response = await fetch(`${baseUrl}/dex/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        walletAddress: userAddress.toLowerCase(),
        yarAmount: Number(yarcAmount),
        txHash: convertTx.hash
      })
    });

    const data = await response.json();

    if (data.success) {
      setCurrentUsd(data.convertedUsd || 0);
      setTotalUsd(data.totalUsd || 0);
      setYarcAmount("");
    } else {
      alert(data.message || "Conversion failed");
    }

  } catch (error) {
    console.error(error);
    alert(error.reason || error.message || "Transaction failed");
  } finally {
    setLoading(false);
  }
};


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
            {loading ? `Converting${".".repeat(dotCount)}` : "Convert to USD"}
          </button>

          <button
            type="button"
            className="history-btn"
            onClick={ () => {
               setShowHistory(!showHistory)
            }
            }
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