import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import storeService from "../../../services/storeService";
import styles from "../../Dashboard/Customers/Customer.module.css";
import { Spinner } from "@chakra-ui/react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";

const StoreManageStockHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storeId, setStoreId] = useState(null);
  
  // Pagination (client-side for now as endpoint details on pagination weren't specified, but prepared structure)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    // Logic to get storeId, similar to other components
    try {
      let id = null;
      const selectedStore = localStorage.getItem("selectedStore");
      if (selectedStore) {
        const store = JSON.parse(selectedStore);
        id = store.id;
      }
      
      if (!id) {
        const currentStoreId = localStorage.getItem("currentStoreId");
        id = currentStoreId ? parseInt(currentStoreId) : null;
      }

      if (!id) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const user = userData.user || userData;
        id = user?.storeId || user?.store?.id;
      }

      if (id) {
        setStoreId(id);
      } else {
        setError("Store ID not found");
      }
    } catch (err) {
      console.error("Error retrieving store ID:", err);
      setError("Failed to determine store ID");
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchHistory();
    }
  }, [storeId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await storeService.getManageStockHistory(storeId);
      if (res.success) {
        setHistory(res.data || []);
      } else {
        setError(res.message || "Failed to fetch history");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("An error occurred while fetching history");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(history.length / limit);
  const paginatedHistory = history.slice((page - 1) * limit, page * limit);

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
        }}>Stock History</h2>
        {/* Breadcrumb Navigation */}
        <p className="path">
          <span onClick={() => navigate("/store/inventory")}>Inventory</span>{" "}
          <i className="bi bi-chevron-right"></i>{" "}
          <span onClick={() => navigate("/store/inventory/manage-stock")}>Manage Stock</span>{" "}
          <i className="bi bi-chevron-right"></i> History
        </p>
      </div>

      <div className={styles.orderStatusCard}>

        {error && (
          <div className="alert alert-danger" style={{ fontFamily: 'Poppins' }}>
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-bordered borderedtable" style={{ fontFamily: 'Poppins' }}>
            <thead>
              <tr>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Date</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Type</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Quantity</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Reason</th>
                {/* <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Performed By</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: '20px' }}>
                    <Spinner size="md" color="var(--primary-color)" /> Loading...
                  </td>
                </tr>
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '13px' }}>
                      {item.date ? new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: 600 }}>
                      {item.product?.name || item.productName || 'N/A'}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      <span className={`badge ${
                        item.transactionType === 'stockin' || item.transactionType === 'inward' ? 'bg-success' : 
                        item.transactionType === 'stockout' || item.transactionType === 'outward' ? 'bg-danger' : 'bg-secondary'
                      }`}>
                        {item.transactionType === 'stockin' ? 'Stock In' :
                         item.transactionType === 'stockout' ? 'Stock Out' :
                         item.transactionType === 'inward' ? 'Inward' :
                         item.transactionType === 'outward' ? 'Outward' : item.transactionType}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {item.quantity} {item.unit || item.product?.unit}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {item.reason || '-'}
                    </td>
                    {/* <td style={{ fontSize: '13px' }}>
                      {item.performedBy?.name || item.performedBy || '-'}
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: '20px', color: '#666' }}>
                    No history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ fontFamily: 'Poppins', color: '#666', fontSize: '14px' }}>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, history.length)} of {history.length} entries
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                <FaArrowLeftLong />
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                <FaArrowRightLong />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreManageStockHistory;
