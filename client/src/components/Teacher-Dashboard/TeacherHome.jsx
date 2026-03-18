import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './TeacherHome.css';
import TeacherNavbar from "../Navbar/TeacherNavbar";
import { Link } from "react-router-dom";

const STUDENTS_PER_PAGE = 10;
const TEACHERS_PER_PAGE = 10;

const TeacherHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedTeachers, setExpandedTeachers] = useState({});
  const [copiedStates, setCopiedStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchInitialData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const studentsResponse = await fetch(`${baseUrl}/api/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!studentsResponse.ok)
        throw new Error(`Failed to fetch students (Status: ${studentsResponse.status})`);
      const studentsData = await studentsResponse.json();

      const teachersResponse = await fetch(`${baseUrl}/api/teachers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!teachersResponse.ok)
        throw new Error(`Failed to fetch teachers (Status: ${teachersResponse.status})`);
      const teachersData = await teachersResponse.json();

      let currentTeacherData = null;
      if (location.state && location.state.email) {
        currentTeacherData = teachersData.find(
          (teacher) => teacher.email === location.state.email
        );
      }
      if (!currentTeacherData) {
        const storedUserEmail = localStorage.getItem('userEmail');
        if (storedUserEmail) {
          currentTeacherData = teachersData.find(
            (teacher) => teacher.email === storedUserEmail
          );
        }
      }

      setStudents(studentsData);
      setTeachers(teachersData);
      setCurrentTeacher(currentTeacherData);
      setCurrentPage(1);
      setTeacherPage(1);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const processStudentForDisplay = (student) => ({
    id: student._id,
    name: student.name,
    email: student.email,
    walletAddress: student.walletAddress,
    skills: student.skills || ['Skills not specified'],
    currentBid: student.yarBalance || 0,
    currentTeacher: student.ownedBy?.name || null,
    basePrice: student.basePrice || 30,
    isAvailable: !student.ownedBy,
  });

  const getTeacherNameById = (teacherId) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };

  const processTeacherForDisplay = (teacher) => ({
    id: teacher._id,
    name: teacher.name,
    email: teacher.email,
    specialization: teacher.specialization || 'Not specified',
    purse: teacher.purse || 10001,
  });

  const getAcquiredStudents = (teacherId) =>
    students.filter((student) => student.ownedBy === teacherId);

  const toggleTeacherDropdown = (teacherId) => {
    setExpandedTeachers((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const handleCopyWallet = (studentId, walletAddress) => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedStates((prev) => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [studentId]: false }));
    }, 2000);
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleBid = async (studentId) => {
    const amount = parseInt(bidAmount);
    if (!amount || amount <= 0) {
      Swal.fire({ icon: 'error', title: 'Invalid Bid', text: 'Please enter a valid bid amount', timer: 2000, showConfirmButton: false });
      return;
    }
    const student = students.find((s) => s._id === studentId);
    if (!student) {
      Swal.fire({ icon: 'error', title: 'Student Not Found', text: 'Student not found', timer: 2000, showConfirmButton: false });
      return;
    }
    if (!currentTeacher) {
      Swal.fire({ icon: 'error', title: 'Teacher Not Found', text: 'Teacher not found', timer: 2000, showConfirmButton: false });
      return;
    }
    if (amount > (currentTeacher.purse || 10000)) {
      Swal.fire({ icon: 'error', title: 'Insufficient Funds', text: `Insufficient YARCoin in purse. You have ${currentTeacher.purse || 0} YARCoins`, timer: 3000, showConfirmButton: false });
      return;
    }
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${baseUrl}/api/biddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentTeacher._id,
          studentId: selectedStudent.id,
          bidAmount: amount,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Bid Successful!', text: 'Your bid has been placed successfully', timer: 2000, showConfirmButton: false }).then(() => {
          fetchInitialData();
          setBidAmount('');
          setSelectedStudent(null);
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Bid Failed', text: result.message || 'Failed to place bid', timer: 2000, showConfirmButton: false });
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error placing bid', timer: 2000, showConfirmButton: false });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out from the system!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({ title: 'Logged out!', text: 'You have been successfully logged out.', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => {
          navigate('/');
        });
      }
    });
  };

  const handleFilterChange = (value) => {
    setActiveFilter(value);
    setSearchQuery('');
    setCurrentPage(1);
    setTeacherPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setTeacherPage(1);
  };

  // Filtered students based on activeFilter and searchQuery
  const getFilteredStudents = () => {
    let base = [];
    if (activeFilter === 'all') {
      base = students.filter((s) => !s.ownedBy);
    } else if (activeFilter === 'myteam') {
      base = students.filter((s) => s.ownedBy === currentTeacher?._id);
    }
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.walletAddress?.toLowerCase().includes(q)
    );
  };

  // Filtered teachers for Admins view
  const getFilteredTeachers = () => {
    if (!searchQuery.trim()) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q)
    );
  };

  // Student pagination
  const filteredStudents = getFilteredStudents();
  const totalStudentPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  // Teacher pagination (admins view)
  const filteredTeachers = getFilteredTeachers();
  const totalTeacherPages = Math.ceil(filteredTeachers.length / TEACHERS_PER_PAGE);
  const paginatedTeachers = filteredTeachers.slice(
    (teacherPage - 1) * TEACHERS_PER_PAGE,
    teacherPage * TEACHERS_PER_PAGE
  );

  const filterOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'myteam', label: 'My Team' },
    { value: 'admins', label: 'Admins' },
  ];

  const getSectionTitle = () => {
    if (activeFilter === 'all') return 'Available Members for Bidding';
    if (activeFilter === 'myteam') return 'My Team';

    return 'Admins & Current Holdings';
  };

  const getSectionBadge = () => {
    if (activeFilter === 'admins') return `${filteredTeachers.length} admins`;
    return `${filteredStudents.length} members`;
  };

  if (loading) {
    return (
      <>
        <TeacherNavbar currentTeacher={currentTeacher} onLogout={handleLogout} />
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
        </div>
      </>
    );
  }

  return (
    <>
      <TeacherNavbar currentTeacher={currentTeacher} onLogout={handleLogout} />
      <div className="bidding-system">
        <div className="bidding-container">

          <section className="students-section">
            {/* Section Header */}
            <div className="section-header">
              <h2>{getSectionTitle()}</h2>
              <span className="section-badge">{getSectionBadge()}</span>
            </div>

            {/* Search + Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder={
                    activeFilter === 'admins'
                      ? 'Search by name, email or specialization...'
                      : 'Search by name, email or wallet address...'
                  }
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => { setSearchQuery(''); setCurrentPage(1); setTeacherPage(1); }} title="Clear search">
                    &times;
                  </button>
                )}
              </div>
              <select
                className="filter-dropdown"
                value={activeFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Students Table (All Students / My Team) */}
            {activeFilter !== 'admins' && (
              <>
                <div className="students-table-wrapper">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Wallet Address</th>
                        <th>Skills</th>
                        <th>Base Price</th>
                        <th>Earned</th>
                        <th>Acquired By</th>

                        {activeFilter === "myteam" && <th>Penalty</th>}
                        {activeFilter === "myteam" && <th>NFT</th>}
                        {activeFilter === 'all' && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={activeFilter === 'all' ? 9 : 8} className="no-results">
                            {searchQuery ? 'No members match your search.' : activeFilter === 'myteam' ? 'You have not acquired any members yet.' : 'No available members.'}
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((student, index) => {
                          const d = processStudentForDisplay(student);
                          const isCopied = copiedStates[d.id] || false;
                          const rowNumber = (currentPage - 1) * STUDENTS_PER_PAGE + index + 1;

                          return (
                            <tr key={d.id} className={!d.isAvailable ? 'row-acquired' : ''}>
                              <td className="col-num">{rowNumber}</td>
                              <td className="col-name">{d.name}</td>
                              <td className="col-email">
                                <span
                                  className="email-link"
                                  onClick={() => handleEmailClick(d.email)}
                                  title={`Send email to ${d.email}`}
                                >
                                  {d.email}
                                </span>
                              </td>
                              <td className="col-wallet">
                                <div className="wallet-cell">
                                  <span className="wallet-text" title={d.walletAddress}>
                                    {d.walletAddress
                                      ? `${d.walletAddress.slice(0, 8)}...${d.walletAddress.slice(-6)}`
                                      : '—'}
                                  </span>
                                  {d.walletAddress && (
                                    <button
                                      className={`copy-btn ${isCopied ? 'copied' : ''}`}
                                      onClick={() => handleCopyWallet(d.id, d.walletAddress)}
                                      title="Copy wallet address"
                                    >
                                      {isCopied ? (
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
                                  )}
                                </div>
                              </td>
                              <td className="col-skills">
                                <div className="skills-cell">
                                  {d.skills.slice(0, 2).map((skill, i) => (
                                    <span key={i} className="skill-tag">{skill}</span>
                                  ))}
                                  {d.skills.length > 2 && (
                                    <span className="skill-more">+{d.skills.length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td className="col-price">{d.basePrice} YARC</td>
                              <td className="col-earned">{d.currentBid} YARC</td>
                              <td className="col-status">
                                {student.ownedBy ? (
                                  <span className="status-badge acquired">
                                    {getTeacherNameById(student.ownedBy)}
                                  </span>
                                ) : (
                                  <span className="status-badge available">Available</span>
                                )}
                              </td>

                              {activeFilter === 'myteam' && (
                                <td className="col-penalty">
                                  <button
                                    className="action-btn penalty-btn"
                                    onClick={() => {
                                      // handle penalty logic here
                                      console.log('Penalty clicked for', d.id);
                                    }}
                                  >
                                    <Link to="/penalty">
                                      Penalty
                                    </Link>
                                  </button>
                                </td>
                              )}
                              {activeFilter === 'myteam' && (
                                <td className="col-nft">
                                  <button
                                    className="action-btn nft-btn"
                                    onClick={() => {
                                      // handle NFT logic here
                                      console.log('NFT clicked for', d.id);
                                    }}
                                  >
                                    <Link to="/nft" className="no-underline">
                                      Grant Achievement
                                    </Link>
                                  </button>
                                </td>
                              )}



                              {activeFilter === 'all' && (
                                <td className="col-action">
                                  {d.isAvailable ? (
                                    <button
                                      className="bid-button"
                                      onClick={() => setSelectedStudent(d)}
                                    >
                                      Place Bid
                                    </button>
                                  ) : (
                                    <button className="bid-button acquired" disabled>
                                      Acquired
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Student Pagination */}
                {totalStudentPages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      &#8592; Prev
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`page-num ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalStudentPages))}
                      disabled={currentPage === totalStudentPages}
                    >
                      Next &#8594;
                    </button>
                  </div>
                )}
                {filteredStudents.length > 0 && (
                  <p className="pagination-info">
                    Showing {(currentPage - 1) * STUDENTS_PER_PAGE + 1}–{Math.min(currentPage * STUDENTS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} members
                  </p>
                )}
              </>
            )}

            {/* Admins View */}
            {activeFilter === 'admins' && (
              <>
                <div className="teachers-list-table">
                  {paginatedTeachers.length === 0 ? (
                    <div className="no-results-admin">No admins match your search.</div>
                  ) : (
                    paginatedTeachers.map((teacher) => {
                      const dt = processTeacherForDisplay(teacher);
                      const acquired = getAcquiredStudents(teacher._id);
                      const isExpanded = expandedTeachers[teacher._id];

                      return (
                        <div key={dt.id} className="teacher-row">
                          <div className="teacher-row-main">
                            <div className="teacher-col teacher-col-name">
                              <span className="teacher-avatar">{dt.name.charAt(0).toUpperCase()}</span>
                              <div>
                                <div className="teacher-name">{dt.name}</div>
                                <div className="teacher-spec">{dt.specialization}</div>
                              </div>
                            </div>
                            <div className="teacher-col teacher-col-email">
                              <span className="col-label">Email</span>
                              <span>{dt.email}</span>
                            </div>
                            <div className="teacher-col teacher-col-purse">
                              <span className="col-label">Purse</span>
                              <span className="purse-amount">{dt.purse} YARC</span>
                            </div>
                            <div className="teacher-col teacher-col-toggle">
                              <button
                                className="toggle-btn"
                                onClick={() => toggleTeacherDropdown(teacher._id)}
                              >
                                Acquired Members ({acquired.length})
                                <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>&#9660;</span>
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="teacher-acquired-list">
                              {acquired.length > 0 ? (
                                acquired.map((s) => (
                                  <div key={s._id} className="acquired-row">
                                    <span className="acquired-name">{s.name}</span>
                                    <span className="acquired-email">{s.email}</span>
                                    <span className="acquired-balance">{s.yarBalance} YARC</span>
                                  </div>
                                ))
                              ) : (
                                <div className="no-acquisitions">No members acquired yet</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Teacher Pagination */}
                {totalTeacherPages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      onClick={() => setTeacherPage((p) => Math.max(p - 1, 1))}
                      disabled={teacherPage === 1}
                    >
                      &#8592; Prev
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: totalTeacherPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`page-num ${teacherPage === page ? 'active' : ''}`}
                          onClick={() => setTeacherPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      className="page-btn"
                      onClick={() => setTeacherPage((p) => Math.min(p + 1, totalTeacherPages))}
                      disabled={teacherPage === totalTeacherPages}
                    >
                      Next &#8594;
                    </button>
                  </div>
                )}
                {filteredTeachers.length > 0 && (
                  <p className="pagination-info">
                    Showing {(teacherPage - 1) * TEACHERS_PER_PAGE + 1}–{Math.min(teacherPage * TEACHERS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length} admins
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        {/* Bid Modal */}
        {selectedStudent && (
          <div className="modal-overlay">
            <div className="bid-modal">
              <h2>Place Bid for {selectedStudent.name}</h2>
              <div className="bid-details">
                <p>Base Price: <strong>{selectedStudent.basePrice} YARCoin</strong></p>
                <p>Current Earnings: <strong>{selectedStudent.currentBid} YARCoin</strong></p>
                <p>Status: <strong>{selectedStudent.currentTeacher ? `Acquired by ${selectedStudent.currentTeacher}` : 'Available'}</strong></p>
                <p>Your Balance: <strong>{currentTeacher?.purse || 10000} YARCoin</strong></p>
              </div>
              <div className="bid-input-group">
                <label htmlFor="bidAmount">Your Bid Amount (YARCoin):</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter the amount"
                  min={selectedStudent.basePrice}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setSelectedStudent(null)}>Cancel</button>
                <button className="confirm-bid-btn" onClick={() => handleBid(selectedStudent.id)}>Confirm Bid</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherHome;
