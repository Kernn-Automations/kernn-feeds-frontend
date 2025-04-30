import { DialogActionTrigger } from "@/components/ui/dialog";
import React from "react";
import styles from "./Purchases.module.css";

function AddVendorModal({ warehouse }) {
  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Create Vendor</h3>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Vendor Code :</label>
          <input type="text" />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Vendor Name :</label>
          <input type="text" />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Plot :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Street :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Area :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">City/Village :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">District :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">District 1</option>
            <option value="">District 2</option>
            <option value="">District 3</option>
          </select>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">State :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">State 1</option>
            <option value="">State 2</option>
            <option value="">State 3</option>
          </select>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Pincode :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row pt-3 mt-3 justify-content-center">
        <div className={`col-5`}>
          <button type="submit" className={`submitbtn`} data-bs-dismiss="modal">
            Create
          </button>
          <DialogActionTrigger asChild>
            <button
              type="button"
              className={`cancelbtn`}
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </DialogActionTrigger>
        </div>
      </div>
    </>
  );
}

export default AddVendorModal;
