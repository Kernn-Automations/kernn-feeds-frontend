import React from "react";
import styles from "./Payments.module.css";
import ApprovalsViewModal from "./ApprovalsViewModal";
import { IoSearch } from "react-icons/io5";

function PaymentApprovals({ navigate }) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/payments")}>Payments</span>{" "}
        <i class="bi bi-chevron-right"></i> Payment-approvals
      </p>

      <div className="row m-0 p-3 pt-5 justify-content-end">
        <div className={`col-4 ${styles.search}`}>
          <input type="text" placeholder="Search..." />
          <span className={styles.searchicon}>
            <IoSearch />
          </span>
        </div>
      </div>

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
                  <ApprovalsViewModal />
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
                  <ApprovalsViewModal />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default PaymentApprovals;
