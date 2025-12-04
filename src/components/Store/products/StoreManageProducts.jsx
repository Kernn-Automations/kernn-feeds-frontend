import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { FaEdit, FaSearch, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import storeService from "../../../services/storeService";

export default function StoreManageProducts() {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customPrice: "",
    stockQuantity: "",
    minStockLevel: "",
    isEnabled: true
  });
  const [visiblePrices, setVisiblePrices] = useState({});
  const [storeId, setStoreId] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // Get store ID from user context - try multiple sources
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      let id = user.storeId || user.store?.id;
      
      // Fallback to other localStorage keys
      if (!id) {
        const selectedStore = localStorage.getItem("selectedStore");
        if (selectedStore) {
          const store = JSON.parse(selectedStore);
          id = store.id;
        }
      }
      
      if (!id) {
        const currentStoreId = localStorage.getItem("currentStoreId");
        id = currentStoreId ? parseInt(currentStoreId) : null;
      }
      
      console.log("Store ID retrieved:", id);
      setStoreId(id);
    } catch (err) {
      console.error("Error getting store ID:", err);
      setError("Failed to get store ID");
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchProducts();
    } else {
      console.warn("Store ID not found, cannot fetch products");
      setError("Store ID not found. Please ensure you are logged in and have a store assigned.");
      setIsModalOpen(true);
    }
  }, [storeId]);

  const fetchProducts = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      const response = await storeService.getStoreProducts(storeId);
      
      console.log("Store products response:", response);
      
      if (response.success && Array.isArray(response.data)) {
        // Map API response - GET /stores/:storeId/products returns full details with sales stats
        const mappedProducts = response.data.map((item) => ({
          id: item.productId || item.id, // Use productId for the product ID
          storeProductId: item.id, // Store the store product ID for updates
          name: item.productName || '-',
          SKU: item.sku || '-',
          category: item.category || null,
          basePrice: item.basePrice || 0,
          customPrice: item.customPrice || null,
          currentPrice: item.currentPrice || item.customPrice || item.basePrice || 0, // API uses 'currentPrice'
          stockQuantity: item.stock || 0, // API uses 'stock' in GET response
          minStockLevel: item.minStockLevel || null,
          isEnabled: item.isEnabled !== undefined ? item.isEnabled : true,
          isActive: item.isActive !== undefined ? item.isActive : true,
          unit: item.unit || '-',
          productType: item.productType || '-',
          salesCount: item.salesCount || 0, // Sales statistics
          totalSalesValue: item.totalSalesValue || 0, // Sales statistics
          status: item.isEnabled === false ? 'Disabled' : (item.isActive === false ? 'Inactive' : 'Active')
        }));
        console.log("Mapped products:", mappedProducts);
        setProducts(mappedProducts);
        
        // Store summary statistics if available
        if (response.summary) {
          setSummary(response.summary);
        }
      } else {
        const errorMsg = response.message || "Failed to load products";
        console.error("Failed to load products:", errorMsg, response);
        setError(errorMsg);
        setIsModalOpen(true);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || err.message || "Failed to load products");
      setIsModalOpen(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setEditFormData({
      customPrice: product.customPrice || product.currentPrice || product.basePrice || "",
      stockQuantity: product.stockQuantity || "",
      minStockLevel: product.minStockLevel || "",
      isEnabled: product.isEnabled !== undefined ? product.isEnabled : true
    });
  };

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: field === 'isEnabled' ? value : value
    }));
  };

  const handleSavePrice = async (product) => {
    if (!storeId) {
      setError("Store ID not found");
      setIsModalOpen(true);
      return;
    }
    
    try {
      setLoading(true);
      // Prepare request body for PUT /stores/:storeId/products/pricing
      // product.id is the actual productId (e.g., 16), not the store product ID
      const requestBody = {
        productId: product.id // Actual product ID from mapping (item.productId)
      };

      // Only include fields that have been provided
      if (editFormData.customPrice !== "" && editFormData.customPrice !== null) {
        requestBody.customPrice = parseFloat(editFormData.customPrice);
      }
      if (editFormData.stockQuantity !== "" && editFormData.stockQuantity !== null) {
        requestBody.stockQuantity = parseInt(editFormData.stockQuantity);
      }
      if (editFormData.minStockLevel !== "" && editFormData.minStockLevel !== null) {
        requestBody.minStockLevel = parseInt(editFormData.minStockLevel);
      }
      if (editFormData.isEnabled !== undefined) {
        requestBody.isEnabled = editFormData.isEnabled;
      }

      // Use the store products pricing endpoint
      await storeService.updateStoreProductPricing(storeId, requestBody);
      await fetchProducts();
      setEditingProduct(null);
      setEditFormData({
        customPrice: "",
        stockQuantity: "",
        minStockLevel: "",
        isEnabled: true
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({
      customPrice: "",
      stockQuantity: "",
      minStockLevel: "",
      isEnabled: true
    });
  };

  const togglePriceVisibility = (productId) => {
    setVisiblePrices((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.SKU?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn btn-sm btn-outline-secondary mb-3"
          onClick={() => navigate('/store/products')}
          style={{ fontFamily: 'Poppins' }}
        >
          ← Back to Products
        </button>
        <h2 style={{ 
          fontFamily: 'Poppins', 
          fontWeight: 700, 
          fontSize: '28px', 
          color: 'var(--primary-color)',
          margin: 0,
          marginBottom: '8px'
        }}>Manage Products and Prices</h2>
        <p style={{ 
          fontFamily: 'Poppins', 
          fontSize: '14px', 
          color: '#666',
          margin: 0
        }}>View and update product information and pricing</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          position: 'relative',
          maxWidth: '500px'
        }}>
          <FaSearch style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#6b7280',
            fontSize: '18px'
          }} />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              fontFamily: 'Poppins',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div className={styles.orderStatusCard} style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '4px' }}>
              {summary.catalogSize || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'Poppins' }}>Total Products</div>
          </div>
          <div className={styles.orderStatusCard} style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#28a745', marginBottom: '4px' }}>
              {summary.priceUpdates30d || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'Poppins' }}>Price Updates (30d)</div>
          </div>
          <div className={styles.orderStatusCard} style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc3545', marginBottom: '4px' }}>
              {summary.outOfStock || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'Poppins' }}>Out of Stock</div>
          </div>
          <div className={styles.orderStatusCard} style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#17a2b8', marginBottom: '4px' }}>
              {summary.newProducts || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'Poppins' }}>New Products</div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className={styles.orderStatusCard}>
        <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
          Products List ({filteredProducts.length})
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ marginBottom: 0, fontFamily: 'Poppins' }}>
            <thead>
              <tr>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product Name</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>SKU</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Category</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Price</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Stock</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Min Stock</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Status</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: '#666' }}>
                    {loading ? 'Loading products...' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, i) => (
                  <tr key={product.id} style={{ background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>
                        {product.name}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                        {product.SKU || product.sku || '-'}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                        <span className="badge bg-secondary" style={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                          {product.category?.name || product.category || '-'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                        {editingProduct === product.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.customPrice}
                            onChange={(e) => handleFormChange('customPrice', e.target.value)}
                            placeholder="Price"
                            style={{
                              width: '100px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e5e7eb',
                              fontFamily: 'Poppins',
                              fontSize: '13px'
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                              ₹{visiblePrices[product.id] ? (product.currentPrice || product.customPrice || product.basePrice || '0.00') : '••••'}
                            </span>
                            <button
                              className="btn btn-sm btn-link p-0"
                              onClick={() => togglePriceVisibility(product.id)}
                              style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '0', minWidth: 'auto' }}
                            >
                              {visiblePrices[product.id] ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                        {editingProduct === product.id ? (
                          <input
                            type="number"
                            value={editFormData.stockQuantity}
                            onChange={(e) => handleFormChange('stockQuantity', e.target.value)}
                            placeholder="Stock"
                            style={{
                              width: '80px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e5e7eb',
                              fontFamily: 'Poppins',
                              fontSize: '13px'
                            }}
                          />
                        ) : (
                          <span style={{ 
                            color: product.stockQuantity <= (product.minStockLevel || 0) ? '#dc3545' : 'inherit',
                            fontWeight: product.stockQuantity <= (product.minStockLevel || 0) ? 600 : 'normal'
                          }}>
                            {product.stockQuantity || 0} {product.unit ? product.unit : ''}
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                        {editingProduct === product.id ? (
                          <input
                            type="number"
                            value={editFormData.minStockLevel}
                            onChange={(e) => handleFormChange('minStockLevel', e.target.value)}
                            placeholder="Min"
                            style={{
                              width: '80px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e5e7eb',
                              fontFamily: 'Poppins',
                              fontSize: '13px'
                            }}
                          />
                        ) : (
                          <span>{product.minStockLevel || '-'}</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                        {editingProduct === product.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={editFormData.isEnabled}
                              onChange={(e) => handleFormChange('isEnabled', e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '11px' }}>{editFormData.isEnabled ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        ) : (
                          <span className={`badge ${product.isEnabled && product.isActive ? 'bg-success' : 'bg-secondary'}`} style={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                            {product.isEnabled === false ? 'Disabled' : (product.isActive === false ? 'Inactive' : 'Active')}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingProduct === product.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleSavePrice(product)}
                              style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '4px 8px' }}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleCancelEdit}
                              style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '4px 8px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditClick(product)}
                            style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '4px 8px' }}
                          >
                            <FaEdit style={{ fontSize: '12px', marginRight: '4px' }} />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </div>
  );
}

