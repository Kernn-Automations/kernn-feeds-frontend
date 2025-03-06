import React from "react";
import styles from "./Purchases.module.css"

function PurchaseHome({navigate}) {

  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <button
            className="homebtn"
            onClick={() => navigate("/purchases/new-purchase")}
          >
            + New Purchase Order
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/purchases/purchase-report")}
          >
            Purchase Order Report
          </button>
        </div>
      </div>
    </>
  );
}

export default PurchaseHome;
