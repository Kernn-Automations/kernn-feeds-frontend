import React, { useState } from "react";
import styles from "./HomePage.module.css";
import { FaExclamationTriangle, FaWarehouse, FaBoxes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function LowStockAlerts({ lowStockNotifications }) {
  const [currentPage, setCurrentPage] = useState(0);
  const stocksPerPage = 6;

  const getSeverityIcon = (severity) => {
    return severity === "severe" ? (
      <FaExclamationTriangle className={styles.severeIcon} />
    ) : (
      <FaExclamationTriangle className={styles.mildIcon} />
    );
  };

  const getSeverityColor = (severity) => {
    return severity === "severe" ? "#ef4444" : "#f59e0b";
  };

  if (!lowStockNotifications || lowStockNotifications.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(lowStockNotifications.length / stocksPerPage);
  const startIndex = currentPage * stocksPerPage;
  const endIndex = startIndex + stocksPerPage;
  const currentStocks = lowStockNotifications.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className={`col-6 ${styles.bigbox}`}>
      <div className={styles.alertHeader}>
        <h4>Low Stock Alerts</h4>
        <div style={{ 
          background: '#ef4444', 
          color: 'white', 
          borderRadius: '50%', 
          width: '24px', 
          height: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '12px', 
          fontWeight: '600', 
          fontFamily: 'Poppins' 
        }}>
          {lowStockNotifications.length}
        </div>
      </div>
      
      <div className={styles.alertContainer}>
        <div className={styles.stocksGrid}>
          {currentStocks.map((item, index) => (
            <div 
              key={startIndex + index} 
              className={styles.stockAlertItem}
              style={{ borderLeft: `3px solid ${getSeverityColor(item.severity)}` }}
            >
              <div 
                className={styles.stockIndicator}
                style={{ 
                  backgroundColor: item.severity === "severe" 
                    ? "rgba(239, 68, 68, 0.1)" 
                    : "rgba(245, 158, 11, 0.1)" 
                }}
              >
                {getSeverityIcon(item.severity)}
              </div>
              
              <div className={styles.stockContent}>
                <div className={styles.stockTitle}>
                  <strong>{item.product}</strong>
                  <span 
                    className={styles.stockSeverityTag}
                    style={{ backgroundColor: getSeverityColor(item.severity) }}
                  >
                    {item.severity === "severe" ? "Critical" : "Warning"}
                  </span>
                </div>
                
                <div className={styles.stockDetails}>
                  <div className={styles.stockDetail}>
                    <FaWarehouse className={styles.stockDetailIcon} />
                    <span>{item.warehouse}</span>
                  </div>
                  <div className={styles.stockDetail}>
                    <FaBoxes className={styles.stockDetailIcon} />
                    <span>{item.stock} / {item.threshold}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.paginationControls}>
            <button 
              className={styles.paginationArrow}
              onClick={goToPrevPage}
              disabled={currentPage === 0}
            >
              <FaChevronLeft />
            </button>
            <span className={styles.pageInfo}>
              {currentPage + 1} of {totalPages}
            </span>
            <button 
              className={styles.paginationArrow}
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LowStockAlerts;
