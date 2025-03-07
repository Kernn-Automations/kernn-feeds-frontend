import styles from "./products.module.css";
import React, { useEffect, useState } from "react";
import { DialogActionTrigger } from "@/components/ui/dialog";

function DeleteProductModal() {
  const onSubmit = (e) => e.preventDefault();
  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Delete Warehouse</h3>
      <form action="" onSubmit={onSubmit}>
        <div className="row pt-3 justify-content-center">
          <div className={`col inputcolumn-mdl`}>
            <select name="" id="" className={styles.delsec}>
              <option value="">--Select Product--</option>
              <option value="">Product 1</option>
              <option value="">Product 2</option>
              <option value="">Product 3</option>
            </select>
          </div>
        </div>
        <div className="row pt-3 justify-content-center">
          <div className={`col-5`}>
            <button
              type="button"
              className={` cancelbtn`}
              data-bs-dismiss="modal"
            >
              Delete
            </button>

            <DialogActionTrigger asChild>
              <button
                type="button"
                className={`submitbtn`}
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </DialogActionTrigger>
          </div>
        </div>
      </form>
    </>
  );
}

export default DeleteProductModal;
