import React from "react";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

function PaymentApprovals({ orderStatuses }) {
  const navigate = useNavigate();
  return (
    <>
      {orderStatuses && (
        <div
          className={`col-6 ${styles.smallbox}`}
          onClick={() => navigate("/payments/payment-approvals")}
        >
          <h4>Order Statuses</h4>
          <div className={styles.kyccontent}>
            <p>
              <span>Pending Payment Approvals :</span>{" "}
              <span className={styles.num}>
                {orderStatuses.paymentApprovalPending}
              </span>
            </p>
            <p>
              <span>Waiting for Delivery :</span>{" "}
              <span className={styles.num}>
                {orderStatuses.waitingForDelivery}
              </span>
            </p>
            <p>
              <span>Waiting for Dispatch :</span>{" "}
              <span className={styles.num}>
                {orderStatuses.waitingForDispatch}
              </span>
            </p>
            <div>
              {/* <h6>{orderStatuses.pendingRequests}</h6>
              <p>Pending Requests</p> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentApprovals;
