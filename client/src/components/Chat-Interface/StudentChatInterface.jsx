import React, { useState, useEffect } from "react";
import "./StudentChatInterface.css";
import socket from "./socket";

function StudentChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [user, setUser] = useState(null);

  // Dummy team data
  const dummyTeam = {
    mentor: { name: "Raunak Joshi" },
    students: [
      { name: "Ankit Bari" },
      { name: "Rahul Singh" }
    ]
  };

  // Load team members
  useEffect(() => {
    setTeamMembers([
      { name: dummyTeam.mentor.name, role: "Mentor" },
      ...dummyTeam.students.map(s => ({
        name: s.name,
        role: "Candidate"
      }))
    ]);
  }, []);

  // Set student user (TEMP TESTING ONLY)
  useEffect(() => {
    setUser({
      _id: "6996b9c8d3efbe3c0cd891ae",
      role: "member"
    });
  }, []);

  // Socket logic
  useEffect(() => {
    if (!user) return;

    // Join room
    socket.emit("joinRoom", {
      userId: user._id,
      role: user.role
    });

    // Load old messages
    socket.on("previousMessages", (msgs) => {
      const formatted = msgs.map(msg => ({
        text: msg.message,
        sender: msg.senderRole === "admin" ? "mentor" : "student",
        _id: msg._id,
        timestamp: msg.createdAt
      }));

      setMessages(formatted);
    });

    // Receive new message
    socket.on("receiveMessage", (msg) => {
      const newMsg = {
        text: msg.message,
        sender: msg.senderRole === "admin" ? "mentor" : "student",
        _id: msg._id,
        timestamp: msg.createdAt
      };

      setMessages(prev => [...prev, newMsg]);
    });

    // Debugging listeners
    socket.on("connect", () => {
      console.log("Student socket connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("Student socket disconnected:", reason);
    });

    // Cleanup
    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("disconnect");
    };

  }, [user]);

  // Send message
  const handleSend = () => {
    if (!input.trim() || !user) return;

    socket.emit("sendMessage", {
      userId: user._id,
      role: user.role,
      message: input
    });

    setInput("");
  };

  return (
    <div className="chat-page">

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h3>Team Members</h3>
          <button
            className="close-btn"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✖
          </button>
        </div>

        {teamMembers.map((member, index) => (
          <div key={index} className="member">
            {member.name} ({member.role})
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div className="chat-container">

        <div className="chat-header">
          {!isSidebarOpen && (
            <button
              className="open-sidebar-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
          )}
          <h2>Team Workspace</h2>

          {!socket.connected && (
            <span style={{ color: "red", marginLeft: "10px" }}>
              (Disconnected)
            </span>
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
                  msg.sender === "student" ? "right" : "left"
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

export default StudentChatInterface;