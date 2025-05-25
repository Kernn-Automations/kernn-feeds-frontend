import React from 'react'
import styles from "./Payments.module.css";
import img from "./../../../images/dummy-img.jpeg";
import { DialogActionTrigger } from "@/components/ui/dialog";

function ReportsModal({report}) {
  return (
    <>
      <h3 className={`px-3 mdl-title`}>Reports</h3>
            <div className="row m-0 p-0">
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Date :</label>
                <input type="date" value={report.transactionDate} />
              </div>
              {/* <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Time :</label>
                <input type="text" />
              </div> */}
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Order ID :</label>
                <input type="text" value={report.order && report.order?.orderNumber} />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Warehouse ID :</label>
                <input type="text" value={report.order && report.order.warehouse?.id} />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Warehouse Name :</label>
                <input type="text" value={report.order && report.order.warehouse?.name} />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Customer ID :</label>
                <input type="text" value={report.order && report.order.customer?.id} />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Customer Name :</label>
                <input type="text" value={report.order && report.order.customer?.name}/>
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">SE ID :</label>
                <input type="text" value={report.order && report.order.salesExecutive?.id} />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">SE Name :</label>
                <input type="text" value={report.order && report.order.salesExecutive?.name} />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Net Amount :</label>
                <input type="text" value={report.netAmount} />
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Txn ID :</label>
                <input type="text" value={report.transactionReference}/>
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Payment Id :</label>
                <input type="text" value={report.paymentId}/>
              </div>
              <div className={`col-4 ${styles.longformmdl}`}>
                <label htmlFor="">Payment mode :</label>
                <input type="text" value={report.paymentMode}/>
              </div>
            </div>
      
            <div className="row m-0 p-0">
              <h5 className={styles.headmdl}>Photo</h5>
              <div className="col-3">
                <img src={report.paymentProof || img} alt="aadhar" className={styles.images} />
              </div>
            </div>
            {/* <div className="row m-0 p-3 pt-4 justify-content-center">
              <div className={`col-2`}>
                <DialogActionTrigger asChild>
                  <button className="cancelbtn">Close</button>
                </DialogActionTrigger>
              </div>
            </div> */}
    </>
  )
}

export default ReportsModal
