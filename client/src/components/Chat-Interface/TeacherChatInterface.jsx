import React, { useState, useEffect } from "react";
import "./TeacherChatInterface.css";
import socket from "./socket"; // Import the socket instance

function TeacherChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]); // Start with empty array, will be populated from socket
  const [input, setInput] = useState("");
  const [students, setStudents] = useState([]);
  const [expandedStudents, setExpandedStudents] = useState({});
  const [user, setUser] = useState(null); // User state for socket connection

  // Temporary Dummy Data (remove when backend ready)
  const dummyTeam = {
    mentor: { name: "Raunak Joshi", _id: "mentor1" },
    students: [
      { name: "Ankit Bari", _id: "student1", githubUsername: "ankitbari" },
      { name: "Yash Kerkar", _id: "student2", githubUsername: "yashkerkar" }
    ]
  };

  // Initialize user (teacher/mentor)
  useEffect(() => {
    // In a real app, this would come from your authentication context
    // For now, we'll assume the teacher is logged in
    setUser({
      _id: "6996ba04d3efbe3c0cd891b4", // This should be the actual teacher/mentor ID
      role: "admin" // or "mentor" based on your backend role naming
    });
  }, []);

  // Socket connection and message handling
  useEffect(() => {
    if (!user) return;

    // Join room
    socket.emit("joinRoom", {
      userId: user._id,
      role: user.role
    });

    // Load old messages
    socket.on("previousMessages", (msgs) => {
      // Transform messages to match your frontend format
      const formattedMessages = msgs.map(msg => ({
        text: msg.message,
        sender: msg.senderRole === "admin" || msg.senderRole === "mentor" ? "teacher" : "student",
        _id: msg._id,
        timestamp: msg.createdAt
      }));
      setMessages(formattedMessages);
    });

    // Receive new message
    socket.on("receiveMessage", (msg) => {
      const newMessage = {
        text: msg.message,
        sender: msg.senderRole === "admin" || msg.senderRole === "mentor" ? "teacher" : "student",
        _id: msg._id,
        timestamp: msg.createdAt
      };
      setMessages(prev => [...prev, newMessage]);
    });

    // Socket connection events for debugging
    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Cleanup on unmount
    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };

  }, [user]);

  // Fetch students (keeping your existing dummy data logic)
  useEffect(() => {
    // When backend comes, replace this with real fetch()
    /*
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/team-members/TEAM_ID");
        const data = await res.json();
        setStudents(data.students.map(s => ({ 
          name: s.name, 
          githubUsername: s.githubUsername,
          _id: s._id 
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
    */

    // 🔥 For now using dummy data
    setStudents(dummyTeam.students.map(s => ({
      name: s.name,
      githubUsername: s.githubUsername,
      _id: s._id
    })));

    // Initialize all students as collapsed
    const initialExpandedState = {};
    dummyTeam.students.forEach((_, index) => {
      initialExpandedState[index] = false;
    });
    setExpandedStudents(initialExpandedState);

  }, []);

  const toggleStudent = (index) => {
    setExpandedStudents(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSend = () => {
    if (input.trim() === "" || !user) return;

    // Send message through socket
    socket.emit("sendMessage", {
      userId: user._id,
      role: user.role,
      message: input
    });

    setInput("");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">

      {/* Sidebar */}
      <div className={`teacher-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h3>Students</h3>
          <button
            className="close-btn"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✖
          </button>
        </div>

        {students.map((student, index) => (
          <div key={student._id || index} className="student-container">
            <div 
              className="student-header"
              onClick={() => toggleStudent(index)}
            >
              <span className="student-name">{student.name}</span>
              <span className="dropdown-icon">
                {expandedStudents[index] ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedStudents[index] && (
              <div className="github-graph-container">
                <div className="github-graph-placeholder">
                  {/* GitHub contribution graph will be loaded here */}
                  <div className="graph-content">
                    <p className="graph-placeholder-text">
                      GitHub Contribution Graph for {student.githubUsername}
                    </p>
                    {/* The actual graph will be inserted here via iframe or embed */}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div
        className={`chat-container ${isSidebarOpen ? "shifted" : ""}`}
      >
        <div className="chat-header">
          {!isSidebarOpen && (
            <button
              className="open-sidebar-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
          )}
          <h2>Team Workspace - Teacher View</h2>
          {!socket.connected && (
            <span className="connection-status disconnected">(Disconnected)</span>
          )}
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`message ${
                  msg.sender === "teacher" ? "right" : "left"
                }`}
              >
                <div className="message-content">{msg.text}</div>
                {msg.timestamp && (
                  <div className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="chat-input-section">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!socket.connected}
          />
          <button 
            onClick={handleSend}
            disabled={!socket.connected || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherChatInterface;