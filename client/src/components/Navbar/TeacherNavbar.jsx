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

  // 🔥 DEV LOGIN FALLBACK
  const storedTeacher = currentTeacher || (
    localStorage.getItem("teacherName") && {
      _id: localStorage.getItem("teacherId"),
      name: localStorage.getItem("teacherName"),
      email: localStorage.getItem("teacherEmail"),
      basePrice: localStorage.getItem("basePrice") || 100,
      yarBalance: localStorage.getItem("yarBalance") || 1000,
      ownedBy: null
    }
  );

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

        {storedTeacher && (
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
                  <span>Yarc Balance:</span>
                  <span>{storedTeacher.purse || 10000}</span>
                </div>

                {/* <Link to="/teacher-workspace" className="dashboard-btn">
                  Team Workspace
                </Link> */}

                <button className="dashboard-btn">
                    <Link to="/teacher-workspace">
                      Team Workspace
                    </Link>
                </button>

                <button className="penalty-btn">
                    <Link to="/penalty">
                      Penalty
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
        )}

      </div>
    </nav>
  );
}