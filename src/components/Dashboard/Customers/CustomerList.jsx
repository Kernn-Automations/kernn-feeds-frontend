import React from "react";
import styles from "./Customer.module.css";
import { IoSearch } from "react-icons/io5";
import CustomersViewModal from "./CustomersViewModal";

function CustomerList({ navigate }) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate(-1)}>Customers</span>{" "}
        <i class="bi bi-chevron-right"></i> Customer-list
      </p>

      <div className="row m-0 p-3">
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
          <label htmlFor="">Sales Executive :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Executive 1</option>
            <option value="">Executive 2</option>
            <option value="">Executive 3</option>
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 justify-content-end">
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
              <tr>
                <td>1</td>
                <td>KM20</td>
                <td>Customer 1</td>
                <td>SE 1</td>
                <td>2233</td>
                <td>Warehouse 1</td>
                <td>
                  <CustomersViewModal />
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>KM23</td>
                <td>Customer 2</td>
                <td>SE 2</td>
                <td>2234</td>
                <td>Warehouse 2</td>
                <td>
                  <CustomersViewModal />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default CustomerList;
