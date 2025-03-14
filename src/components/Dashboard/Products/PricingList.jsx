import React, { useState } from "react";

import styles from "./Products.module.css";

function PricingList({ navigate }) {
  const prices = [10, 20, 30, 40, 50];

  const [count, setCount] = useState([1]);
  const [i, seti] = useState(1);

  const onAddClick = () => {
    let x = i + 1;
    seti(i + 1);
    count.push(x);
    setCount(count);
  };

  const onDelClick = (num) => {
    let arr = [];
    count.map((x) => {
      if (x !== num) arr.push(x);
    });
    console.log(arr);
    setCount(arr);
  };
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/products")}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Pricing List
      </p>

      {count.length !== 0 &&
        count.map((x) => (
          <div className="row m-0 p-3 justify-content-center">
            <div className={`col-11 ${styles.leavesfield}`}>
              <select name="" id="">
                <option value="">--select--</option>
                {prices.map((price) => (
                  <option value="">
                    &gt;{price} (greater than {price})
                  </option>
                ))}
              </select>
              <input type="text" placeholder="Price per unit" />

              {x > 1 && (
                <span className={styles.bin} onClick={() => onDelClick(x)}>
                  <i class="bi bi-trash"></i>
                </span>
              )}
            </div>
          </div>
        ))}

      <div className="row m-0 p-3 justify-content-center">
        <div className={`col-11 ${styles.leavesfield}`}>
          <button className={styles} onClick={onAddClick}>
            <i class="bi bi-plus-circle"></i> Add
          </button>
        </div>
      </div>

      <div className="row m-0 p-3 justify-content-center">
        <div className={`col-11 ${styles.leavesfield}`}>
          <button className="submitbtn">Submit</button>
          <button className="cancelbtn" onClick={() => navigate("/products")}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default PricingList;
