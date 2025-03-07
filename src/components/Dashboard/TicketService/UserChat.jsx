import React from "react";
import styles from "./Tickets.module.css";

function UserChat({ ticket, onChatClick }) {
  return (
    <>
     
        <div className={styles.chatcontent} onClick={() => onChatClick(ticket)}>
          <h3>Ticket {ticket.id}</h3>
          <div className={styles.message}>
            <p>status : {ticket.status}</p>
            <p className={styles.time}>{ticket.date}
            </p>
          </div>
        </div>
      <hr />
    </>
  );
}

export default UserChat;
