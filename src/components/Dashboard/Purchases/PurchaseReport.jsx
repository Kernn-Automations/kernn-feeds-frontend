import React, { useState } from "react";
import styles from "./Purchases.module.css";
import ReportViewModal from "./ReportViewModal";

function PurchaseReport({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/purchases")}>Purchase</span>{" "}
        <i class="bi bi-chevron-right"></i> Purchase order Report
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
        <div className={`col-3`}>
          <button className="submitbtn" onClick={() => setonsubmit(true)}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/purchases")}>
            Cancel
          </button>
        </div>
      </div>

      {onsubmit && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-10">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Purchase ID</th>
                  <th>Warehouse</th>
                  <th>Net Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 1</td>
                  <td>2000</td>
                  <td>
                    <ReportViewModal />
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 2</td>
                  <td>2000</td>
                  <td>
                    <ReportViewModal />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default PurchaseReport;
