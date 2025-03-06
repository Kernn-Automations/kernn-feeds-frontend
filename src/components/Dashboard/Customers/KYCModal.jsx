import React from "react";
import styles from "./Customer.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";
import img from "./../../../images/dummy-img.jpeg";

function KYCModal() {
  return (
    <>
      <h3 className={`px-3 mdl-title`}>KYC Approval</h3>
      <div className="row m-0 p-0 ">
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer ID :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer Name :</label>
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
          <label htmlFor="">SE ID :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">SE Name :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Address</h5>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 1 :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 2 :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Village/City :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">District :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">State :</label>
          <input type="text" />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Pincode :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-0 ">
        <h5 className={styles.headmdl}>Aadhar proof</h5>
        <div className={`col-4 `}>
          <img src={img} alt="aadhar" className={styles.images} />
          <span>Aadhar Front</span>
        </div>
        <div className={`col-4 `}>
          <img src={img} alt="aadhar" className={styles.images} />
          <span>Aadhar Back</span>
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>PAN Card proof</h5>
        <div className={`col-4 `}>
          <img src={img} alt="aadhar" className={styles.images} />
          <span>PAN Front</span>
        </div>
        <div className={`col-4 `}>
          <img src={img} alt="aadhar" className={styles.images} />
          <span>PAN Back</span>
        </div>

        <div className="row m-0 p-0 ">
          <h5 className={styles.headmdl}>Photo</h5>
          <div className={`col-4 `}>
            <img src={img} alt="aadhar" className={styles.images} />
          </div>
        </div>
      </div>
      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-4`}>
          <button className="submitbtn">Approve</button>
          <DialogActionTrigger asChild>
            <button className="cancelbtn">Decline</button>
          </DialogActionTrigger>
        </div>
      </div>
    </>
  );
}

export default KYCModal;
