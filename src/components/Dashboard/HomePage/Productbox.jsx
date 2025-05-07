import React from "react";
import img from "../../../images/dummy-img.jpeg";
import styles from "./HomePage.module.css";

function Productbox({ products }) {
  return (
    <>
      {products && (
        <div className={`col-6 ${styles.bigbox}`}>
          <h4>Top Selling Product</h4>
          <div className="conatiner">
            <div className="row m-0 p-3">
              {products &&
                products.map((product) => (
                  <div className={`col-4 ${styles.imagebox}`}>
                    <img src={product.imageUrl || img} alt="product" />
                    <h6>{product.name}</h6>
                    <p>{product.totalRevenue}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Productbox;
