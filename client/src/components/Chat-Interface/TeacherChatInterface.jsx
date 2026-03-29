import React, { useState, useEffect } from "react";
import "./TeacherChatInterface.css";
import socket from "./socket";
import { useNavigate } from "react-router-dom";
import ContributionStats from "../Graph/ContributionStats";

function TeacherChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [students, setStudents] = useState([]);
  const [expandedStudents, setExpandedStudents] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dotCount, setDotCount] = useState(0);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_BASE_URL;

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
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userId || !userRole || userRole !== "teacher") {
      localStorage.clear();
      navigate("/auth");
      return;
    }

    setUser({
      _id: userId,
      role: userRole,
      name: userName,
    });
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/students`);
        if (!res.ok) throw new Error("Failed to fetch students");
        const allStudents = await res.json();

        const myStudents = allStudents.filter((s) => s.ownedBy === user._id);
        setStudents(myStudents);

        const initialExpanded = {};
        myStudents.forEach((_, index) => {
          initialExpanded[index] = false;
        });
        setExpandedStudents(initialExpanded);

        setTimeout(()=>{
          setLoading(false);
        },2000);

      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        setLoading(false);
      } 
    };

    fetchStudents();
  }, [user, baseUrl]);

  useEffect(() => {
    if (!user) return;

    const socketRole = "admin";

    socket.emit("joinRoom", {
      userId: user._id,
      role: socketRole,
    });

    socket.on("previousMessages", (msgs) => {
      const formattedMessages = msgs.map((msg) => ({
        text: msg.message,
        sender: msg.senderRole === "admin" ? "teacher" : "student",
        _id: msg._id,
        timestamp: msg.createdAt,
      }));
      setMessages(formattedMessages);
    });

    socket.on("receiveMessage", (msg) => {
      const newMessage = {
        text: msg.message,
        sender: msg.senderRole === "admin" ? "teacher" : "student",
        _id: msg._id,
        timestamp: msg.createdAt,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user]);

  const toggleStudent = (index) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSend = () => {
    if (!input.trim() || !user) return;

    socket.emit("sendMessage", {
      userId: user._id,
      role: "admin",
      message: input,
    });

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {

    return (
      <>
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

  return (
    <div className="chat-page">
      <div className={`teacher-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ←
            </button>
            <h3>Team Members</h3>
          </div>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            ✖
          </button>
        </div>

        {students.length === 0 ? (
          <div className="no-students">No students assigned yet.</div>
        ) : (
          students.map((student, index) => (
            <div key={student._id} className="student-container">
              <div className="student-header" onClick={() => toggleStudent(index)}>
                <span className="student-name">{student.name}</span>
                <span className="dropdown-icon">
                  {expandedStudents[index] ? "▼" : "▶"}
                </span>
              </div>

              {expandedStudents[index] && (
                <div className="github-graph-container">
                  <ContributionStats
                    repoOwner="aijadugar"
                    repoName="YAR-Coin-2.0"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={`chat-container ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="chat-header">
          {!isSidebarOpen && (
            <button className="open-sidebar-btn" onClick={() => setIsSidebarOpen(true)}>
              ☰
            </button>
          )}
          <h2>Team Workspace - Mentor View</h2>
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
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${msg.sender === "teacher" ? "right" : "left"}`}
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
          <button onClick={handleSend} disabled={!socket.connected || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherChatInterface;