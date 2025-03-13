import React, { useState } from "react";
import styles from "./Payments.module.css";
import ReportsViewModal from "./ReportsViewModal";

function PaymentReports({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/payments")}>Payments</span>{" "}
        <i class="bi bi-chevron-right"></i> Payment-Reports
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 formcontent`}>
          <label htmlFor="">From :</label>
          <input type="date" />
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">To :</label>
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
          <label htmlFor="">Sales Executive :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Executive 1</option>
            <option value="">Executive 2</option>
            <option value="">Executive 3</option>
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Customer :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Customer 1</option>
            <option value="">Customer 2</option>
            <option value="">Customer 3</option>
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Payment Mode :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Online</option>
            <option value="">Offline</option>
          </select>
        </div>
      </div>

      <div className="row m-0 p-2 justify-content-center">
      <div className={`col-3 formcontent`}>
          <button className="submitbtn" onClick={() => setonsubmit(true)}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate(-1)}>
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
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>SE ID</th>
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
                  <td>4420</td>
                  <td>2323</td>
                  <td>Warehouse 1</td>
                  <td>20000</td>
                  <td>
                    <ReportsViewModal />
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM23</td>
                  <td>4423</td>
                  <td>2324</td>
                  <td>Warehouse 2</td>
                  <td>32000</td>
                  <td>
                    <ReportsViewModal />
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

export default PaymentReports;
