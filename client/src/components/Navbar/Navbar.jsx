import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar({ 
  onLogout, 
  currentStudent, 
  currentStudentBids, 
  getTeacherNameById 
}) {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef();

  // 🔥 DEV LOGIN FALLBACK (if backend user not passed)
  const storedUser = currentStudent || (
    localStorage.getItem("userName") && {
      _id: localStorage.getItem("userId"),
      name: localStorage.getItem("userName"),
      email: localStorage.getItem("userEmail"),
      basePrice: localStorage.getItem("basePrice") || 100,
      yarBalance: localStorage.getItem("yarBalance") || 1000,
      ownedBy: null
    }
  );

  const handleLogout = () => {
    localStorage.clear(); // clear all dev login data
    if (onLogout) onLogout();
    window.location.href = "/"; // redirect to auth page
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  // Close dropdown when clicking outside
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

        {/* Profile Section */}
        {storedUser && (
          <div className="profile-container" ref={profileRef}>
            <button className="profile-btn" onClick={toggleProfile}>
              <div className="profile-icon">👤</div>
              <span>{storedUser.name}</span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <h3>Your Profile</h3>

                <div className="profile-item">
                  <span>Name:</span>
                  <span>{storedUser.name}</span>
                </div>

                <div className="profile-item">
                  <span>Email:</span>
                  <span>{storedUser.email}</span>
                </div>

                <div className="profile-item">
                  <span>Base Price:</span>
                  <span>{storedUser.basePrice} YARC</span>
                </div>

                <div className="profile-item">
                  <span>Current Biddings:</span>
                  {currentStudentBids?.length > 0 ? (
                    <details>
                      <summary>
                        View {currentStudentBids.length} Bid
                        {currentStudentBids.length !== 1 && "s"}
                      </summary>
                      {currentStudentBids.map((bid, index) => (
                        <div key={bid._id || index}>
                          {bid.teacherName} - {bid.bidAmount} YARC
                        </div>
                      ))}
                    </details>
                  ) : (
                    <span>No active bids</span>
                  )}
                </div>

                <div className="profile-item">
                  <span>Status:</span>
                  <span>
                    {storedUser.ownedBy && getTeacherNameById
                      ? `Acquired by ${getTeacherNameById(storedUser.ownedBy)}`
                      : "Available for Bidding"}
                  </span>
                </div>

                <div className="profile-item">
                  <span>Yarc Balance:</span>
                  <span>{storedUser.yarBalance}</span>
                </div>


                <button className="dashboard-btn">
                   <Link to="/student-workspace">
                      Team Workspace
                   </Link>
                </button>

                <button className="dex-btn">
                    <Link to="/dexes">
                      DEX
                    </Link>
                </button>

                 <button className="dropdown-logout-btn">
                    <Link to="/penaltyhistory">
                      View Penalty History
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