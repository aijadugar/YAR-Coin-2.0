import React, { useState, useRef, useEffect } from "react";
import "./TeacherNavbar.css";
import { Link } from "react-router-dom";

export default function TeacherNavbar({ 
  onLogout, 
  currentTeacher 
}) {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">YARCoin</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">YARCoin</div>
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="navbar-desktop">
        <div className="profile-container" ref={profileRef}>
          <button className="profile-btn" onClick={toggleProfile}>
            <div className="profile-icon">👤</div>
            <span>{storedTeacher.name}</span>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <h3>Teacher Profile</h3>

              <div className="profile-item">
                <span>Name:</span>
                <span>{storedTeacher.name}</span>
              </div>

              <div className="profile-item">
                <span>Email:</span>
                <span>{storedTeacher.email}</span>
              </div>

              <div className="profile-item">
                <span>Specialization:</span>
                <span>{storedTeacher.specialization || "Not specified"}</span>
              </div>

              <div className="profile-item">
                <span>Yarc Balance:</span>
                <span>{storedTeacher.yarBalance || storedTeacher.purse || 0}</span>
              </div>

              <button className="dashboard-btn">
                <Link to="/teacher-workspace">
                  Team Workspace
                </Link>
              </button>

              {/* <button className="penalty-btn">
                <Link to="/penalty">
                  Penalty
                </Link>
              </button>

              <button className="grantAchievement-btn">
                <Link to="/nft">
                  Grant Achievement
                </Link>
              </button> */}

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