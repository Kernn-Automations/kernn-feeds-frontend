import React, { useRef, useState } from "react";
import styles from "./Announcement.module.css";
import { RiAddLargeLine } from "react-icons/ri";

function AnnouncementHome() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [type, setType] = useState(null);

  const [image, setImage] = useState(null);

  const seOptions = ["SE 1", "SE 2", "SE 3"];
  const [selectedSEOptions, setSelectedSEOptions] = useState([]);
  const [isSEOpen, setIsSEOpen] = useState(false);

  const handleSECheckboxChange = (option) => {
    setSelectedSEOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const pinOptions = ["pincode 1", "pincode 2", "pincode 3"];
  const [selectedPINOptions, setSelectedPINOptions] = useState([]);
  const [isPINOpen, setIsPINOpen] = useState(false);

  const handlePINCheckboxChange = (option) => {
    setSelectedPINOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // Function to handle button click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Function to handle file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      const imageURL = URL.createObjectURL(file); // Create a temporary URL
      console.log(imageURL);
      setImage(imageURL);
    }
  };

  return (
    <>
      <h3 className={styles.heading}>New Announcement</h3>
      <div className="row m-0 p-3 pb-1 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Subject :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row m-0 p-3 py-1 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Enter URL :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-3 py-1 justify-content-center">
        <div className={`col-3 ${styles.upload}`}>
          <label htmlFor="" className={styles.imglabel}>
            Photo / Video :
          </label>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/png, image/gif, image/jpeg"
            onChange={handleImageChange}
          />
          <button onClick={handleButtonClick}>
            {image ? selectedFile : "Upload"}
          </button>
        </div>
      </div>
      <div className="row m-0 p-3 ps-5 py-1 justify-content-center">
        <div className="col-4">
          <div className="row m-0 ">
            <div className={`col-3 ${styles.shortform}`}>
              <label htmlFor="">Description :</label>
            </div>
            <div className={`col-3 ${styles.shortform}`}>
              <textarea name="" id=""></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="row m-0 p-3 py-1 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Warehouse :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">All</option>
            <option value="">Warehouse 1</option>
            <option value="">Warehouse 2</option>
            <option value="">Warehouse 3</option>
          </select>
        </div>
      </div>

      <div className="row m-0 p-3 py-1 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Type :</label>
          <select name="" id="" onChange={(e) => setType(e.target.value)}>
            <option value={null}>--select--</option>
            <option value="all">All</option>
            <option value="se">Sales Executive</option>
            <option value="pincode">Pincode</option>
          </select>
        </div>
      </div>

      {(type === "all" || type === "se") && (
        <>
          <div className="row m-0 p-3 py-1 justify-content-center">
            <div className={`col-3 ${styles.shortform}`}>
              <label htmlFor="">Sales Executive :</label>
            </div>
            <div className={`col-3 ${styles.shortform}`}>
              <div
                onClick={() => setIsSEOpen(!isSEOpen)}
                className={` ${styles.multiselect}`}
              >
                {selectedSEOptions.length > 0
                  ? selectedSEOptions.join(", ")
                  : "Select SE"}{" "}
                <i class="bi bi-chevron-down"></i>
              </div>
              {isSEOpen && (
                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    position: "absolute",
                    background: "white",
                    width: "150px",
                    boxShadow: "1px 1px 4px black",
                    borderRadius: "5px",
                  }}
                >
                  {seOptions.map((option) => (
                    <label key={option} style={{ display: "block" }}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={selectedSEOptions.includes(option)}
                        onChange={() => handleSECheckboxChange(option)}
                        className={styles.selectopt}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {(type === "all" || type === "pincode") && (
        <div className="row m-0 p-3 justify-content-center">
          <div className={`col-3 ${styles.shortform}`}>
            <label htmlFor="">Pincode :</label>
          </div>
          <div className={`col-3 ${styles.shortform}`}>
            <div
              onClick={() => setIsPINOpen(!isPINOpen)}
              className={` ${styles.multiselect}`}
            >
              {selectedPINOptions.length > 0
                ? selectedPINOptions.join(", ")
                : "Select Pincode"}{" "}
              <i class="bi bi-chevron-down"></i>
            </div>
            {isPINOpen && (
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  position: "absolute",
                  background: "white",
                  width: "150px",
                  boxShadow: "1px 1px 4px black",
                  borderRadius: "5px",
                }}
                //   onBlur={() => setIsPINOpen(false)}
              >
                {pinOptions.map((option) => (
                  <label key={option} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      value={option}
                      checked={selectedPINOptions.includes(option)}
                      onChange={() => handlePINCheckboxChange(option)}
                      className={styles.selectopt}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-2">
          <button className="submitbtn">Send Announcement</button>
        </div>
      </div>
    </>
  );
}

export default AnnouncementHome;
