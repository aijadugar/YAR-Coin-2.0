import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./TeacherNavbar.css";

export default function TeacherNavbar({ onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
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
    <nav className="teacher-navbar">
      <div className="teacher-navbar-brand">
        <div className="teacher-navbar-logo">YARCoin</div>
        <button 
          className="teacher-mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="teacher-navbar-desktop">
        {/* <ul className="teacher-navbar-tabs">
          <li className="teacher-tab-item">
            <Link 
              to="/teacher" 
              className={`teacher-tab-link ${isActiveTab('/teacher') ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li className="teacher-tab-item">
            <Link 
              to="/teacher/profile" 
              className={`teacher-tab-link ${isActiveTab('/teacher/profile') ? 'active' : ''}`}
            >
              Profile
            </Link>
          </li>
        </ul> */}

        <button className="teacher-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`teacher-navbar-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="teacher-mobile-overlay" onClick={closeMobileMenu}></div>
        <div className="teacher-mobile-content">
          <div className="teacher-mobile-header">
            <div className="teacher-navbar-logo">Teacher Dashboard</div>
          </div>
          
          <ul className="teacher-mobile-tabs">
            <li className="teacher-mobile-tab-item">
              <Link 
                to="/teacher" 
                className={`teacher-mobile-tab-link ${isActiveTab('/teacher') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>
            <li className="teacher-mobile-tab-item">
              <Link 
                to="/teacher/profile" 
                className={`teacher-mobile-tab-link ${isActiveTab('/teacher/profile') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Profile
              </Link>
            </li>
            <li className="teacher-mobile-tab-item">
              <button 
                className="teacher-mobile-logout-btn"
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