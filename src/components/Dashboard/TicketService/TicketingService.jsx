import React, { useRef, useState } from "react";
import { RiChat1Fill } from "react-icons/ri";
import { LuTicketPlus } from "react-icons/lu";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import styles from "./Tickets.module.css";
import UserChat from "./UserChat";
import TicketChat from "./TicketChat";

function TicketingService() {
  const [oldtickets, setoldtickets] = useState([
    { id: "23432", status: "pending", date: "2025-02-17" },
    { id: "45654", status: "completed", date: "2025-02-20" },
    { id: "98789", status: "declined", date: "2025-02-25" },
    { id: "12345", status: "completed", date: "2025-02-28" },
  ]);

  const [openchat, setOpenchat] = useState(false);

  const [ticketno, setTicketno] = useState();

  const onChatClick = (no) => {
    setOpenchat(true);
    setTicketno(no);
  };

  const [newticket, setNewticket] = useState(false);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to handle button click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Function to handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  return (
    <>
      <div className={styles.chatcontainer}>
        <PopoverRoot>
          <PopoverTrigger asChild>
            <div
              className={styles.icon}
              onClick={() => {
                setOpenchat(false);
                setNewticket(false);
                setSelectedFile(null);
              }}
            >
              <RiChat1Fill />
              <span className={styles.qmark}>?</span>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={styles.userscontainer}
            class={openchat ? styles.showb : styles.showa}
          >
            {/* <PopoverArrow className="notdropdown-color" /> */}
            {!openchat && !newticket && (
              <PopoverBody className={styles.components}>
                <div className={styles.heading}>
                  <h2>Chat Services</h2>
                </div>
                <hr />
                {oldtickets.map((ticket) => (
                  <UserChat ticket={ticket} onChatClick={onChatClick} />
                ))}
                <div
                  className={styles.chatcontent}
                  onClick={() => setNewticket(true)}
                >
                  <h3>
                    Raise New Ticket{" "}
                    <span >
                      <i class="bi bi-plus-circle"></i>
                    </span>
                  </h3>
                </div>
                {/* <hr /> */}
              </PopoverBody>
            )}
            {openchat && (
              <PopoverBody className={styles.components}>
                <TicketChat ticket={ticketno} setOpenchat={setOpenchat} />

                {/* <hr /> */}
              </PopoverBody>
            )}

            {newticket && (
              <PopoverBody className={styles.components}>
                <div className={styles.heading}>
                  <h2>
                    <span
                      className={styles.back}
                      onClick={() => setNewticket(false)}
                    >
                      <i class="bi bi-arrow-left-short"></i>
                    </span>
                    Raise new ticket{" "}
                  </h2>
                </div>
                <hr />

                <div className={styles.inputContainer}>
                  <select name="" id="">
                    <option value="">--select Module--</option>
                    <option value="">Module 1</option>
                    <option value="">Module 2</option>
                    <option value="">Module 3</option>
                  </select>

                  <select name="" id="">
                    <option value="">--select Sub Module--</option>
                    <option value="">Sub Module 1</option>
                    <option value="">Sub Module 2</option>
                    <option value="">Sub Module 3</option>
                  </select>

                  <input type="text" placeholder="Subject" />
                  <textarea name="" id="" placeholder="Description"></textarea>

                  <div style={{ textAlign: "center", padding: "10px" }}>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />

                    {/* Custom upload button */}

                    <button
                      onClick={handleButtonClick}
                      style={{
                        padding: "4px 20px",
                        backgroundColor: "#ccc",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "5px",
                        fontSize: "16px",
                        fontWeight: 500,
                      }}
                    >
                      {!selectedFile && "Upload File"}
                      {selectedFile && selectedFile}
                    </button>

                    {/* Display the selected file name
                    {selectedFile && (
                      <p style={{ marginTop: "10px" }}>📄 {selectedFile}</p>
                    )} */}
                  </div>
                  <p className="text-center">
                    <button className={styles.send}>Submit</button>
                  </p>
                </div>

                {/* <hr /> */}
              </PopoverBody>
            )}
          </PopoverContent>
        </PopoverRoot>
      </div>
    </>
  );
}

export default TicketingService;
