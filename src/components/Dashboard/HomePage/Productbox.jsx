import React, { useRef } from "react";
import img from "../../../images/dummy-img.jpeg";
import styles from "./HomePage.module.css";
import { IoIosArrowBack } from "react-icons/io";

import { IoIosArrowForward } from "react-icons/io";

function Productbox({ products }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {products && products.length !== 0 && (
        <div className={`col-6 ${styles.bigbox}`}>
          <h4>Top Selling Product</h4>
          <div className={styles.scrollContainer}>
            {products.length > 3 && (
              <button className={styles.arrow} onClick={() => scroll("left")}>
                <IoIosArrowBack/>
              </button>
            )}
            <div className={styles.scrollRow} ref={scrollRef}>
              {products.map((product, index) => (
                <div className={styles.imagebox} key={index}>
                  <img src={product.imageUrl || img} alt="product" />
                  <h6>{product.productName}</h6>
                  <p>{product.totalRevenue}</p>
                </div>
              ))}
            </div>
            {products.length > 3 && (
              <button className={styles.arrow} onClick={() => scroll("right")}>
                <IoIosArrowForward/>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Productbox;
