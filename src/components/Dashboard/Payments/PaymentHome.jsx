import React from "react";
import styles from "./Payments.module.css";

function PaymentHome({ navigate }) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <button
            className="homebtn"
            onClick={() => navigate("/payments/payment-reports")}
          >
            Payment Reports
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/payments/payment-approvals")}
          >
            Payment Approvals
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/payments/credit-notes")}
          >
            Credit Notes
          </button>
        </div>
      </div>
    </>
  );
}

export default PaymentHome;
