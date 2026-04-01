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

const RECORDS_PER_PAGE = 10;

const Playground = () => {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentStudentBids, setCurrentStudentBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayStudents, setDisplayStudents] = useState([]);
  const [studentNFTs, setStudentNFTs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dataFetched, setDataFetched] = useState(false); //to prevent multiple fetches
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    if (!dataFetched) {
      const timer = setTimeout(() => {
        fetchPlaygroundData();
        setDataFetched(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dataFetched]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4);
      }, 500);
    } else {
      setDotCount(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  

  useEffect(() => {
    if (currentStudent && currentStudent._id) {
      fetchCurrentStudentBids(currentStudent._id);
    }
  }, [currentStudent]);

  useEffect(() => {
    if (students.length > 0 && teachers.length > 0) {
      processAllStudents();
    }
  }, [students, teachers, studentNFTs]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const fetchPlaygroundData = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_BASE_URL;

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

      const teachersResponse = await fetch(`${baseUrl}/api/teachers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const teachersData = await teachersResponse.json();

      let currentStudentData = null;

      if (location.state && location.state.email) {
        currentStudentData = studentsData.find(
          (student) => student.email === location.state.email
        );
      }

      if (!currentStudentData) {
        const storedUserEmail = localStorage.getItem("userEmail");
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

  const fetchCurrentStudentBids = async (studentId) => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const bidsResponse = await fetch(`${baseUrl}/api/biddings/student/${studentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!bidsResponse.ok) throw new Error(`Failed to fetch bids`);

      const bidsData = await bidsResponse.json();
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
      const bidsWithTeacherNames = (student.currentBids || []).map(bid => {
        const teacher = teachers.find(t => t._id === bid.teacherId);
        return { ...bid, teacherName: teacher?.name || 'Unknown Teacher' };
      });

      const ownedByTeacher = student.ownedBy
        ? teachers.find(t => t._id === student.ownedBy)
        : null;

      console.log("Found teacher for", student.name, ':', ownedByTeacher);

      const studentNfts = studentNFTs[student.walletAddress] || [];

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        skills: student.skills || ['Not specified'],
        achievements: student.achievements || ['Not specified'],
        nfts: studentNfts,
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
          nftData[student.walletAddress] = [];
          continue;
        }
        const baseUrl = import.meta.env.VITE_BASE_URL;
        try {
          const response = await fetch(`${baseUrl}/mint/nft/${student.walletAddress}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          });
          if (response.ok) {
            const data = await response.json();
            nftData[student.walletAddress] = data.nfts || [];
          } else {
            nftData[student.walletAddress] = [];
          }
        } catch (nftError) {
          console.error(`Error fetching NFTs for student ${student.walletAddress}:`, nftError);
          nftData[student.walletAddress] = [];
        }
      }
      setStudentNFTs(nftData);
    } catch (error) {
      console.error("Error in fetchNFTsForStudents:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar onLogout={handleLogout} />
        <div className="pl">
          <div className="pl__coin">
            <div className="pl__coin-flare"></div>
            <div className="pl__coin-flare"></div>
            <div className="pl__coin-flare"></div>
            <div className="pl__coin-flare"></div>
            <div className="pl__coin-layers">
              <div className="pl__coin-layer">
                <div className="pl__coin-inscription"></div>
              </div>
              <div className="pl__coin-layer"></div>
              <div className="pl__coin-layer"></div>
              <div className="pl__coin-layer"></div>
              <div className="pl__coin-layer">
                <div className="pl__coin-inscription"></div>
              </div>
            </div>
          </div>
          <div className="pl__shadow"></div>
          <div className="loading-text">Loading{'.'.repeat(dotCount)}</div>
        </div>
      </>
    );
  }

  const filteredStudents = displayStudents.filter(student => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      student.name?.toLowerCase().includes(q) ||
      student.email?.toLowerCase().includes(q) ||
      student.walletAddress?.toLowerCase().includes(q);

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'acquired' && student.ownedBy) ||
      (filterStatus === 'unacquired' && !student.ownedBy);

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredStudents.length / RECORDS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <>
      <Navbar
        onLogout={handleLogout}
        currentStudent={currentStudent}
        currentStudentBids={currentStudentBids}
        getTeacherNameById={getTeacherNameById}
      />
      <div className="playground">
        <div className="playground-search-bar">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="playground-search-input"
              placeholder="Search by name, email or wallet address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          <select
            className="playground-filter-dropdown"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Candidates</option>
            <option value="acquired">Acquired Candidates</option>
            <option value="unacquired">Unacquired Candidates</option>
          </select>
        </div>

        <div className="results-count">
          Showing {filteredStudents.length} record{filteredStudents.length !== 1 ? 's' : ''}
          {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
        </div>

        <div className="playground-content">
          <div className="students-list">
            {paginatedStudents.length === 0 ? (
              <div className="no-students">
                <p>No candidates found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
              </div>
            ) : (
              paginatedStudents.map(student => (
                <div key={student.id} className={`student-row ${student.ownedBy ? 'row-acquired' : ''}`}>
                  <div className="row-identity">
                    <div className="row-avatar">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="row-name-block">
                      <span className="row-name">{student.name}</span>
                      <span className="row-email">{student.email}</span>
                      {student.walletAddress && (
                        <span className="row-wallet" title={student.walletAddress}>
                          {student.walletAddress.slice(0, 10)}…{student.walletAddress.slice(-6)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row-meta">
                    <div className={`status-badge ${student.ownedBy ? 'acquired' : student.currentBids.length > 0 ? 'bidding' : 'available'}`}>
                      {student.ownedBy ? 'Acquired' : student.currentBids.length > 0 ? 'Bidding' : 'Available'}
                    </div>
                    <span className="base-price">{student.basePrice} YARC</span>
                  </div>

                  <div className="row-skills">
                    <span className="row-label">Skills</span>
                    <div className="skills-list">
                      {student.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="row-achievements">
                    <span className="row-label">Achievements</span>
                    <div className="achievements-list">
                      {student.achievements.map((a, i) => (
                        <span key={i} className="achievement-tag">{a}</span>
                      ))}
                    </div>
                  </div>

                  {student.walletAddress && (
                    <div className="row-nfts">
                      <span className="row-label">NFTs</span>
                      {student.nfts && student.nfts.length > 0 ? (
                        <div className="nft-list">
                          {student.nfts.map((nft, index) => {
                            const IconComponent = nftIcons[index % nftIcons.length];
                            return (
                              <div key={nft._id || index} className="nft-item">
                                <div className="nft-badge">
                                  <span className="nft-icon"><IconComponent /></span>
                                  <span className="nft-tooltip">{nft.title}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="no-nfts">No NFTs yet</span>
                      )}
                    </div>
                  )}

                  {student.currentBids.length > 0 && (
                    <div className="row-bids">
                      <span className="row-label">Active Bids</span>
                      <div className="bids-list">
                        {student.currentBids.map((bid, i) => (
                          <div key={i} className="bid-item">
                            <span className="teacher-name">{bid.teacherName}</span>
                            <span className="bid-amount">+{bid.amount} YARC</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {student.ownedBy && (
                    <div className="row-acquisition">
                      <span className="row-label">Acquired By</span>
                      <div className="acquisition-details">
                        <span className="teacher-name">{student.currentTeacher}</span>
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹ Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Playground;