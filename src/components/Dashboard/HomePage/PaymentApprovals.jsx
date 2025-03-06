import React from "react";
import styles from "./HomePage.module.css";

function PaymentApprovals() {
  return (
    <>
      <div className={`col-6 ${styles.smallbox}`}>
        <h4>Payment Approvals</h4>
        <div className={styles.kyccontent}>
          <div>
            <h6>80</h6>
            <p>Pending Requests</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentApprovals;
