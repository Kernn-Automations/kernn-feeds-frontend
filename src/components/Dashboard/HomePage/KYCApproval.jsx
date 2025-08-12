import React from "react";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

function KYCApproval({ kycApprovals }) {
  const navigate = useNavigate();
  return (
    <>
      {kycApprovals !== undefined && kycApprovals !== null && (
        <div
          className={`col-6 ${styles.bigbox}`}
          onClick={() => navigate("/customers/kyc-approvals")}
        >
          <h4>KYC Approvals</h4>
          <div className={styles.kyccontent}>
            <div>
              <h6>{kycApprovals}</h6>
              <p>Pending Requests</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KYCApproval;
