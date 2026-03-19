import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { approveYAR } from "../../utils/approveYAR";
import { connectWallet } from "../../utils/connectWallet.js";

export default function Auth() {

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [tab, setTab] = useState("register");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false); 
  const [message, setMessage] = useState({ text: "", type: "" }); 
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();

  const [studentFormData, setStudentFormData] = useState({
    name: "", email: "", skills: "", achievements: "", basePrice: ""
  });

  const [teacherFormData, setTeacherFormData] = useState({
    name: "", email: "", specialization: ""
  });

  const [loginData, setLoginData] = useState({
    email: "", walletAddress: ""
  });

  const handleStudentChange = (e) => {
    setStudentFormData({ ...studentFormData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleTeacherChange = (e) => {
    setTeacherFormData({ ...teacherFormData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000); 
  };

  const handleConnectWallet = async (e) => {
    e.preventDefault(); 
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      showMessage("Wallet connected: " + address, "success");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!walletAddress) {
      showMessage("Please connect your wallet first", "error");
      setIsLoading(false);
      return;
    }

    try {
      showMessage("Setting up your wallet...", "success");

      const approved = await approveYAR();
      if (!approved) {
        showMessage("Wallet approval failed", "error");
        setIsLoading(false);
        return;
      }

      const url = role === "student"
        ? `${baseUrl}/api/students`
        : `${baseUrl}/api/teachers`;

      const payload = role === "student" ? {
        name: studentFormData.name,
        email: studentFormData.email,
        walletAddress: walletAddress,
        skills: studentFormData.skills.split(',').map(s => s.trim()),
        achievements: studentFormData.achievements.split(',').map(a => a.trim()),
        basePrice: parseInt(studentFormData.basePrice)
      } : {
        name: teacherFormData.name,
        email: teacherFormData.email,
        walletAddress: walletAddress,
        specialization: teacherFormData.specialization
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("Error: " + (data.error || "Registration failed"), "error");
        return;
      }

      showMessage("Registered successfully!", "success");

      setLoginData({
        email: role === "student" ? studentFormData.email : teacherFormData.email,
        walletAddress: walletAddress
      });

      setStudentFormData({
        name: "",
        email: "",
        skills: "",
        achievements: "",
        basePrice: ""
      });

      setTeacherFormData({
        name: "",
        email: "",
        specialization: ""
      });

      setWalletAddress("");

    } catch (err) {
       if (import.meta.env.VITE_BASE_URL) {
         console.error("Error:", err);
       }
      showMessage("Failed to connect to backend", "error");
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          walletAddress: loginData.walletAddress
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showMessage("Error: " + (data.error || "Login failed"), "error");
        return;
      }

      const user = data.user;
      const userRole = data.role;

      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userId", user._id);

      if (user.walletAddress) {
        localStorage.setItem("walletAddress", user.walletAddress);
      }

      showMessage("Login successful! Redirecting...", "success");

      setTimeout(() => {
        if (userRole === 'teacher') {
          navigate("/teacher-home", {
            state: {
              ...user,
              role: 'teacher'
            }
          });
        } else {
          navigate("/student/playground", {
            state: {
              ...user,
              role: 'student'
            }
          });
        }
      }, 1000);

    } catch (err) {
      if (import.meta.env.VITE_BASE_URL) {
        console.error("Error:", err);
      }
      showMessage("Failed to connect to backend", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWalletConnect = async (e) => {
    e.preventDefault();

    const address = await connectWallet();

    if (address) {
      setLoginData({
        ...loginData,
        walletAddress: address
      });

      showMessage("Wallet connected successfully", "success");
    }
  };

  const getCurrentFormData = () => {
    return role === "student" ? studentFormData : teacherFormData;
  };

  const getCurrentHandleChange = () => {
    return role === "student" ? handleStudentChange : handleTeacherChange;
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{tab === "login" ? "Welcome Back" : "Join YARCoin"}</h2>
        <p>
          {tab === "login"
            ? "Sign in to your YARCoin account"
            : `Register as a ${role}`}
        </p>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {tab === "register" && (
          <div className="role-toggle">
            <button
              type="button"
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
            >
              Candidate
            </button>
            <button
              type="button"
              className={role === "teacher" ? "active" : ""}
              onClick={() => setRole("teacher")}
            >
              Mentor
            </button>
          </div>
        )}

        {tab === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>

            <div className="input-group">
              <label>Wallet Address</label>
              <input
                type="text"
                name="walletAddress"
                placeholder="Enter your wallet address"
                value={loginData.walletAddress}
                onChange={handleLoginChange}
                required
                disabled={isLoading}
                readOnly
              />
            </div>

            <p className="signup-text">
              Don't have an account?{" "}
              <span onClick={() => !isLoading && setTab("register")}>Sign up</span>
            </p>

            <button type="submit" disabled={isLoading} className="login-btn">
              {isLoading ? "Signing In..." : "Login to YARCoin"}
            </button>

            <button
              type="button"
              className="metamask-btn"
              onClick={handleLoginWalletConnect}>
              Login with Wallet
            </button>


          </form>
        )}

        {tab === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder={`Enter your name`}
                value={getCurrentFormData().name}
                onChange={getCurrentHandleChange()}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={getCurrentFormData().email}
                onChange={getCurrentHandleChange()}
                required
                disabled={isLoading}
              />
            </div>

            {role === "student" ? (
              <>
                <div className="input-group">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g., React, Node.js, Blockchain"
                    value={studentFormData.skills}
                    onChange={handleStudentChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Achievements (comma separated)</label>
                  <input
                    type="text"
                    name="achievements"
                    placeholder="e.g., Hackathon Winner, Open Source Contributor"
                    value={studentFormData.achievements}
                    onChange={handleStudentChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label>Base Price (YARCoins)</label>
                  <input
                    type="number"
                    name="basePrice"
                    placeholder="Enter your base price"
                    value={studentFormData.basePrice}
                    onChange={handleStudentChange}
                    required
                    disabled={isLoading}
                    min="1"
                  />
                </div>
              </>
            ) : (
              <div className="input-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  placeholder="e.g., Machine Learning, Web Development"
                  value={teacherFormData.specialization}
                  onChange={handleTeacherChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}


            <p className="signup-text">
              Already have an account?{" "}
              <span onClick={() => !isLoading && setTab("login")}>Login</span>
            </p>

            <button type="button"
              className="metamask-btn"
              onClick={handleConnectWallet}>
              Connect MetaMask Wallet
            </button>

            <button type="submit" disabled={isLoading || !walletAddress} className="register-btn">
              {isLoading ? "Setting up wallet..." : "Register"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}