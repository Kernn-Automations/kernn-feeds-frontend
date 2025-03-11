import React from "react";
import styles from "./Sales.module.css";

function SalesHome({navigate}) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <button className="homebtn" onClick={() => navigate("/sales/orders")}>
            Sales Orders
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/sales/dispatches")}
          >
            Dispaches
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/sales/deliveries")}
          >
            Deliveries
          </button>
        </div>
      </div>
    </>
  );
}

export default SalesHome;
