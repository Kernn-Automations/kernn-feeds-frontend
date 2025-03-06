import React from "react";
import product from "../../../images/dummy-img.jpeg";
import styles from "./HomePage.module.css"

function Productbox() {
  return (
    <>
      <div className={`col-6 ${styles.bigbox}`}>
        <h4>Top Selling Product</h4>
        <div className="conatiner">
          <div className="row m-0 p-3">
            <div className={`col-4 ${styles.imagebox}`}>
              <img src={product} alt="product" />
              <h6>Product Name</h6>
              <p>1000mt</p>
            </div>
            <div className={`col-4 ${styles.imagebox}`}>
              <img src={product} alt="product" />
              <h6>Product Name</h6>
              <p>1000mt</p>
            </div>
            <div className={`col-4 ${styles.imagebox}`}>
              <img src={product} alt="product" />
              <h6>Product Name</h6>
              <p>1000mt</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Productbox;
