export const connectWallet = async () => {

  if (!window.ethereum) {
    alert("MetaMask is not installed");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    return accounts[0]; // wallet address

  } catch (error) {
    console.error("MetaMask connection failed", error);
    return null;
  }
};