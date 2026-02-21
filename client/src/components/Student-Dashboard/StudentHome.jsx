import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaHammer,
  FaCoins,
  FaMoneyBillWave,
  FaRocket,
  FaArrowRight,
  FaTrophy,
  FaChartLine,
  FaBullseye,
  FaClock,
  FaUsers,
  FaAward,
  FaShieldAlt
} from "react-icons/fa";
import "./StudentHome.css";
// import Navbar from "../Navbar/Navbar";

export default function StudentHome() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Method 1: Get from navigation state (most reliable)
    if (location.state && location.state.name) {
      setLoggedInUser(location.state.name);
      localStorage.setItem("username", location.state.name); // Also store it
    }
    // Method 2: Get from localStorage (fallback)
    else {
      const studentName = localStorage.getItem("username") || "";
      setLoggedInUser(studentName);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    alert("You have been logged out!");
    window.location.href = "/";
  };

  const handleEnterPlayground = () => {
    navigate("/student/playground");
  };

  return (
    <div className="student-home">
      {/* <Navbar onLogout={handleLogout} /> */}

      <div className="student-home-container">
        {/* Hero Section - Only content and visual in grid */}
        <div className="student-hero-section">
          <div className="hero-content">
            <div className="welcome-badge">
              <span>Welcome, {loggedInUser || "Member"}!</span>
            </div>

            {/* <h1 className="hero-title">
              Discover Your <span className="highlight">Potential</span> in the Learning Playground
            </h1> */}

            <h1 className="hero-title">
              Discover Your Potential in the Learning Playground
            </h1>

            <p className="hero-description">
              Step into an interactive space where teachers recognize and bid on student talents.
              Showcase your achievements and get noticed by educators in real-time.
            </p>

            <div className="main-cta-section">
              <button
                className="enter-playground-btn"
                onClick={handleEnterPlayground}
              >
                <FaRocket className="btn-icon" />
                Enter Playground
                <FaArrowRight className="btn-arrow" />
              </button>

              <div className="cta-stats">
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Active Members</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">25+</span>
                  <span className="stat-label">Admins</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Live Bids</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-container">
              {/* Bidding Auction Center */}
              <div className="auction-center">
                <div className="auction-podium">
                  <div className="podium-platform">
                    <div className="spotlight"></div>
                    <FaUserGraduate className="student-avatar" />
                  </div>
                  <div className="bidding-active">BIDDING</div>
                </div>

                {/* Rising Bid Numbers */}
                <div className="bid-bubble bid-1">
                  <span className="bid-amount">+50</span>
                  <span className="bid-currency">
                    <FaCoins className="currency-icon" />
                    YARC
                  </span>
                </div>
                <div className="bid-bubble bid-2">
                  <span className="bid-amount">+75</span>
                  <span className="bid-currency">
                    <FaCoins className="currency-icon" />
                    YARC
                  </span>
                </div>
                <div className="bid-bubble bid-3">
                  <span className="bid-amount">+100</span>
                  <span className="bid-currency">
                    <FaCoins className="currency-icon" />
                    YARC
                  </span>
                </div>
                <div className="bid-bubble bid-4">
                  <span className="bid-amount">+125</span>
                  <span className="bid-currency">
                    <FaCoins className="currency-icon" />
                    YARC
                  </span>
                </div>

                {/* Bid Waves */}
                <div className="bid-wave wave-1"></div>
                <div className="bid-wave wave-2"></div>
                <div className="bid-wave wave-3"></div>
              </div>

              {/* Teacher Bidding Cards */}
              <div className="floating-card card-1">
                <div className="card-badge">BIDDING</div>
                <div className="card-header">
                  <FaChalkboardTeacher className="teacher-avatar" />
                  <div className="teacher-info">
                    <span className="teacher-name">Prof. Andrew</span>
                    <span className="subject">Machine Learning</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="bid-info">
                    <span className="current-bid">Current Bid</span>
                    <span className="bid-amount">50 YARC</span>
                    <span className="bid-student">on Yash Kerkar</span>
                  </div>
                </div>
              </div>

              <div className="floating-card card-2">
                <div className="card-badge">BIDDING</div>
                <div className="card-header">
                  <FaChalkboardTeacher className="teacher-avatar" />
                  <div className="teacher-info">
                    <span className="teacher-name">Prof. Raunak Joshi</span>
                    <span className="subject">Deep Learning</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="bid-info">
                    <span className="current-bid">Current Bid</span>
                    <span className="bid-amount">75 YARC</span>
                    <span className="bid-student">on Ankit Bari</span>
                  </div>
                </div>
              </div>

              <div className="floating-card card-3">
                <div className="card-badge">HIGHEST</div>
                <div className="card-header">
                  <FaChalkboardTeacher className="teacher-avatar" />
                  <div className="teacher-info">
                    <span className="teacher-name">Prof. Anjali Pardeshi</span>
                    <span className="subject">Blockchain</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="bid-info">
                    <span className="current-bid">Winning Bid</span>
                    <span className="bid-amount">100 YARC</span>
                    <span className="bid-student">on Rahul Singh</span>
                  </div>
                </div>
              </div>

              {/* Auction Elements */}
              <FaHammer className="auction-hammer" />
              <FaMoneyBillWave className="price-tag" />
            </div>
          </div>
        </div>

        {/* YAR Coin Market Section */}
        <div className="yar-market-section">
          <div className="yar-market-container">

            <div className="yar-market-left">
              <h2 className="yar-title">YAR Coin Market</h2>

              <div className="yar-price-row">
                <span className="yar-price">₹12.43</span>
                <span className="yar-growth">
                  ▲ +3.24%
                </span>
              </div>

              <p className="yar-subtext">
                Live simulated growth based on platform activity
              </p>
            </div>

            <div className="yar-market-right">
              <div className="yar-market-right">
                <svg
                  className="yar-history-graph"
                  viewBox="0 0 600 300"
                  preserveAspectRatio="none"
                >
                  {/* Background grid */}
                  <g className="grid">
                    <line x1="80" y1="50" x2="580" y2="50" />
                    <line x1="80" y1="120" x2="580" y2="120" />
                    <line x1="80" y1="190" x2="580" y2="190" />
                    <line x1="80" y1="260" x2="580" y2="260" />
                  </g>

                  {/* Y Axis */}
                  <line x1="80" y1="30" x2="80" y2="270" className="axis" />

                  {/* X Axis */}
                  <line x1="80" y1="260" x2="580" y2="260" className="axis" />

                  {/* Y Labels */}
                  <text x="20" y="55" className="axis-label">20</text>
                  <text x="20" y="125" className="axis-label">15</text>
                  <text x="20" y="195" className="axis-label">10</text>
                  <text x="20" y="265" className="axis-label">5</text>

                  {/* X Labels */}
                  <text x="100" y="290" className="axis-label">2023</text>
                  <text x="250" y="290" className="axis-label">2024</text>
                  <text x="400" y="290" className="axis-label">2025</text>
                  <text x="520" y="290" className="axis-label">2026</text>

                  {/* Main growth line */}
                  <path
                    d="M80 240
         C150 220, 200 210, 250 200
         S350 170, 400 160
         S500 120, 580 100"
                    fill="none"
                    className="yar-history-line"
                  />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Features Section - OUTSIDE the grid, full width */}
        <div className="features-section">
          <h2 className="features-title">Why Join Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-container">
                <FaBullseye className="feature-icon" />
              </div>
              <h3>Real-time Bidding</h3>
              <p>Experience live bidding sessions where teachers compete to mentor talented students. Watch bids update in real-time.</p>
              <div className="feature-stats">
                <span className="stat">
                  <FaClock className="stat-icon" />
                  Live Updates
                </span>
                <span className="stat">
                  <FaUsers className="stat-icon" />
                  25+ Teachers
                </span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-container">
                <FaChartLine className="feature-icon" />
              </div>
              <h3>Live Analytics</h3>
              <p>Track bidding patterns, teacher preferences, and market trends with our comprehensive analytics dashboard.</p>
              <div className="feature-stats">
                <span className="stat">
                  <FaChartLine className="stat-icon" />
                  Real-time Data
                </span>
                <span className="stat">
                  <FaShieldAlt className="stat-icon" />
                  Secure Tracking
                </span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-container">
                <FaTrophy className="feature-icon" />
              </div>
              <h3>Get Recognized</h3>
              <p>Showcase your skills and achievements to get noticed by top educators. Build your academic reputation.</p>
              <div className="feature-stats">
                <span className="stat">
                  <FaAward className="stat-icon" />
                  Achievement Badges
                </span>
                <span className="stat">
                  <FaUsers className="stat-icon" />
                  Mentor Network
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}