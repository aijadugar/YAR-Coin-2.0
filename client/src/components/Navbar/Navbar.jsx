import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("username");
    if (onLogout) onLogout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActiveTab = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">YARCoin</div>
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-desktop">
        {/* <ul className="navbar-tabs">
          <li className="tab-item">
            <Link 
              to="/" 
              className={`tab-link ${isActiveTab('/') ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li className="tab-item">
            <Link 
              to="/profile" 
              className={`tab-link ${isActiveTab('/profile') ? 'active' : ''}`}
            >
              Profile
            </Link>
          </li>
        </ul> */}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`navbar-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        <div className="mobile-content">
          <div className="mobile-header">
            <div className="navbar-logo">Student Dashboard</div>
          </div>
          
          <ul className="mobile-tabs">
            <li className="mobile-tab-item">
              <Link 
                to="/" 
                className={`mobile-tab-link ${isActiveTab('/') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>
            <li className="mobile-tab-item">
              <Link 
                to="/profile" 
                className={`mobile-tab-link ${isActiveTab('/profile') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Profile
              </Link>
            </li>
            <li className="mobile-tab-item">
              <button 
                className="mobile-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}