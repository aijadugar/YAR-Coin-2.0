import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Playground.css';
import Navbar from "../Navbar/Navbar";
import { 
FaTrophy, 
FaMedal, 
FaAward, 
FaCrown, 
FaStar 
} from "react-icons/fa";

const nftIcons = [
  FaTrophy,
  FaMedal,
  FaAward,
  FaCrown,
  FaStar
];



const Playground = () => {
  // const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentStudentBids, setCurrentStudentBids] = useState([]); // New state for current student's bids
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [displayStudents, setDisplayStudents] = useState([]);
  const [studentNFTs, setStudentNFTs] = useState({});

  useEffect(() => {
    fetchPlaygroundData();
  }, []);

  // Fetch current student's bids when currentStudent is available
  useEffect(() => {
    if (currentStudent && currentStudent._id) {
      fetchCurrentStudentBids(currentStudent._id);
    }
  }, [currentStudent]);

  // Process students when both students and teachers data is available
  useEffect(() => {
    if (students.length > 0 && teachers.length > 0) {
      processAllStudents();
    }
  }, [students, teachers, studentNFTs]);

  const fetchPlaygroundData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data from backend...");
      const baseUrl = import.meta.env.VITE_BASE_URL;
      
      // Fetch all students
      const studentsResponse = await fetch(`${baseUrl}/api/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!studentsResponse.ok)
        throw new Error(`Failed to fetch students (Status: ${studentsResponse.status})`);

      const studentsData = await studentsResponse.json();
      
      // Fetch all teachers
      const teachersResponse = await fetch(`${baseUrl}/api/teachers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      const teachersData = await teachersResponse.json();

      console.log("Students data:", studentsData);
      console.log("Teachers data:", teachersData);
      
      let currentStudentData = null;

      // Method 1: Check if student data was passed via navigation state
      if (location.state && location.state.email) {
        console.log("📍 Finding student from navigation state...");
        currentStudentData = studentsData.find(
          (student) => student.email === location.state.email
        );
      }

      // Method 2: Check localStorage for logged-in student
      if (!currentStudentData) {
        const storedUserEmail = localStorage.getItem("userEmail");
        const storedUserName = localStorage.getItem("userName");
        console.log("📍 Finding student from localStorage:", { storedUserEmail, storedUserName });
        
        if (storedUserEmail) {
          currentStudentData = studentsData.find(
            (student) => student.email === storedUserEmail
          );
        }
      }

      setStudents(studentsData);
      fetchNFTsForStudents(studentsData);
      setTeachers(teachersData);
      setCurrentStudent(currentStudentData);
      
    } catch (error) {
      console.error('Error fetching playground data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch bids for the current student
  const fetchCurrentStudentBids = async (studentId) => {
    try {
      console.log(`🔄 Fetching bids for student: ${studentId}`);
      const baseUrl = import.meta.env.VITE_BASE_URL;
      
      const bidsResponse = await fetch(`${baseUrl}/api/biddings/student/${studentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!bidsResponse.ok) {
        throw new Error(`Failed to fetch bids (Status: ${bidsResponse.status})`);
      }

      const bidsData = await bidsResponse.json();
      console.log("Current student bids:", bidsData);
      
      // Process bids to include teacher names
      const processedBids = bidsData.map(bid => {
        const teacher = teachers.find(t => t._id === bid.teacherId);
        return {
          ...bid,
          teacherName: teacher?.name || 'Unknown Teacher',
          teacherEmail: teacher?.email || 'Unknown Email'
        };
      });

      setCurrentStudentBids(processedBids);
    } catch (error) {
      console.error('Error fetching current student bids:', error);
    }
  };

  const processAllStudents = () => {
  const processedStudents = students.map(student => {
    // Get teacher names for bids
    const bidsWithTeacherNames = (student.currentBids || []).map(bid => {
      const teacher = teachers.find(t => t._id === bid.teacherId);
      return {
        ...bid,
        teacherName: teacher?.name || 'Unknown Teacher'
      };
    });

    // Look up teacher name for ownedBy
    const ownedByTeacher = student.ownedBy ? 
      teachers.find(t => t._id === student.ownedBy) : null;

    // ✅ FIX: Get NFTs for this student using walletAddress as key
    const studentNfts = studentNFTs[student.walletAddress] || [];
    console.log(`Processing ${student.name} with ${studentNfts.length} NFTs:`, studentNfts);

    return {
      id: student._id,
      name: student.name,
      email: student.email,
      skills: student.skills || ['Not specified'],
      achievements: student.achievements || ['Not specified'],
      nfts: studentNfts, // This should now contain the actual NFT array
      currentBid: student.yarBalance || 0,
      currentTeacher: ownedByTeacher?.name || null,
      basePrice: student.basePrice || 30,
      isAvailable: !student.ownedBy,
      currentBids: bidsWithTeacherNames,
      ownedBy: student.ownedBy,
      ownedByTeacher: ownedByTeacher,
      walletAddress: student.walletAddress
    };
  });

  setDisplayStudents(processedStudents);
};

  const getTeacherNameById = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
 
    const fetchNFTsForStudents = async (studentsData) => {
  try {
    const nftData = {};
    
    for (const student of studentsData) {
      if (!student.walletAddress) {
        nftData[student.walletAddress] = []; // Set empty array if no wallet
        continue;
      }

      try {
        const response = await fetch(
          `https://fictional-journey-9796755g5qgwc7gwg-5000.app.github.dev/mint/nft/${student.walletAddress}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`NFTs for ${student.name}:`, data);
          
          // ✅ FIX: Extract the nfts array from the response object
          // The API returns { success: true, count: 2, nfts: [...] }
          const nftsArray = data.nfts || []; // Get the nfts property or empty array
          
          console.log(`Extracted ${nftsArray.length} NFTs for ${student.name}:`, nftsArray);
          nftData[student.walletAddress] = nftsArray;
        } else {
          console.log(`No NFTs found for ${student.name}`);
          nftData[student.walletAddress] = [];
        }
      } catch (error) {
        console.error(`Error fetching NFTs for ${student.name}:`, error);
        nftData[student.walletAddress] = [];
      }
    }

    console.log("All NFT data:", nftData);
    setStudentNFTs(nftData);
  } catch (error) {
    console.error("Error in fetchNFTsForStudents:", error);
  }
};

  if (loading) {
    return (
      <>
        <Navbar onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner">
            <h3>Loading Playground...</h3>
            <p>Fetching members data...</p>
          </div>
        </div>
      </>
    );
  }

  // Filter students based on active tab
  const filteredStudents = displayStudents.filter(student => {
    if (activeTab === 'bidding') return student.currentBids.length > 0 && !student.ownedBy;
    if (activeTab === 'acquired') return student.ownedBy;
    return true; // 'all' tab
  });

  return (
    <>
      <Navbar 
        onLogout={handleLogout}
        currentStudent={currentStudent}
        currentStudentBids={currentStudentBids}
        getTeacherNameById={getTeacherNameById}
      />
      <div className="playground">
        <header className="playground-header">
        </header>
        <div className="playground-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Members
          </button>
          <button 
            className={`tab-button ${activeTab === 'acquired' ? 'active' : ''}`}
            onClick={() => setActiveTab('acquired')}
          >
            Acquired
          </button>
        </div>

        <div className="playground-content">
          <section className="students-section">
            <h2>
              {activeTab === 'all' && `All Members (${filteredStudents.length})`}
              {activeTab === 'acquired' && `Acquired Members (${filteredStudents.length})`}
            </h2>
            
            <div className="students-grid">
              {filteredStudents.map(student => (
                <div key={student.id} className={`student-card ${student.ownedBy ? 'acquired' : ''}`}>
                  <div className="student-header">
                    <div className="student-basic-info">
                      <h3>{student.name}</h3>
                      <p className="student-email">{student.email}</p>
                      <div className={`status-badge ${student.ownedBy ? 'acquired' : student.currentBids.length > 0 ? 'bidding' : 'available'}`}>
                        {student.ownedBy ? 'Acquired' : student.currentBids.length > 0 ? 'Bidding' : 'Available'}
                      </div>
                    </div>
                    <div className="student-value">
                      <span className="base-price">{student.basePrice} YARC</span>
                    </div>
                  </div>

                  <div className="student-details">
                    <div className="skills-section">
                      <h4>Skills:</h4>
                      <div className="skills-list">
                        {student.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>


                    {student.nfts && student.nfts.length > 0 ? (
                      <div className="nft-section">
                        <h4>NFT Achievements:</h4>
                          <div className="nft-list">
                           {student.nfts.map((nft, index) => {

                            const IconComponent = nftIcons[index % nftIcons.length];

                            return (
                              <div key={nft._id || index} className="nft-item">

                                <div className="nft-badge">
                                  <span className="nft-icon">
                                    <IconComponent />
                                  </span>

                                  <span className="nft-title">{nft.title}</span>
                                  <span className="nft-tooltip">{nft.description}</span>
                                </div>

                              </div>
                            );

                          })}
                        </div>
                      </div>
                    ) : student.walletAddress ? (
                      <div className="nft-section">
                        <h4>NFT Achievements:</h4>
                        <p className="no-nfts">No NFTs yet</p>
                      </div>
                    ) : null}

                    

                    <div className="achievements-section">
                      <h4>Achievements:</h4>
                      <div className="achievements-list">
                        {student.achievements.map((achievement, index) => (
                          <span key={index} className="achievement-tag">{achievement}</span>
                        ))}
                      </div>
                    </div>

                    {/* Current Bids Section */}
                    {student.currentBids.length > 0 && (
                      <div className="bids-section">
                        <h4>Active Bids:</h4>
                        <div className="bids-list">
                          {student.currentBids.map((bid, index) => (
                            <div key={index} className="bid-item">
                              <span className="teacher-name">{bid.teacherName}</span>
                              <span className="bid-amount">+{bid.amount} YARC</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Acquisition Info */}
                    {student.ownedBy && (
                      <div className="acquisition-info">
                        <h4>Acquired By:</h4>
                        <div className="acquisition-details">
                          <span className="teacher-name">{student.currentTeacher}</span>
                          <span className="acquisition-value">for {student.currentBid} YARC</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="no-students">
                <p>
                  {activeTab === 'bidding' && 'No students currently have active bids.'}
                  {activeTab === 'acquired' && 'No students have been acquired yet.'}
                  {activeTab === 'all' && 'No students found.'}
                </p>
              </div>
            )}
          </section>
        </div>

       
      </div>
    </>
  );
};

export default Playground;