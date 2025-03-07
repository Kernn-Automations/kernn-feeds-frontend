import React, { useEffect, useRef, useState } from "react";
import styles from "./Tickets.module.css";

function TicketChat({ ticket, setOpenchat }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there!", sender: "received", time: "10:00 AM" },
    { id: 2, text: "Hello! How are you?", sender: "sent", time: "10:02 AM" },
    { id: 3, text: "I am Fine!", sender: "recieved", time: "10:04 AM" },
    { id: 4, text: "Any Issue Faced ??", sender: "recieved", time: "10:04 AM" },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const chatEndRef = useRef(null);

  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: input,
        sender: "sent",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInput("");
    }
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <>
      
      <div className={styles.heading}>
        <h2>
          <span className={styles.back} onClick={() => setOpenchat(false)}>
            <i class="bi bi-arrow-left-short"></i>
          </span>{" "}
          Ticket {ticket.id}
        </h2>
      </div>
      <hr />
      <div className={styles.chatbox}>
        {messages.map((msg) => (
          <div className={msg.sender === "sent" ? styles.sent : styles.recieve}>
            <p>{msg.text}</p>
            <span className={styles.chatTime}>{msg.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} /> {/* Invisible div to auto-scroll */}
      </div>
      <div className={styles.inputbar}>
        <span>
          <i class="bi bi-folder-plus"></i>
        </span>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </>
  );
}

export default TicketChat;
