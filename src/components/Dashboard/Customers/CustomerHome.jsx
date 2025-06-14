import React from "react";
import styles from "./Customer.module.css";

function CustomerHome({ navigate, isAdmin }) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          {isAdmin && (
            <button
              className="homebtn"
              onClick={() => navigate("/customers/create")}
            >
              Create Customer
            </button>
          )}
          <button
            className="homebtn"
            onClick={() => navigate("/customers/customer-list")}
          >
            Customers List
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/customers/kyc-approvals")}
          >
            KYC Approvals
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/customers/reports")}
          >
            Customer Reports
          </button>
        </div>
      </div>
    </>
  );
}

export default CustomerHome;
