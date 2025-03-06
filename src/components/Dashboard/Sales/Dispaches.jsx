import React, { useState } from "react";
import styles from "./Sales.module.css";
import DispachViewModal from "./DispachViewModal";

function Dispaches({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);
  return (
    <>
      <p className="path">
        <span onClick={() => navigate(-1)}>Sales</span>{" "}
        <i class="bi bi-chevron-right"></i> Dispaches
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
        <div className={`col-3 ${styles.formcontent}`}>
          <label htmlFor="">Customer :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Customer 1</option>
            <option value="">Customer 2</option>
            <option value="">Customer 3</option>
          </select>
        </div>
        {!onsubmit && (
          <div className={`col-3 ${styles.formcontent}`}>
            <button className="submitbtn" onClick={() => setonsubmit(true)}>
              Submit
            </button>
            <button className="cancelbtn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {onsubmit && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-10">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Warehouse ID</th>
                  <th>Customer ID</th>
                  <th>Dispach Date</th>
                  <th>Truck No.</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>4420</td>
                  <td>2323</td>
                  <td>2025-02-28</td>
                  <td>AP-12-DF-2022</td>
                  <td><DispachViewModal/></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM23</td>
                  <td>4423</td>
                  <td>2324</td>
                  <td>2025-02-28</td>
                  <td>AP-12-DF-2023</td>
                  <td><DispachViewModal/></td>
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

export default Dispaches;
