import React, { useEffect, useRef, useState } from "react";
import styles from "./Products.module.css";
import dummy from "./../../../images/dummy-img.jpeg";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function ModifyProductForm({ onViewClick, product }) {
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

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [prod, setprod] = useState();
  const [categories, setCategories] = useState();
  const [pricingList, setPricingList] = useState();

  const { axiosAPI } = useAuth();

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axiosAPI.get(`/pricing/lists/fetch`);
        setPricingList(res.data.pricingLists);
        console.log(res);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
      }
    }
    fetch();
  }, []);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        console.log(product);
        const res = await axiosAPI.get(`/products/fetch/${product.id}`);
        setprod(res.data.product);
        console.log(res);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <>
      {prod && (
        <>
          <div className="row m-0 p-3">
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Date :</label>
              <input type="date" value={prod.createdAt.slice(0, 10)} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Time :</label>
              <input type="text" value={prod.createdAt.slice(11, 16)} />
            </div>
            {/* <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Created By :</label>
              <input type="text" />
            </div> */}
          </div>

          <div className="row m-0 p-3">
            <h5 className={styles.head}>Product Details</h5>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Product Name :</label>
              <input type="text" value={prod.name} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Product ID :</label>
              <input type="text" value={prod.SKU} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Categories :</label>
              <input type="text" value={prod.category.name} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">units :</label>
              <input type="text" value={prod.unit} />
            </div>
          </div>

          <div className="row m-0 p-3">
            <h5 className={styles.head}>Product Images</h5>
            {prod.imageUrls.map((img, index) => (
              <div className={`col-3 ${styles.upload}`}>
                <img src={img} alt="Front Side" />

                <p className={styles.imglabel}>{prod.images[index].slice(9)}</p>
              </div>
            ))}
          </div>

          <div className="row m-0 p-3">
            <h5 className={styles.head}>TAXES</h5>
            {prod.taxes.map((tax) => (
              <div className={`col-3 ${styles.taxform}`}>
                <input type="text" value={tax.name} />
              </div>
            ))}
          </div>

          <div className="row m-0 p-3">
            <h5 className={styles.head}>Pricing Details</h5>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Sale Price :</label>
              <input type="text" value={prod.basePrice} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Purchase Price :</label>
              <input type="text" value={prod.purchasePrice} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Min.Stock :</label>
              <input type="text" value={prod.thresholdValue} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Pricing List :</label>
              <select name="" id="" value={prod.pricingListId}>
                <option value="null">--select--</option>
                {pricingList &&
                  pricingList.map((pl) => (
                    <option value={pl.id}>{pl.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="row m-0 p-3 pt-4 justify-content-center">
            <div className="col-3">
              {/* <button className="submitbtn">Update</button> */}
              <button className="cancelbtn" onClick={onViewClick}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default ModifyProductForm;
