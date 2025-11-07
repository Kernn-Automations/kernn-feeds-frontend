import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import styles from "../../Dashboard/HomePage/HomePage.module.css";

function StoreStockSummary() {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const fetchStock = async () => {
    if (!from || !to) {
      setError("Please select both From and To dates.");
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get store ID from user context
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const storeId = user.storeId || user.store?.id;

      if (!storeId) {
        setError("Store ID not found. Please ensure you are assigned to a store.");
        setIsModalOpen(true);
        setLoading(false);
        return;
      }

      const query = `/stores/${storeId}/stock-summary?fromDate=${from}&toDate=${to}`;
      console.log('StoreStockSummary - Fetching stock with query:', query);
      
      const res = await axiosAPI.get(query);
      console.log('StoreStockSummary - Response data:', res.data);
      
      setStockData(res.data.data || []);
    } catch (err) {
      console.error('StoreStockSummary - Error:', err);
      setError(err.response?.data?.message || "Failed to fetch stock data.");
      setIsModalOpen(true);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderArrayData = (dataArray) => (
    <table className="table table-bordered borderedtable table-sm mt-2" style={{ fontFamily: 'Poppins' }}>
      <thead className="table-light">
        <tr>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product</th>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Opening</th>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Inward</th>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Outward</th>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Stock In</th>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Stock Out</th>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Closing</th>
          <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Type</th>
        </tr>
      </thead>
      <tbody>
        {dataArray.map((item, index) => (
          <tr key={index} style={{ background: index % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>{item.productName || '-'}</td>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{item.opening?.toFixed(2) || '0.00'}</td>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#059669' }}>+{item.inward?.toFixed(2) || '0.00'}</td>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#ef4444' }}>-{item.outward?.toFixed(2) || '0.00'}</td>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#059669' }}>+{item.stockIn?.toFixed(2) || '0.00'}</td>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#ef4444' }}>-{item.stockOut?.toFixed(2) || '0.00'}</td>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>
              {item.closing?.toFixed(2) || '0.00'}
            </td>
            <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
              <span className="badge bg-secondary" style={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                {item.productType || 'N/A'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontFamily: 'Poppins', 
          fontWeight: 700, 
          fontSize: '28px', 
          color: 'var(--primary-color)',
          margin: 0,
          marginBottom: '8px'
        }}>Stock Summary</h2>
        <p className="path">
          <span onClick={() => navigate("/store/inventory")}>Inventory</span>{" "}
          <i class="bi bi-chevron-right"></i> Stock Summary
        </p>
      </div>

      {/* Filters */}
      <div className={styles.orderStatusCard} style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
          Select Date Range
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              From Date
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontFamily: 'Poppins',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              To Date
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontFamily: 'Poppins',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="homebtn"
              onClick={fetchStock}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1', flex: 1 }}
            >
              {loading ? 'Loading...' : 'Submit'}
            </button>
            <button 
              className="homebtn"
              onClick={() => navigate('/store/inventory')}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1', flex: 1 }}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Stock Display */}
      {loading && <Loading />}
      
      {!loading && Array.isArray(stockData) && stockData.length > 0 && (
        <div className={styles.orderStatusCard}>
          <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
            Stock Summary Data
          </h4>
          {renderArrayData(stockData)}
        </div>
      )}

      {!loading && stockData.length === 0 && from && to && (
        <div className={styles.orderStatusCard}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h4 style={{ fontFamily: 'Poppins', color: '#666', marginBottom: '12px' }}>No stock data found</h4>
            <p style={{ fontFamily: 'Poppins', color: '#999', margin: 0 }}>
              No stock data available for the selected date range.
            </p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ErrorModal
          isOpen={isModalOpen}
          message={error}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default StoreStockSummary;

