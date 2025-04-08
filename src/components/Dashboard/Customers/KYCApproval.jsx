import React from "react";
import styles from "./Customer.module.css";
import KYCViewModal from "./KYCViewModal";
import { IoSearch } from "react-icons/io5";

function KYCApproval({ navigate }) {
  let index;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/customers")}>Customers</span>{" "}
        <i class="bi bi-chevron-right"></i> KYC-Approvals
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
        <div className="col-10">
          <table className={`table table-bordered borderedtable`}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>SE Name</th>
                <th>SE ID</th>
                <th>Warehouse</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                className="animated-row"
                style={{ animationDelay: `${index++ * 0.1}s` }}
              >
                <td>1</td>
                <td>KM20</td>
                <td>Customer 1</td>
                <td>SE 1</td>
                <td>2233</td>
                <td>Warehouse 1</td>
                <td>
                  <KYCViewModal />
                </td>
              </tr>
              <tr
                className="animated-row"
                style={{ animationDelay: `${index++ * 0.1}s` }}
              >
                <td>2</td>
                <td>KM23</td>
                <td>Customer 2</td>
                <td>SE 2</td>
                <td>2234</td>
                <td>Warehouse 2</td>
                <td>
                  <KYCViewModal />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default KYCApproval;
