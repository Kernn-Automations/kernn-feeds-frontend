import React, { useState } from "react";
import styles from "./Inventory.module.css";

import xls from "./../../../images/xls-png.png"
import pdf from "./../../../images/pdf-png.png"

function StockSummary({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i>Stock Summary
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Date :</label>
          <input type="date" />
        </div>

        <div className={`col-3 formcontent`}>
          <label htmlFor="">WareHouse :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Warehouse 1</option>
            <option value="">Warehouse 2</option>
            <option value="">Warehouse 3</option>
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Product 1</option>
            <option value="">Product 2</option>
            <option value="">Product 3</option>
          </select>
        </div>
        <div className="col-3 formcontent">
            <button className="submitbtn" onClick={() => setonsubmit(true)}>
              Submit
            </button>
            <button className="cancelbtn" onClick={() => navigate("/inventory")}>
              Cancel
            </button>
          </div>
      </div>
     
        <div className="row m-0 p-3 justify-content-center">
          
        </div>
      
      {onsubmit && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-8">
          <div className="col-lg-8">
              <button className={styles.xls}>
                <p>Export to </p>
                <img src={xls} alt="" />
              </button>
              <button className={styles.xls}>
                <p>Export to </p>
                <img src={pdf} alt="" />
              </button>
            </div>
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Warehouse ID</th>
                  <th>Warehouse Name</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 1</td>
                  <td>#4545</td>
                  <td>Product 1</td>
                  <td>3</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 2</td>
                  <td>#4545</td>
                  <td>Product 2</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>
      )}
    </>
  );
}

export default StockSummary;
