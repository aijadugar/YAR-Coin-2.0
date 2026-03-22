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
  FaShieldAlt,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaHeart,
  FaRocket as FaRocketIcon
} from "react-icons/fa";
import "./HomePage.css";
import HomeNavbar from "../Navbar/HomeNavbar"; 

export default function HomePage() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [userRole, setUserRole] = useState(""); 
  const [copied, setCopied] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userName = localStorage.getItem("userName") || localStorage.getItem("username") || "";
    const role = localStorage.getItem("userRole") || ""; 
    setLoggedInUser(userName);
    setUserRole(role); 
  }, [location]);

  const handleEnterPlayground = () => {
    const isLoggedIn = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole"); 
    
    if (isLoggedIn) {
      if (role === "teacher") {
        navigate("/teacher-home");
      } else {
        navigate("/student/playground");
      }
    } else {
      navigate("/auth", { state: { from: "home", message: "Please login to access the Playground" } });
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

    const handleCopy = () => {
    const address = document.getElementById("contractAddress").innerText;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const getRoleDisplayName = (role) => {
    if (role === "student") return "candidate";
    if (role === "teacher") return "mentor";
  }

  return (
    <div className="home-page">
      <HomeNavbar /> 
      
      <main className="home-main">
        <section className="hero-section" id="hero">
          <div className="hero-container">
            <div className="hero-content">
              <div className="welcome-badge">
                <FaRocketIcon className="badge-icon" />
                <span>Welcome{loggedInUser ? `, ${loggedInUser}` : " to YARCoin"}!</span>
                {userRole && <span className="role-badge"> ({getRoleDisplayName(userRole)})</span>}
              </div>

              <div className="contract-box">
                <div className="contract-title">
                  YARCoin Token Contract (Sepolia Testnet)
                </div>

                <div className="contract-address-row">
                  <span id="contractAddress">
                    0x42861CE1c5A357EdE7bd0CAe9A14B1AC95E56061
                  </span>

                  <button 
                  id="copyBtn" 
                  className={`copy-btn-homepage ${copied ? 'copied' : ''}`} onClick={handleCopy}>  

                  {copied ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                  </button>
                
                </div>
              </div>


              <h1 className="hero-title">
                Discover Your <span className="gradient-text">Potential</span> in the 
                <span className="highlight"> Learning Playground</span>
              </h1>

              <p className="hero-description">
                Step into an interactive space where mentors recognize and bid on candidate talents.
                Showcase your achievements, earn YARC coins, and get noticed by top educators in real-time.
              </p>

              <div className="hero-cta">
                <button
                  className="primary-cta"
                  onClick={handleEnterPlayground}
                >
                  <FaRocket className="btn-icon" />
                  Enter Playground
                  <FaArrowRight className="btn-arrow" />
                </button>

                <button
                  className="secondary-cta"
                  onClick={() => scrollToSection("features")}
                >
                  Learn More
                </button>
              </div>

              

              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Active Candidates</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Expert Mentors</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">1,000+</span>
                  <span className="stat-label">Successful Bids</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-container">
                <div className="auction-center">
                  <div className="auction-podium">
                    <div className="podium-platform">
                      <div className="spotlight"></div>
                      <FaUserGraduate className="student-avatar" />
                    </div>
                    <div className="bidding-active">LIVE BIDDING</div>
                  </div>

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

                  <div className="bid-wave wave-1"></div>
                  <div className="bid-wave wave-2"></div>
                  <div className="bid-wave wave-3"></div>
                </div>

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
                      <span className="bid-student">on Yash K.</span>
                    </div>
                  </div>
                </div>

                <div className="floating-card card-2">
                  <div className="card-badge">BIDDING</div>
                  <div className="card-header">
                    <FaChalkboardTeacher className="teacher-avatar" />
                    <div className="teacher-info">
                      <span className="teacher-name">Prof. Raunak</span>
                      <span className="subject">Deep Learning</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="bid-info">
                      <span className="current-bid">Current Bid</span>
                      <span className="bid-amount">75 YARC</span>
                      <span className="bid-student">on Ankit B.</span>
                    </div>
                  </div>
                </div>

                <div className="floating-card card-3">
                  <div className="card-badge">HIGHEST</div>
                  <div className="card-header">
                    <FaChalkboardTeacher className="teacher-avatar" />
                    <div className="teacher-info">
                      <span className="teacher-name">Prof. Anjali</span>
                      <span className="subject">Blockchain</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="bid-info">
                      <span className="current-bid">Winning Bid</span>
                      <span className="bid-amount">100 YARC</span>
                      <span className="bid-student">on Rahul S.</span>
                    </div>
                  </div>
                </div>

                <FaHammer className="auction-hammer" />
                <FaMoneyBillWave className="price-tag" />
              </div>
            </div>
          </div>
        </section>

        <section className="market-section" id="market">
          <div className="market-container">
            <div className="market-header">
              <h2 className="section-title">YAR Coin Market</h2>
              <p className="section-subtitle">Live simulated growth based on platform activity</p>
            </div>

            <div className="market-content">
              <div className="market-left">
                <div className="price-card">
                  <div className="price-header">
                    <FaCoins className="coin-icon" />
                    <span className="coin-name">YAR Coin (YARC)</span>
                  </div>
                  <div className="price-value">
                    <span className="current-price">₹12.43</span>
                    <span className="price-change positive">
                      ▲ +3.24%
                    </span>
                  </div>
                  <div className="price-details">
                    <div className="detail-item">
                      <span>Market Cap</span>
                      <span>₹12.4M</span>
                    </div>
                    <div className="detail-item">
                      <span>24h Volume</span>
                      <span>₹892K</span>
                    </div>
                    <div className="detail-item">
                      <span>Total Supply</span>
                      <span>1M YARC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="market-right">
                <div className="chart-container">
                  <svg
                    className="price-chart"
                    viewBox="0 0 600 300"
                    preserveAspectRatio="none"
                  >
                    
                    <g className="chart-grid">
                      <line x1="80" y1="50" x2="580" y2="50" />
                      <line x1="80" y1="120" x2="580" y2="120" />
                      <line x1="80" y1="190" x2="580" y2="190" />
                      <line x1="80" y1="260" x2="580" y2="260" />
                    </g>

                    {/* Axes */}
                    <line x1="80" y1="30" x2="80" y2="270" className="chart-axis" />
                    <line x1="80" y1="260" x2="580" y2="260" className="chart-axis" />

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

                    {/* Growth line */}
                    <path
                      d="M80 240 C150 220, 200 210, 250 200 S350 170, 400 160 S500 120, 580 100"
                      fill="none"
                      className="chart-line"
                    />
                    
                    {/* Gradient fill under the line */}
                    <path
                      d="M80 240 C150 220, 200 210, 250 200 S350 170, 400 160 S500 120, 580 100 L580 260 L80 260 Z"
                      fill="url(#chart-gradient)"
                      opacity="0.2"
                    />
                    
                    {/* Define gradient */}
                    <defs>
                      <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="features-container">
            <h2 className="section-title">Why Join Our Platform?</h2>
            <p className="section-subtitle">Experience the future of talent recognition and mentorship</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-container">
                  <FaBullseye className="feature-icon" />
                </div>
                <h3>Real-time Bidding</h3>
                <p>Experience live bidding sessions where mentors compete to mentor talented candidates. Watch bids update in real-time.</p>
                <div className="feature-stats">
                  <span className="stat">
                    <FaClock className="stat-icon" />
                    Live Updates
                  </span>
                  <span className="stat">
                    <FaUsers className="stat-icon" />
                    50+ Mentors
                  </span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon-container">
                  <FaChartLine className="feature-icon" />
                </div>
                <h3>Live Analytics</h3>
                <p>Track bidding patterns, mentor preferences, and market trends with our comprehensive analytics dashboard.</p>
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
        </section>

        <section className="how-it-works-section" id="how-it-works">
          <div className="how-it-works-container">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to start your journey</p>
            
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Create Your Profile</h3>
                  <p>Sign up as a candidate or mentor and showcase your skills, achievements, and expertise.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Enter the Playground</h3>
                  <p>Browse candidate profiles, place bids, or receive bids from interested mentors.</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Get Acquired & Earn</h3>
                  <p>Successfully bid candidates get mentored and earn YARC coins for their achievements.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-container">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of candidates and mentors already using YARCoin</p>
            <button className="cta-button" onClick={() => navigate("/auth")}>
              Get Started Now
              <FaArrowRight className="btn-arrow" />
            </button>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>YARCoin</h3>
              <p>Revolutionizing talent recognition through blockchain-powered bidding.</p>
              <div className="social-links">
                <a href="https://github.com/YashKerkarTech04/YAR-Coin-2.0" target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              </div>
            </div>
            
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#market">Market</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#about">About Us</a></li>
              </ul>
            </div>
            
            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Subscribe to our newsletter</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email" />
                <button>Subscribe</button>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2026 YARCoin. All rights reserved. Made with <FaHeart className="heart-icon" /> for education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}