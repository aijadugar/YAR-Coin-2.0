import React, { useState, useEffect } from "react";
import "./StudentChatInterface.css";
import socket from "./socket";
import { useNavigate } from "react-router-dom";

function StudentChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dotCount, setDotCount] = useState(0);
  const navigate = useNavigate();

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

  const baseUrl = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userId || !userRole) {
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
    if (!user || user.role !== "student") return;

    const fetchTeam = async () => {
      try {
        setLoading(true);
        const studentsRes = await fetch(`${baseUrl}/api/students`);
        if (!studentsRes.ok) throw new Error("Failed to fetch students");
        const allStudents = await studentsRes.json();

        const currentStudent = allStudents.find((s) => s._id === user._id);
        if (!currentStudent) throw new Error("Current student not found");

        const teacherId = currentStudent.ownedBy;
        if (!teacherId) {
          setTeamMembers([{ name: "No mentor assigned yet", role: "System" }]);
          setTimeout(() => {
          setLoading(false);
          }, 2000);
          return;
        }

        const teachersRes = await fetch(`${baseUrl}/api/teachers`);
        if (!teachersRes.ok) throw new Error("Failed to fetch teachers");
        const allTeachers = await teachersRes.json();

        const teacher = allTeachers.find((t) => t._id === teacherId);
        if (!teacher) throw new Error("Mentor not found");

        const teamStudents = allStudents.filter(
          (s) => s.ownedBy === teacherId && s._id !== user._id
        );

        const members = [
          { name: teacher.name, role: "Mentor", _id: teacher._id },
          ...teamStudents.map((s) => ({ name: s.name, role: "Candidate", _id: s._id })),
        ];
        setTeamMembers(members);

        setTimeout(()=>{
          setLoading(false);
        },2000);

      } catch (error) {
        console.error("Error fetching team members:", error);
        setTeamMembers([{ name: "Error loading team", role: "" }]);
        setTimeout(() => {
        setLoading(false);
        },2000);
      } 
    };

    fetchTeam();
  }, [user, baseUrl]);


  useEffect(() => {
    if (!user || user.role !== "student") return;
    const socketRole = "student";
    socket.emit("joinRoom", {
      userId: user._id,
      role: socketRole,
    });

    socket.on("previousMessages", (msgs) => {
      const formatted = msgs.map((msg) => ({
        text: msg.message,
        senderId: msg.senderId,  
        senderRole: msg.senderRole,
        _id: msg._id,
        timestamp: msg.createdAt,
      }));
      setMessages(formatted);
    });

    socket.on("receiveMessage", (msg) => {
      const newMsg = {
        text: msg.message,
        senderId: msg.senderId,  
        senderRole: msg.senderRole,
        _id: msg._id,
        timestamp: msg.createdAt,
      };
      setMessages((prev) => [...prev, newMsg]);
    });


    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user]);

  const handleSend = () => {
    if (!input.trim() || !user) return;

    socket.emit("sendMessage", {
      userId: user._id,
      role: "student",
      message: input,
    });

    setInput("");
  };

  if (loading) {
    return(
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
    );
  }

  return (
    <div className="chat-page">

      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
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

        {teamMembers.map((member) => (
          <div key={member._id || member.name} className="member">
            {member.name} ({member.role})
          </div>
        ))}
      </div>

      <div className="chat-container">
        <div className="chat-header">
          {!isSidebarOpen && (
            <button className="open-sidebar-btn" onClick={() => setIsSidebarOpen(true)}>
              ☰
            </button>
          )}
          <h2>Team Workspace - Candidate View</h2>
          {!socket.connected && (
            <span style={{ color: "red", marginLeft: "10px" }}>(Disconnected)</span>
          )}
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <p style={{ textAlign: "center" }}>No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${
                  msg.senderId === user._id ? "right" : "left"
                }`}
              >
                <div>{msg.text}</div>
                {msg.timestamp && (
                  <small style={{ opacity: 0.6 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
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
            disabled={!socket.connected}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} disabled={!socket.connected || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentChatInterface;