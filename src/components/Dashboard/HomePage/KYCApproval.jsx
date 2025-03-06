import React from "react";
import styles from "./HomePage.module.css";

function KYCApproval() {
  return (
    <>
      <div className={`col-6 ${styles.smallbox}`}>
      <h4>KYC Approvals</h4>
      <div className={styles.kyccontent}>
        <div>
        <h6>10</h6>
        <p>Pending Requests</p>
        </div>
      </div>
      </div>
    </>
  );
}

export default KYCApproval;
