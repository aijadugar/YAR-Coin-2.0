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
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Load user data from localStorage (set during login)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userId || !userRole) {
      navigate("/auth");
      return;
    }

    setUser({
      _id: userId,
      role: userRole,
      name: userName,
    });
  }, [navigate]);

  // Fetch team members once user is set
  useEffect(() => {
    if (!user || user.role !== "student") return;

    const fetchTeam = async () => {
      try {
        setLoading(true);

        // 1. Fetch all students and find the current one
        const studentsRes = await fetch(`${baseUrl}/api/students`);
        if (!studentsRes.ok) throw new Error("Failed to fetch students");
        const allStudents = await studentsRes.json();

        const currentStudent = allStudents.find((s) => s._id === user._id);
        if (!currentStudent) throw new Error("Current student not found");

        const teacherId = currentStudent.ownedBy;

        if (!teacherId) {
          setTeamMembers([{ name: "No mentor assigned yet", role: "System" }]);
          setLoading(false);
          return;
        }

        // 2. Fetch all teachers and find the mentor
        const teachersRes = await fetch(`${baseUrl}/api/teachers`);
        if (!teachersRes.ok) throw new Error("Failed to fetch teachers");
        const allTeachers = await teachersRes.json();

        const teacher = allTeachers.find((t) => t._id === teacherId);
        if (!teacher) throw new Error("Mentor not found");

        // 3. Filter other students owned by the same teacher
        const teamStudents = allStudents.filter(
          (s) => s.ownedBy === teacherId && s._id !== user._id
        );

        // Build team members list to display on side bar
        const members = [
          { name: teacher.name, role: "Mentor", _id: teacher._id },
          ...teamStudents.map((s) => ({ name: s.name, role: "Candidate", _id: s._id })),
        ];
        setTeamMembers(members);
      } catch (error) {
        console.error("Error fetching team members:", error);
        setTeamMembers([{ name: "Error loading team", role: "" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user, baseUrl]);

  // Socket connection and message handling
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
        senderId: msg.senderId,  // Store the actual sender ID
        senderRole: msg.senderRole,
        _id: msg._id,
        timestamp: msg.createdAt,
      }));
      setMessages(formatted);
    });

    socket.on("receiveMessage", (msg) => {
      const newMsg = {
        text: msg.message,
        senderId: msg.senderId,  // Store the actual sender ID
        senderRole: msg.senderRole,
        _id: msg._id,
        timestamp: msg.createdAt,
      };
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on("connect", () => console.log("Student socket connected"));
    socket.on("disconnect", (reason) => console.log("Student socket disconnected:", reason));

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
    return <div className="loading">Loading team...</div>;
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
          <div key={member._id} className="member">
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
          <h2>Team Workspace - Student View</h2>
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