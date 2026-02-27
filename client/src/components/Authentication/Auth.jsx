import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; //for redirecting
import "./Auth.css";

export default function Auth() {

  //useState variables
  const [tab, setTab] = useState("register");  // "register" or "login"
  const [role, setRole] = useState("student");  // "student" or "teacher"
  const [isLoading, setIsLoading] = useState(false); //Disables form buttons during API calls.
  const [message, setMessage] = useState({ text: "", type: "" }); //to show success or error message
  const navigate = useNavigate();

  // Student registration form state
  //For storing the data of 3 forms

  // (a) Student Register
  const [studentFormData, setStudentFormData] = useState({
    name: "", email: "", skills: "", achievements: "", basePrice: ""
  });

  // (b) Teacher registration form state
  const [teacherFormData, setTeacherFormData] = useState({
    name: "", email: "", specialization: ""
  });

  // (c) Login form
  const [loginData, setLoginData] = useState({
    email: "", walletAddress: ""
  });

  // Handle student form changes
  const handleStudentChange = (e) => {
    setStudentFormData({ ...studentFormData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  // Handle teacher form changes
  const handleTeacherChange = (e) => {
    setTeacherFormData({ ...teacherFormData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  //showing temporary success/error messages
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // Submit register form
  const handleRegister = async (e) => {
    e.preventDefault();  //after submitting the form, it prevents the page from getting reload.
    setIsLoading(true); //button for register gets disable, because data is going

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const url = role === "student" 
        ? `${baseUrl}/api/students`
        : `${baseUrl}/api/teachers`;

      const payload = role === "student" ? {
        name: studentFormData.name,
        email: studentFormData.email,
        skills: studentFormData.skills.split(',').map(skill => skill.trim()), //array is getting created
        achievements: studentFormData.achievements.split(',').map(ach => ach.trim()), //array is getting created
        basePrice: parseInt(studentFormData.basePrice)
        // walletAddress auto-assigned by backend for both students and teachers
      } : {
        name: teacherFormData.name,
        email: teacherFormData.email,
        specialization: teacherFormData.specialization
        // walletAddress auto-assigned by backend
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if(!res.ok){
        showMessage("Error: " + (data.error || "Registration failed"), "error");
        return;
      }

      // SHOW WALLET ADDRESS FOR BOTH ROLES (auto-assigned)
      if (data.walletAddress) {
        showMessage(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully! Your auto-assigned wallet: ${data.walletAddress} - COPY THIS FOR LOGIN`, "success");
        // Auto-fill login for convenience
        setLoginData({
          email: role === "student" ? studentFormData.email : teacherFormData.email,
          walletAddress: data.walletAddress
        });
      } else {
        showMessage("✅ Registered successfully! Please check your wallet address.", "success");
      }

      setTab("login");
      
      // Clear forms
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

    } catch (err) {
      console.error("Error:", err);
      showMessage("Failed to connect to backend", "error");
    } finally {
      setIsLoading(false);
    }
  };

// Submit login form - UPDATED VERSION
// const handleLogin = async (e) => {
//   e.preventDefault();
//   setIsLoading(true);

//   try {
//     const baseUrl = import.meta.env.VITE_BASE_URL;

//     const res = await fetch(`${baseUrl}/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: loginData.email,
//         walletAddress: loginData.walletAddress
//       }),
//     });

//     const data = await res.json();
//     console.log("Data:", data);

//     if (!res.ok) {
//       showMessage("Error: " + (data.error || "Login failed"), "error");
//       return;
//     }

//     const user = data.user;
//     const userRole = data.role;

//     console.log("User:", user);
//     console.log("User role:", userRole);

//     // ✅ STORE USER DATA IN LOCALSTORAGE
//     localStorage.setItem("userEmail", user.email);
//     localStorage.setItem("userName", user.name);
//     localStorage.setItem("userRole", userRole);
//     localStorage.setItem("userId", user._id);
//     if (user.walletAddress) {
//       localStorage.setItem("walletAddress", user.walletAddress);
//     }

//     showMessage("Login successful! Redirecting...", "success");

//     // Navigate based on role with user data
//     setTimeout(() => {
//       if (userRole === 'teacher') {
//         navigate("/teacher-home", { 
//           state: { 
//             ...user,
//             role: 'teacher'
//           } 
//         });
//       } else {
//         navigate("/student-home", { 
//           state: { 
//             ...user,
//             role: 'student'
//           } 
//         });
//       }
//     }, 1000);

//   } catch (err) {
//     console.error("Error:", err);
//     showMessage("❌ Failed to connect to backend", "error");
//   } finally {
//     setIsLoading(false);
//   }
// };


const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  const baseUrl = import.meta.env.VITE_BASE_URL;

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
      throw new Error("Backend login failed");
    }

    const user = data.user;
    const userRole = data.role;

    // Store real backend user
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userId", user._id);
    if (user.walletAddress) {
      localStorage.setItem("walletAddress", user.walletAddress);
    }

    showMessage("Login successful! Redirecting...", "success");

    setTimeout(() => {
      navigate(userRole === "teacher" ? "/teacher-home" : "/student-home", {
        state: { ...user, role: userRole }
      });
    }, 1000);

  } catch (err) {
    console.log("⚠ Backend down — using mock login");

    // 🔥 MOCK USER (Frontend Only)
    const mockUser = {
      _id: "mock123",
      name: "Dev User",
      email: loginData.email || "dev@gmail.com",
      walletAddress: "MOCK_WALLET_001"
    };

    const mockRole = "student"; // change to "teacher" if needed

    // Store mock user
    localStorage.setItem("userEmail", mockUser.email);
    localStorage.setItem("userName", mockUser.name);
    localStorage.setItem("userRole", mockRole);
    localStorage.setItem("userId", mockUser._id);
    localStorage.setItem("walletAddress", mockUser.walletAddress);

    showMessage("Backend offline — Dev login successful", "success");

    setTimeout(() => {
      navigate(mockRole === "teacher"?"/teacher-home" : "student-home", {
        state: { ...mockUser, role: mockRole }
      });
    }, 1000);
  } finally {
    setIsLoading(false);
  }
};


  // Get current form data based on role
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
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                disabled={isLoading}
              />
            </div>

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
              />
            </div>

            <p className="signup-text">
              Don't have an account?{" "}
              <span onClick={() => !isLoading && setTab("register")}>Sign up</span>
            </p>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Login to YARCoin"}
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

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : `Register`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}