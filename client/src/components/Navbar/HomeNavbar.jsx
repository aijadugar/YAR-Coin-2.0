import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCoins,
  FaTachometerAlt
} from "react-icons/fa";
import "./HomeNavbar.css";

export default function HomeHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");
    
    if (userEmail && userName) {
      setIsLoggedIn(true);
      setUserData({
        name: userName,
        email: userEmail,
        role: userRole
      });
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [location]); // Re-check when location changes (after login/logout)

  const handleAuthClick = () => {
    navigate("/auth");
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserData(null);
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleDashboardNavigation = () => {
    if (userData?.role === "teacher") {
      navigate("/mentor-dashboard");
    } else {
      navigate("/student/playground");
    }
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => (e) => {
    e.preventDefault(); 
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false); 
  };

  return (
    <header className="home-header">
      <div className="header-container">
        <div className="logo-container" onClick={() => navigate("/")}>
          <span className="logo-text">YARCoin</span>
          <span className="logo-badge">Learn & Earn</span>
        </div>

        <nav className="desktop-nav">
          <ul className="nav-links">
            <li>
              <a href="#features" onClick={scrollToSection("features")}>
                Features
              </a>
            </li>
            <li>
              <a href="#market" onClick={scrollToSection("market")}>
                YAR Market
              </a>
            </li>
            <li>
              <a href="#how-it-works" onClick={scrollToSection("how-it-works")}>
                How It Works
              </a>
            </li>
          </ul>
        </nav>

        <div className="desktop-auth">
          {!isLoggedIn ? (
            <button className="auth-btn" onClick={handleAuthClick}>
              <FaSignInAlt className="btn-icon" />
              Login / Register
            </button>
          ) : (
            <div className="profile-section">
              <div className="profile-dropdown-container">
                <button 
                  className="profile-btn" 
                  onClick={toggleProfileDropdown}
                >
                  <div className="profile-avatar">
                    <FaUser />
                  </div>
                  <span className="profile-name">{userData?.name}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <h4>{userData?.name}</h4>
                      <p>{userData?.email}</p>
                      <span className="role-badge">
                        {userData?.role === "teacher" ? "Mentor" : "Candidate"}
                      </span>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item"
                      onClick={handleDashboardNavigation}
                    >
                      <FaTachometerAlt className="dropdown-icon" />
                      Dashboard
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="dropdown-icon" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <ul className="mobile-nav-links">
              <li>
                <a href="#features" onClick={scrollToSection("features")}>
                  Features
                </a>
              </li>
              <li>
                <a href="#market" onClick={scrollToSection("market")}>
                  YAR Market
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={scrollToSection("how-it-works")}>
                  How It Works
                </a>
              </li>
            </ul>
            
            <div className="mobile-auth">
              {!isLoggedIn ? (
                <button className="mobile-auth-btn" onClick={handleAuthClick}>
                  <FaSignInAlt className="btn-icon" />
                  Login / Register
                </button>
              ) : (
                <div className="mobile-profile">
                  <div className="mobile-user-info">
                    <FaUser className="mobile-user-icon" />
                    <div>
                      <p className="mobile-user-name">{userData?.name}</p>
                      <p className="mobile-user-email">{userData?.email}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="mobile-dashboard-btn"
                    onClick={handleDashboardNavigation}
                  >
                    <FaTachometerAlt className="btn-icon" />
                    Dashboard
                  </button>
                  
                  <button 
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="btn-icon" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}