import React from "react";
import styles from "./Purchases.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";

function ReportsModal() {
  const onSubmit = (e) => e.preventDefault();
  return (
    <>
      <h3 className={`px-3 mdl-title`}>Purchase Report</h3>
      <div className="row m-0 p-0">
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Date :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Time :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">User ID :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Warehouse 1</option>
            <option value="">Warehouse 2</option>
            <option value="">Warehouse 3</option>
          </select>
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Purchase ID :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>TO</h5>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor Name :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor ID :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 1 :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 2 :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Village/City :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">District :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">State :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Pincode :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-0 justify-content-center">
        <h5 className={styles.headmdl}>Products</h5>
        <div className="col-10">
          <table className={`table table-bordered borderedtable ${styles.mdltable}`}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Units</th>
                <th>Quantity</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>#234</td>
                <td>Product 1</td>
                <td>32</td>
                <td>5</td>
                <td>20000</td>
              </tr>
              <tr>
                <td>2</td>
                <td>#235</td>
                <td>Product 2</td>
                <td>34</td>
                <td>5</td>
                <td>25000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="row m-0 p-3 pt-4">
          <div className={`col-3 ${styles.longformmdl}`}>
            <label htmlFor="">Total Amount :</label>
            <span> 1,30,000/-</span>
          </div>
        </div>
      </div>

      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-4`}>
          <button className="submitbtn">Download</button>
          <DialogActionTrigger asChild>
            <button className="cancelbtn">Cancel</button>
          </DialogActionTrigger>
        </div>
      </div>
    </>
  );
}

export default ReportsModal;
