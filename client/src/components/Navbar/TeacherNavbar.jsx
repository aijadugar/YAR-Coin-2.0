import React, { useState, useRef, useEffect } from "react";
import "./TeacherNavbar.css";
import { Link, useNavigate } from "react-router-dom";

export default function TeacherNavbar({ 
  onLogout, 
  currentTeacher 
}) {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef();

  const storedTeacher = currentTeacher;

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If no teacher is logged in, don't render the navbar with profile
  if (!storedTeacher) {
    return (
      <nav className="teacher-navbar">
        <div className="teacher-navbar-brand">
          <div className="navbar-logo-container" onClick={() => navigate("/")}>
          <span className="logo-text">YARCoin</span>
          <span className="logo-badge">Learn & Earn</span>
        </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="teacher-navbar">
      <div className="teacher-navbar-brand">
        <div className="navbar-logo-container" onClick={() => navigate("/")}>
          <span className="logo-text">YARCoin</span>
          <span className="logo-badge">Learn & Earn</span>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="teacher-navbar-desktop">
        <div className="profile-container" ref={profileRef}>
          <button className="teacher-profile-btn" onClick={toggleProfile}>
            <div className="teacher-profile-icon">👤</div>
            <span>{storedTeacher.name}</span>
          </button>

          {profileOpen && (
            <div className="teacher-profile-dropdown">
              <h3>Mentor Profile</h3>

              <div className="teacher-profile-item">
                <span>Name:</span>
                <span>{storedTeacher.name}</span>
              </div>

              <div className="teacher-profile-item">
                <span>Email:</span>
                <span>{storedTeacher.email}</span>
              </div>

              <div className="teacher-profile-item">
                <span>Specialization:</span>
                <span>{storedTeacher.specialization || "Not specified"}</span>
              </div>

              <div className="teacher-profile-item">
                <span>Yarc Balance:</span>
                <span>{storedTeacher.yarBalance ?? storedTeacher.purse ?? 0}</span>
              </div>

              <button className="dashboard-btn">
                <Link to="/teacher-workspace">
                  Team Workspace
                </Link>
              </button>

              <button 
                className="dropdown-logout-btn" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}