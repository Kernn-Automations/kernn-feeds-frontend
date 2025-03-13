import React, { useRef, useState } from "react";
import styles from "./Products.module.css";
import { RiAddLargeLine } from "react-icons/ri";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";

function AddProduct({ navigate }) {
  // const filefrontInputRef = useRef(null);
  // const filebackInputRef = useRef(null);
  // const fileTopInputRef = useRef(null);
  // const fileBottomInputRef = useRef(null);
  // const fileRightInputRef = useRef(null);
  // const fileLeftInputRef = useRef(null);

  // const [frontImage, setFrontImage] = useState(null);
  // const [backImage, setBackImage] = useState(null);
  // const [topImage, setTopImage] = useState(null);
  // const [bottomImage, setBottomImage] = useState(null);
  // const [rightImage, setRightImage] = useState(null);
  // const [leftImage, setLeftImage] = useState(null);

  // // Function to handle button click
  // const handlefrontButtonClick = () => {
  //   filefrontInputRef.current.click();
  // };

  // const handlebackButtonClick = () => {
  //   filebackInputRef.current.click();
  // };

  // const handletopButtonClick = () => {
  //   filebackInputRef.current.click();
  // };
  // const handlebottomButtonClick = () => {
  //   filebackInputRef.current.click();
  // };
  // const handlerightButtonClick = () => {
  //   filebackInputRef.current.click();
  // };
  // const handleleftButtonClick = () => {
  //   filebackInputRef.current.click();
  // };

  // // Function to handle file selection
  // const handleImageChange = (setter) => (event) => {
  //   console.log(frontImage)
  //   const file = event.target.files[0];
  //   if (file) {

  //     const imageURL = URL.createObjectURL(file); // Create a temporary URL
  //     console.log(imageURL)
  //     setter(imageURL);
  //   }
  // };

  const SIDES = ["Front", "Back", "Left", "Right", "Top", "Bottom"];
  const [images, setImages] = useState({ Front: null, Back: null });
  const [newImage, setNewImage] = useState(null);
  const [selectedSide, setSelectedSide] = useState("");
  const fileInputRef = useRef(null);

  const handleButtonClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    console.log(e)
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setNewImage(imageURL);
      if(e.target.className === "Front" || e.target.className === "Back"){
        setImages((prev) => ({ ...prev, [e.target.className]: imageURL }));
        
      }
    }
  };

  const handleSaveImage = () => {
    if (selectedSide && newImage) {
      setImages((prev) => ({ ...prev, [selectedSide]: newImage }));
      setNewImage(null);
      setSelectedSide("");
    }
  };
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/products")}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Add Product
      </p>

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
        {Object.keys(images).map((side) => (
          <div key={side} className={`col-3 ${styles.upload}`}>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/png, image/gif, image/jpeg"
                onChange={(e) => handleImageChange(e)}
                className={side}
              />
              <button onClick={handleButtonClick}>
                {images[side] ? (
                  <img src={images[side]} alt={`${side} Side`} />
                ) : (
                  <p><RiAddLargeLine /></p>
                )}
              </button>
            </div>
            <p className={styles.imglabel}>{side} Side</p>
          </div>
        ))}

        <div className="col-3">
          <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
            <DialogTrigger asChild>
              <button className="submitbtn">Add Another</button>
            </DialogTrigger>
            <DialogContent className="mdl">
              <DialogBody>
                <h4>Select Image Side</h4>
                <div className={`col-3 ${styles.upload}`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/png, image/gif, image/jpeg"
                    onChange={handleImageChange}
                  />
                  <button onClick={handleButtonClick}>
                    {newImage ? (
                      <img src={newImage} alt={`${selectedSide} Side`} />
                    ) : (
                      <p><RiAddLargeLine /></p>
                    )}
                  </button>
                </div>
                <select
                  value={selectedSide}
                  onChange={(e) => setSelectedSide(e.target.value)}
                >
                  <option value="">-- Select Side --</option>
                  {SIDES.filter((side) => !images[side]).map((side) => (
                    <option key={side} value={side}>{side}</option>
                  ))}
                </select>
                <button onClick={handleSaveImage}>Save</button>
                <DialogCloseTrigger className="inputcolumn-mdl-close" />
              </DialogBody>
            </DialogContent>
          </DialogRoot>
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
          <button className="submitbtn">Create</button>
          <button className="cancelbtn" onClick={() => navigate("/products")}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default AddProduct;
