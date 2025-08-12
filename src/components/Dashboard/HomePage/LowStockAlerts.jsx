import React, { useRef } from "react";
import styles from "./HomePage.module.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

function LowStockAlerts({ lowStockNotifications }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };
  return (
    <>
      {lowStockNotifications && lowStockNotifications.length !== 0 && (
        <div className={`col-6 ${styles.bigbox}`}>
          <h4>Low Stock Alerts</h4>
          <div className={styles.scrollContainer}>
            {lowStockNotifications.length > 3 && (
              <button className={styles.arrow} onClick={() => scroll("left")}>
                <IoIosArrowBack />
              </button>
            )}
            <div className={styles.scrollRow} ref={scrollRef}>
              {lowStockNotifications.map((item, index) => (
                <div className={styles.stockbox} key={index}>
                  <div
                    className={`${styles.alertCard} ${
                      item.severity === "severe" ? styles.severe : styles.mild
                    }`}
                    key={index}
                  >
                    <p className={styles.severityLabel}>
                      {item.severity === "severe"
                        ? "Severe Alert"
                        : "Mild Alert"}
                    </p>
                    <strong>{item.product}</strong>
                    <p>{item.warehouse}</p>
                    <p>
                      <b>Stock:</b> {item.stock} / {item.threshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {lowStockNotifications.length > 3 && (
              <button className={styles.arrow} onClick={() => scroll("right")}>
                <IoIosArrowForward />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default LowStockAlerts;
