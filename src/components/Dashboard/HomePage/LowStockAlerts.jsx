import React from "react";
import styles from "./HomePage.module.css";

function LowStockAlerts({ lowStockNotifications }) {
  return (
    <>
      {lowStockNotifications && lowStockNotifications.length !== 0 && (
        <div className={`col-6 ${styles.bigbox}`}>
          <h4>Low Stock Alerts</h4>
          <div className={styles.alertGrid}>
            {lowStockNotifications.map((item, index) => (
              <div
                className={`${styles.alertCard} ${
                  item.severity === "severe" ? styles.severe : styles.mild
                }`}
                key={index}
              >
                <p className={styles.severityLabel}>
                  {item.severity === "severe" ? "Severe Alert" : "Mild Alert"}
                </p>
                <strong>{item.product}</strong>
                <p>{item.warehouse}</p>
                <p>
                  <b>Stock:</b> {item.currentStock} / {item.threshold}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default LowStockAlerts;
