import React from "react";
import { FaMapMarkerAlt, FaBoxOpen, FaTruck, FaRupeeSign } from "react-icons/fa";
import styles from "./DetailsTab.module.css"; // Create and style this CSS module

function DetailsTab({ warehouse }) {
  const {
    name,
    plot,
    street,
    area,
    city,
    district,
    state,
    country,
    pincode,
    latitude,
    longitude,
    manager = {},
    ordersToDispatch = [],
    ordersToDeliver = [],
    totalTurnover = 0,
  } = warehouse;

  const address = [plot, street, area, city, district, state, country, pincode]
    .filter(Boolean)
    .join(", ");

  const googleMapsURL = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}><FaMapMarkerAlt size={40} /></div>
        <div className={styles.titleBlock}>
          <h4>{name}</h4>
          <p className={styles.address}>{address}</p>
          <a href={googleMapsURL} target="_blank" rel="noreferrer" className={styles.mapLink}>
            <FaMapMarkerAlt /> View on Map
          </a>
        </div>
      </div>

      <div className={styles.section}>
        <h5>Warehouse Manager</h5>
        <p><strong>Name:</strong> {manager.name || "N/A"}</p>
        <p><strong>Mobile:</strong> {manager.mobile || "N/A"}</p>
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <div className={styles.cardIcon}><FaBoxOpen /></div>
          <div>
            <h6>{ordersToDispatch.length}</h6>
            <p>Orders to Dispatch</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}><FaTruck /></div>
          <div>
            <h6>{ordersToDeliver.length}</h6>
            <p>Orders to Deliver</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}><FaRupeeSign /></div>
          <div>
            <h6>{totalTurnover.toLocaleString()} Tonnes</h6>
            <p>Total Turnover</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsTab;
