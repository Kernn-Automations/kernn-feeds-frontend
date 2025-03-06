import React from "react";
import styles from "./Payments.module.css";
import img from "./../../../images/dummy-img.jpeg";
import { DialogActionTrigger } from "@/components/ui/dialog";

function ApprovalModal() {
  return (
    <>
      <h3 className={`px-3 mdl-title`}>Approvals</h3>
      <div className="row m-0 p-0">
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Date :</label>
          <input type="date" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Time :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Order ID :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse ID :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse Name :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer ID :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer Name :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">SE ID :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">SE Name :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Net Amount :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Txn ID :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Payment mode :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Photo</h5>
        <div className="col-3">
          <img src={img} alt="aadhar" className={styles.images} />
        </div>
      </div>
      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-5`}>
          <button className="submitbtn">Approve</button>
          <DialogActionTrigger asChild>
            <button className="cancelbtn">Decline</button>
          </DialogActionTrigger>
        </div>
      </div>
    </>
  );
}

export default ApprovalModal;
