import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import inventoryAni from "../../../images/animations/fetchingAnimation.gif";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";

function StoreCurrentStock() {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState([]);
  const [error, setError] = useState(null);
  const [filteredStock, setFilteredStock] = useState([]);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCurrentStock();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = currentStock.filter(item =>
        item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStock(filtered);
    } else {
      setFilteredStock(currentStock);
    }
  }, [searchTerm, currentStock]);

  const fetchCurrentStock = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get store ID from user context or localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const storeId = user.storeId || user.store?.id;

      if (!storeId) {
        setError("Store ID not found. Please ensure you are assigned to a store.");
        return;
      }

      const res = await axiosAPI.get(`/stores/${storeId}/inventory`);
      
      if (res.data && res.data.inventory) {
        const inventoryData = res.data.inventory;
        const transformedStock = Array.isArray(inventoryData) ? inventoryData.map((item, index) => ({
          id: item.id || index,
          productName: item.product?.name || item.name || "N/A",
          productCode: item.product?.SKU || item.SKU || item.productCode || "N/A",
          currentStock: parseFloat(item.stockQuantity || item.quantity || item.currentStock) || 0,
          unit: item.product?.unit || item.unit || "kg",
          unitPrice: parseFloat(item.product?.basePrice || item.basePrice || item.unitPrice) || 0,
          stockValue: parseFloat(item.stockValue || ((item.stockQuantity || item.quantity || 0) * (item.product?.basePrice || item.basePrice || 0))) || 0,
          isLowStock: item.isLowStock || false,
          stockStatus: item.stockStatus || "normal",
          lastUpdated: item.lastUpdated || item.updatedAt || new Date().toISOString(),
          productType: item.product?.productType || item.productType || "unknown"
        })) : [];
        
        setCurrentStock(transformedStock);
        setFilteredStock(transformedStock);
      } else {
        setCurrentStock([]);
        setFilteredStock([]);
      }
    } catch (err) {
      console.error('Error fetching current stock:', err);
      setError(err?.response?.data?.message || err?.message || "Failed to load current stock");
      setCurrentStock([]);
      setFilteredStock([]);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setError(null);
  };

  const stats = {
    totalProducts: filteredStock.length,
    inStock: filteredStock.filter(item => item.currentStock > 0).length,
    lowStock: filteredStock.filter(item => item.isLowStock).length,
    outOfStock: filteredStock.filter(item => item.currentStock === 0).length,
    totalValue: filteredStock.reduce((total, item) => total + item.stockValue, 0),
    packedProducts: filteredStock.filter(item => item.productType === "packed").length,
    looseProducts: filteredStock.filter(item => item.productType === "loose").length
  };

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
        }}>Current Stock</h2>
        <p className="path">
          <span onClick={() => navigate("/store/inventory")}>Inventory</span>{" "}
          <i class="bi bi-chevron-right"></i> Current Stock
        </p>
      </div>

      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={inventoryAni} msg="Loading current stock..." />}

      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={closeErrorModal} />}

      {/* Summary Cards */}
      {!loading && currentStock.length > 0 && (
        <Flex wrap="wrap" justify="space-between" px={2} style={{ marginBottom: '24px' }}>
          <ReusableCard title="Total Products" value={stats.totalProducts.toString()} />
          <ReusableCard title="In Stock" value={stats.inStock.toString()} color="green.500" />
          <ReusableCard title="Low Stock" value={stats.lowStock.toString()} color="yellow.500" />
          <ReusableCard title="Out of Stock" value={stats.outOfStock.toString()} color="red.500" />
          <ReusableCard title="Total Value" value={`₹${(stats.totalValue / 100000).toFixed(2)}L`} color="blue.500" />
        </Flex>
      )}

      {/* Search and Filter */}
      {!loading && currentStock.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search by product name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                fontFamily: 'Poppins',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Poppins', fontSize: '14px', marginRight: '8px' }}>Show:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontFamily: 'Poppins',
                fontSize: '14px'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button 
            className="homebtn"
            onClick={() => navigate('/store/inventory')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1' }}
          >
            Back to Inventory
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentStock.length === 0 && !error && (
        <div className={styles.orderStatusCard}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h4 style={{ fontFamily: 'Poppins', color: '#666', marginBottom: '12px' }}>No inventory data found</h4>
            <p style={{ fontFamily: 'Poppins', color: '#999', margin: 0 }}>There are no products in stock for this store.</p>
          </div>
        </div>
      )}

      {/* Stock Table */}
      {!loading && filteredStock.length > 0 && (
        <div className={styles.orderStatusCard}>
          <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
            Current Stock Details
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ marginBottom: 0, fontFamily: 'Poppins' }}>
              <thead>
                <tr>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>S.No</th>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product Name</th>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product Code</th>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Current Stock</th>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Unit</th>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Unit Price</th>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Total Value</th>
                  <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.slice(0, limit).map((item, index) => (
                  <tr key={item.id || index} style={{ background: index % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{index + 1}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>{item.productName}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{item.productCode}</td>
                    <td>
                      <span className={`badge ${
                        item.isLowStock 
                          ? 'bg-warning' 
                          : item.currentStock > 0 
                            ? 'bg-success' 
                            : 'bg-danger'
                      }`} style={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                        {item.currentStock}
                      </span>
                      {item.isLowStock && (
                        <small className="text-warning d-block" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>Low Stock</small>
                      )}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{item.unit}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>₹{item.unitPrice}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>
                      ₹{item.stockValue.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        item.stockStatus === 'normal' ? 'bg-success' : 
                        item.stockStatus === 'low' ? 'bg-warning' : 'bg-danger'
                      }`} style={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                        {item.stockStatus || 'normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStock.length > limit && (
            <div style={{ marginTop: '16px', textAlign: 'center', fontFamily: 'Poppins', fontSize: '14px', color: '#666' }}>
              Showing {limit} of {filteredStock.length} products
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StoreCurrentStock;

