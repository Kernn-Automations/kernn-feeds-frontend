import React, { useRef, useState } from "react";
import styles from "./Products.module.css"
import dummy from "./../../../images/dummy-img.jpeg";

function ModifyProductForm({ onViewClick }) {
  const filefrontInputRef = useRef(null);
  const filebackInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [frontImage, setFrontImage] = useState(dummy);
  const [backImage, setBackImage] = useState(dummy);

  // Function to handle button click
  const handlefrontButtonClick = () => {
    filefrontInputRef.current.click();
  };

  const handlebackButtonClick = () => {
    filebackInputRef.current.click();
  };

  // Function to handle file selection
  const handleFrontImageChange = (event) => {
    console.log(frontImage);
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      const imageURL = URL.createObjectURL(file); // Create a temporary URL
      console.log(imageURL);
      setFrontImage(imageURL);
    }
  };

  const handleBackImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      const imageURL = URL.createObjectURL(file); // Create a temporary URL
      console.log(imageURL);
      setBackImage(imageURL);
    }
  };

  return (
    <>
      <div className="row m-0 p-3">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Date :</label>
          <input type="date" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Time :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Created By :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Product Details</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Product Name :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Product ID :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Categories :</label>
          <select name="" id="">
            <option value="">Category 1</option>
            <option value="">Category 2</option>
            <option value="">Category 3</option>
          </select>
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Product Images</h5>
        <div className={`col-3 ${styles.upload}`}>
          <div>
            <input
              type="file"
              ref={filefrontInputRef}
              style={{ display: "none" }}
              accept="image/png, image/gif, image/jpeg"
              onChange={handleFrontImageChange}
            />
            <button onClick={handlefrontButtonClick}>
              {frontImage ? (
                <img src={frontImage} alt="Front Side" />
              ) : (
                <p>
                  <RiAddLargeLine />
                </p>
              )}
            </button>
          </div>

          <p className={styles.imglabel}>Front Side</p>
        </div>
        <div className={`col-3 ${styles.upload}`}>
          <div>
            <input
              type="file"
              ref={filebackInputRef}
              style={{ display: "none" }}
              accept="image/png, image/gif, image/jpeg"
              onChange={handleBackImageChange}
            />
            <button onClick={handlebackButtonClick}>
              {backImage ? (
                <img src={backImage} alt="Front Side" />
              ) : (
                <p>
                  <RiAddLargeLine />
                </p>
              )}
            </button>
          </div>
          <p className={styles.imglabel}>Back Side</p>
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Units :</label>
          <select name="" id="">
            <option value="">1</option>
            <option value="">2</option>
            <option value="">3</option>
          </select>
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Pricing Details</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Sale Price :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Purchase Price :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Taxes :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Pricing List :</label>
          <select name="" id="">
            <option value="">List 1</option>
            <option value="">List 2</option>
            <option value="">List 3</option>
          </select>
        </div>
      </div>

      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className="col-3">
          <button className="submitbtn">Update</button>
          <button className="cancelbtn" onClick={onViewClick}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default ModifyProductForm;
