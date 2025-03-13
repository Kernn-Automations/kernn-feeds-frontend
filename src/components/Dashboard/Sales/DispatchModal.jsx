import React from 'react'
import styles from "./Sales.module.css";
import { DialogActionTrigger } from '@/components/ui/dialog';

function DispatchModal() {
    const onSubmit = (e) => e.preventDefault();
  return (
    <>
      <h3 className={`px-3 mdl-title`}>Dispatch</h3>
            <div className="row m-0 p-0">
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Date :</label>
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
                <label htmlFor="">Txn Amount :</label>
                <input type="text" />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Dispatch Date :</label>
                <input type="text" />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Truck Number :</label>
                <input type="text" />
              </div>
            </div>
      
            <div className="row m-0 p-0 justify-content-center">
              <h5 className={styles.headmdl}>Products</h5>
              <div className="col-10">
                <table
                  className={`table table-bordered borderedtable ${styles.mdltable}`}
                >
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
            </div>
            {/* <div className="row m-0 p-3 pt-4 justify-content-center">
              <div className={`col-2`}>
                <DialogActionTrigger asChild>
                  <button className="cancelbtn">Cancel</button>
                </DialogActionTrigger>
              </div>
            </div> */}
    </>
  )
}

export default DispatchModal
