import { useEffect, useState } from "react";
import socket from "./socket";

function Chat({ user }) {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!user) return;
    socket.emit("joinRoom", {
      userId: user._id,
      role: user.role 
    });

    socket.on("previousMessages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
    };

  }, [user]);

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("sendMessage", {
      userId: user._id,
      role: user.role,
      message: input
    });

    setInput("");
  };

  return (
    <div>
      <div>
        {messages.map((m) => (
          <div key={m._id}>
            <b>{m.senderRole}</b>: {m.message}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;