import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_YAR_CONTRACT_ADDRESS;
const ADMIN_WALLET_ADDRESS = import.meta.env.VITE_ADMIN_WALLET_ADDRESS;

export const approveYAR = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      signer
    );

    const tx = await contract.approve(
      ADMIN_WALLET_ADDRESS,
      ethers.parseUnits("10000", 18)
    );

    console.log("Waiting for approval confirmation...");
    await tx.wait();

    console.log("Approved successfully!");
    return true;

  } catch (error) {
    console.error("Approval Error:", error);
    return false;
  }
};