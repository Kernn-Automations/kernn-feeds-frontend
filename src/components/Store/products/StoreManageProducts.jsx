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
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [visiblePrices, setVisiblePrices] = useState({});
  const [storeId, setStoreId] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // Get store ID from user context
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const user = userData.user || userData;
    const id = user.storeId || user.store?.id;
    setStoreId(id);
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      const response = await storeService.getStoreProducts(storeId);
      
      if (response.success) {
        // Map API response - API returns { id, product: { id, name }, stockQuantity, customPrice }
        const mappedProducts = (response.data || []).map((item) => ({
          id: item.product?.id || item.id,
          storeProductId: item.id, // Store the store product ID for updates
          name: item.product?.name || item.name || '-',
          SKU: item.product?.SKU || item.product?.sku || item.SKU || '-',
          category: item.product?.category || item.category || null,
          basePrice: item.customPrice || item.product?.basePrice || item.product?.price || 0,
          price: item.customPrice || item.product?.basePrice || item.product?.price || 0,
          stockQuantity: item.stockQuantity || 0,
          status: item.product?.status || 'Active'
        }));
        setProducts(mappedProducts);
      } else {
        setError(response.message || "Failed to load products");
        setIsModalOpen(true);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products");
      setIsModalOpen(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setEditPrice(product.customPrice || product.basePrice || product.price || "");
  };

  const handleSavePrice = async (product) => {
    if (!storeId) {
      setError("Store ID not found");
      setIsModalOpen(true);
      return;
    }
    
    try {
      setLoading(true);
      // Use the store products pricing endpoint
      await storeService.updateStoreProductPricing(storeId, {
        productId: product.id,
        customPrice: parseFloat(editPrice)
      });
      await fetchProducts();
      setEditingProduct(null);
      setEditPrice("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update price");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditPrice("");
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
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Base Price</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Status</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: '#666' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            style={{
                              width: '100px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e5e7eb',
                              fontFamily: 'Poppins',
                              fontSize: '13px'
                            }}
                          />
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleSavePrice(product)}
                            style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '2px 8px' }}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleCancelEdit}
                            style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '2px 8px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                            ₹{visiblePrices[product.id] ? (product.basePrice || product.price || '0.00') : '••••'}
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
                      <span className={`badge ${product.status === 'Active' ? 'bg-success' : 'bg-secondary'}`} style={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                        {product.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      {editingProduct !== product.id && (
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditClick(product)}
                          style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '4px 8px' }}
                        >
                          <FaEdit style={{ fontSize: '12px', marginRight: '4px' }} />
                          Edit Price
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

