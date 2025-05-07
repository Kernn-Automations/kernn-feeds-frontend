import React, { useEffect, useRef, useState } from "react";
import styles from "./Tickets.module.css";
import axios from "axios";
import { getSocket, disconnectSocket } from "../../../utils/Socket";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import chatAni from "../../../images/animations/chatAnimation.gif";

function TicketChat({ ticket, setOpenchat, token }) {
  const [messages, setMessages] = useState();
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const ticketId = ticket.id;

  console.log(ticket);
  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket(token);

    // Join the ticket room
    socket.on("connect", () => {
      socket.emit("join_ticket", ticketId);
    });

    // Receive messages
    socket.on("new_message", (msg) => {
      const isOwn = msg.senderType === "Employee"; // assumes "Employee" is you
      setMessages((prev) => [
        ...prev,
        { ...msg, sender: isOwn ? "sent" : "received" },
      ]);
    });

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axiosAPI.get(`/tickets/${ticketId}/messages`);
        const formatted = res.data.messages.map((msg) => ({
          ...msg,
          sender: msg.senderType === "Employee" ? "sent" : "received",
        }));
        setMessages(formatted);
      } catch (err) {
        console.log(err);
        setError(ree.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      disconnectSocket();
    };
  }, [ticketId, token]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const socket = getSocket();
    const payload = {
      ticketId,
      message: input,
      files: [], // Add file support later
    };

    socket.emit("send_message", payload);

    // setMessages((prev) => [
    //   ...prev,
    //   {
    //     sender: "You",
    //     message: input,
    //     time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    //   },
    // ]);

    setInput("");
  };

  return (
    <>
      <div className={styles.heading}>
        <h2>
          <span className={styles.back} onClick={() => setOpenchat(false)}>
            <i className="bi bi-arrow-left-short"></i>
          </span>{" "}
          {ticket.ticketId}
        </h2>
      </div>
      <hr />
      <div className={styles.chatbox}>
        {messages && messages.length === 0 && <p>NO CHAT FOUND</p>}
        {messages &&
          messages.length > 0 &&
          messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === "sent" ? styles.sent : styles.recieve}
            >
              <p>{msg.message}</p>
              <span className={styles.chatTime}>
                {new Date(msg.sentAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        {loading && <img src={chatAni} alt="Loading..." />}
        <div ref={chatEndRef} />
      </div>
      <div className={styles.inputbar}>
        <span>
          <i className="bi bi-folder-plus"></i>
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

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default TicketChat;
