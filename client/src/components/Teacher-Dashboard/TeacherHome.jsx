import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './TeacherHome.css';
import TeacherNavbar from "../Navbar/TeacherNavbar";

const TeacherHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);  
  const [teachers, setTeachers] = useState([]); 
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedTeachers, setExpandedTeachers] = useState({}); // Track which teacher dropdowns are open

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      // ✅ Fetch students
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

      // ✅ Fetch teachers
      const teachersResponse = await fetch(`${baseUrl}/api/teachers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!teachersResponse.ok)
        throw new Error(`Failed to fetch teachers (Status: ${teachersResponse.status})`);

      const teachersData = await teachersResponse.json();

      let currentTeacherData = null;

      // Method 1: Check if teacher data was passed via navigation state
      if (location.state && location.state.email) {
        currentTeacherData = teachersData.find(
          (teacher) => teacher.email === location.state.email
        );
      }

      // Method 2: Check localStorage for logged-in teacher
      if (!currentTeacherData) {
        const storedUserEmail = localStorage.getItem("userEmail");
        const storedUserName = localStorage.getItem("userName");
        console.log("📍 Finding teacher from localStorage:", { storedUserEmail, storedUserName });
        
        if (storedUserEmail) {
          currentTeacherData = teachersData.find(
            (teacher) => teacher.email === storedUserEmail
          );
        }
      }

      // Method 3: If still not found, use the first teacher as fallback (for testing)
      if (!currentTeacherData && teachersData.length > 0) {
        console.log("⚠️ Using first teacher as fallback");
        currentTeacherData = teachersData[0];
      }

      console.log("👨‍🏫 Current teacher identified:", currentTeacherData);

      setStudents(studentsData);
      setTeachers(teachersData);
      setCurrentTeacher(currentTeacherData);
    } catch (error) {
      console.error("❌ Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Process student data for display
  const processStudentForDisplay = (student) => ({
    id: student._id,
    name: student.name,
    email: student.email,
    skills: student.skills || ['Skills not specified'],
    achievements: student.achievements || ['Achievements not specified'],
    currentBid: student.yarBalance || 0,
    currentTeacher: student.ownedBy?.name || null,
    basePrice: student.basePrice || 30,
    isAvailable: !student.ownedBy,
  });

  const getTeacherNameById = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };

  // 🔹 Process teacher data for display
  const processTeacherForDisplay = (teacher) => ({
    id: teacher._id,
    name: teacher.name,
    email: teacher.email,
    specialization: teacher.specialization || 'Not specified',
    purse: teacher.purse || 10001,
  });

  // 🔹 Get acquired students for a specific teacher
  const getAcquiredStudents = (teacherId) => {
    return students.filter(student => student.ownedBy === teacherId);
  };

  // 🔹 Toggle dropdown for a specific teacher
  const toggleTeacherDropdown = (teacherId) => {
    setExpandedTeachers(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
  };

  const handleBid = async (studentId) => {
    const amount = parseInt(bidAmount);
    if (!amount || amount <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Bid',
        text: 'Please enter a valid bid amount',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    const student = students.find((s) => s._id === studentId);
    if (!student) {
      Swal.fire({
        icon: 'error',
        title: 'Student Not Found',
        text: 'Student not found',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!currentTeacher) {
      Swal.fire({
        icon: 'error',
        title: 'Teacher Not Found',
        text: 'Teacher not found',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (amount > (currentTeacher.purse || 10000)) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Funds',
        text: `Insufficient YARCoin in purse. You have ${currentTeacher.purse || 0} YARCoins`,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/biddings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: currentTeacher._id,
            studentId: selectedStudent.id,
            bidAmount: amount,
          }),
        }
      );

      console.log("Current Teacher:", currentTeacher);
      console.log("Current Student:", selectedStudent);
      console.log('Current Amount:', amount);

      const result = await response.json();
      console.log("Result:", result);

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Bid Successful!',
          text: 'Your bid has been placed successfully',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          fetchInitialData();
          setBidAmount('');
          setSelectedStudent(null);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Bid Failed',
          text: result.message || 'Failed to place bid',
          timer: 2000,
          showConfirmButton: false
        });
      }

    } catch (error) {
      console.error('Error placing bid:', error);
      if (error.message.includes('Failed to fetch')) {
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Bidding endpoint not available yet',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error placing bid',
          timer: 2000,
          showConfirmButton: false
        });
      }
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
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/');
        });
      }
    });
  };

  if (loading) {
    return (
      <>
        <TeacherNavbar onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner">
            <h3>Loading YARCoin Bidding System...</h3>
            <p>Connecting to friend&apos;s backend server...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TeacherNavbar onLogout={handleLogout} />
      <div className="bidding-system">
        <header className="bidding-header">
          <h1>YARCoin Bidding System</h1>
          <p>Welcome, {currentTeacher?.name || 'Teacher'}</p>
          <p className="teacher-email">{currentTeacher?.email}</p>
          <p className="teacher-balance">
            Your YARCoin Balance: <strong>{currentTeacher?.purse || 10000} YARCoins</strong>
          </p>
        </header>

        <div className="bidding-container">
          {/* Students Section */}
          <section className="students-section">
            <h2>Available Members for Bidding ({students.filter((s) => !s.ownedBy).length})</h2>
            <div className="students-grid">
              {students.map((student) => {
                const displayStudent = processStudentForDisplay(student);
                return (
                  <div
                    key={displayStudent.id}
                    className={`student-card ${!displayStudent.isAvailable ? 'acquired' : ''}`}
                  >
                    <div className="student-info">
                      <h3>{displayStudent.name}</h3>
                      <p className="student-email">{displayStudent.email}</p>
                      <div className="skills">
                        {displayStudent.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="bid-info">
                        <p className="base-price">
                          Base Price: <strong>{displayStudent.basePrice} YARCoin</strong>
                        </p>
                        <p className="current-bid">
                          Earned YARCoins: <strong>{displayStudent.currentBid} YARCoin</strong>
                        </p>
                        <p className="current-teacher">
                          Status:{' '}
                          <strong>
                            {student.ownedBy
                              ? `Acquired by ${getTeacherNameById(student.ownedBy)}`
                              : 'Available'}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {displayStudent.isAvailable ? (
                      <button
                        className="bid-button"
                        onClick={() => setSelectedStudent(displayStudent)}
                      >
                        Place Bid
                      </button>
                    ) : (
                      <button className="bid-button acquired" disabled>
                        Already Acquired
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Teachers Section */}
          <section className="teachers-section">
            <h2>Admins & Current Holdings ({teachers.length})</h2>
            <div className="teachers-list">
              {teachers.map((teacher) => {
                const displayTeacher = processTeacherForDisplay(teacher);
                const acquiredStudents = getAcquiredStudents(teacher._id);
                const isExpanded = expandedTeachers[teacher._id];
                
                return (
                  <div key={displayTeacher.id} className="teacher-card">
                    <div className="teacher-header">
                      <h3>{displayTeacher.name}</h3>
                      <span className="purse-amount">{displayTeacher.purse} YARCoin</span>
                    </div>
                    <p className="teacher-email">{displayTeacher.email}</p>
                    <p className="teacher-specialization">
                      {displayTeacher.specialization}
                    </p>
                    
                    {/* Acquired Students Dropdown */}
                    <div className="acquired-students-dropdown">
                      <div 
                        className="dropdown-header"
                        onClick={() => toggleTeacherDropdown(teacher._id)}
                      >
                        <span className="dropdown-title">
                          Acquired Members ({acquiredStudents.length})
                        </span>
                        <span className={`dropdown-arrow ${isExpanded ? 'expanded' : ''}`}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div className="dropdown-content">
                          {acquiredStudents.length > 0 ? (
                            <div className="acquired-students-list">
                              {acquiredStudents.map((student) => (
                                <div key={student._id} className="acquired-student-item">
                                  <div className="student-info">
                                    <span className="student-name">{student.name}</span>
                                    <span className="student-email">{student.email}</span>
                                  </div>
                                  <div className="student-price">{student.yarBalance} YARC</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="no-acquisitions">
                              No members acquired yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bid Modal */}
        {selectedStudent && (
          <div className="modal-overlay">
            <div className="bid-modal">
              <h2>Place Bid for {selectedStudent.name}</h2>
              <div className="bid-details">
                <p>
                  Base Price: <strong>{selectedStudent.basePrice} YARCoin</strong>
                </p>
                <p>
                  Current Earnings: <strong>{selectedStudent.currentBid} YARCoin</strong>
                </p>
                <p>
                  Status:{' '}
                  <strong>
                    {selectedStudent.currentTeacher
                      ? `Acquired by ${selectedStudent.currentTeacher}`
                      : 'Available'}
                  </strong>
                </p>
                <p>
                  Your Balance: <strong>{currentTeacher?.purse || 10000} YARCoin</strong>
                </p>
              </div>
              <div className="bid-input-group">
                <label htmlFor="bidAmount">Your Bid Amount (YARCoin):</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Enter the amount`}
                  min={selectedStudent.basePrice}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setSelectedStudent(null)}>
                  Cancel
                </button>
                <button
                  className="confirm-bid-btn"
                  onClick={() => handleBid(selectedStudent.id)}
                >
                  Confirm Bid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherHome;