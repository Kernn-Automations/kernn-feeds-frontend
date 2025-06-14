import React from "react";
import styles from "./Stock.module.css";
import ProductsList from "./ProductsList";

function TransferDetail({ transfer, setTransfer, navigate }) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/stock-transfer")}>Stock Transfer</span>{" "}
        <i className="bi bi-chevron-right"></i>
        <span onClick={() => setTransfer(null)}>Transfer List</span>{" "}
        <i className="bi bi-chevron-right"></i> transfer Details
      </p>

      <div className={styles.trackingContainer}>
        <h2 className={styles.trackingTitle}>Stock Transfer Details</h2>

        <div className={styles.flexx}>
          <div className={styles.infoCard}>
            <div>
              <h6>Transfer Number : {transfer?.transferNumber}</h6>
              <p>Date : {transfer.createdAt?.slice(0, 10)}</p>
              <p>Transfer Date : {transfer.transferDate?.slice(0, 10)}</p>
              {/* <p>Email : {order.customer.email}</p> */}
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.wseDetails}>
            <h6>From Warehouse</h6>
            <p>
              <span>Name : </span>
              {transfer?.fromWarehouse?.name}
            </p>
            <p>
              <span>Address : </span>
              {transfer.fromWarehouse?.plot}, {transfer.fromWarehouse?.street},{" "}
              {transfer.fromWarehouse?.area}
            </p>
            <p>
              {transfer.fromWarehouse?.city}, {transfer.fromWarehouse?.district}
              , {transfer.fromWarehouse?.state}
            </p>
            <p>{transfer.fromWarehouse?.pincode}</p>
          </div>
          <div className={styles.wseDetails}>
            <h6>To Warehouse</h6>
            <p>
              <span>Name : </span>
              {transfer?.toWarehouse?.name}
            </p>
            <p>
              <span>Address : </span>
              {transfer.toWarehouse?.plot}, {transfer.toWarehouse?.street},{" "}
              {transfer.toWarehouse?.area}
              <p>
                {transfer.toWarehouse?.city}, {transfer.toWarehouse?.district},{" "}
                {transfer.toWarehouse?.state}
              </p>
              <p>{transfer.toWarehouse?.pincode}</p>
            </p>
          </div>
        </div>
        <div className={styles.infoGrid}>
          <h6 className={styles.title}>Transfered Items </h6>
          <div className={styles.infoCard}>
            <ProductsList items={transfer.items} />
          </div>
        </div>
      </div>
    </>
  );
}

export default TransferDetail;
