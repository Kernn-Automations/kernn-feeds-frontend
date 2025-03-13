import React, { useState } from "react";
import styles from "./Inventory.module.css";
function IncomingStock({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i> Incoming Stock
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 ${styles.formcontent}`}>
          <label htmlFor="">From :</label>
          <input type="date" />
        </div>
        <div className={`col-3 ${styles.formcontent}`}>
          <label htmlFor="">To :</label>
          <input type="date" />
        </div>
        <div className={`col-3 ${styles.formcontent}`}>
          <label htmlFor="">WareHouse :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Warehouse 1</option>
            <option value="">Warehouse 2</option>
            <option value="">Warehouse 3</option>
          </select>
        </div>
        <div className={`col-3 ${styles.formcontent}`}>
          <label htmlFor="">Product :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Product 1</option>
            <option value="">Product 2</option>
            <option value="">Product 3</option>
          </select>
        </div>
      </div>
      {!onsubmit && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-4">
            <button className="submitbtn" onClick={() => setonsubmit(true)}>
              Submit
            </button>
            <button className="cancelbtn" onClick={() => navigate("/inventory")}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {onsubmit && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-8">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>PO ID</th>
                  <th>Warehouse ID</th>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>3423</td>
                  <td>#4545</td>
                  <td>3</td>
                  <td>2000</td>
                </tr>
                <tr>
                <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>3423</td>
                  <td>#4545</td>
                  <td>3</td>
                  <td>2000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="row m-0 p-3 justify-content-center">
          <div className="col-2">
            <button className="cancelbtn" onClick={() => setonsubmit(false)}>
              back
            </button>
          </div>
        </div>
        </div>
      )}
    </>
  );
}

export default IncomingStock;
