import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { FaUpload, FaDownload, FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import storeService from "../../../services/storeService";

export default function StoreBulkPriceUpdate({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [updateType, setUpdateType] = useState("percentage"); // "percentage" or "fixed"
  const [updateValue, setUpdateValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceChanges, setPriceChanges] = useState({});

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    calculatePriceChanges();
  }, [updateType, updateValue, selectedProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      
      const response = await storeService.getStoreProducts(storeId);
      
      if (response.success) {
        // Map API response - API returns { id, product: { id, name }, stockQuantity, customPrice }
        const mappedProducts = (response.data || []).map((item) => ({
          id: item.product?.id || item.id,
          storeProductId: item.id,
          name: item.product?.name || item.name || '-',
          SKU: item.product?.SKU || item.product?.sku || item.SKU || '-',
          basePrice: item.customPrice || item.product?.basePrice || item.product?.price || 0,
          price: item.customPrice || item.product?.basePrice || item.product?.price || 0,
          stockQuantity: item.stockQuantity || 0
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

  const calculatePriceChanges = () => {
    if (!updateValue || updateValue === "") {
      setPriceChanges({});
      return;
    }

    const changes = {};
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const currentPrice = parseFloat(product.basePrice || product.price || 0);
        let newPrice;
        
        if (updateType === "percentage") {
          const percentage = parseFloat(updateValue);
          newPrice = currentPrice * (1 + percentage / 100);
        } else {
          const fixedAmount = parseFloat(updateValue);
          newPrice = currentPrice + fixedAmount;
        }
        
        changes[productId] = {
          current: currentPrice,
          new: Math.max(0, newPrice.toFixed(2))
        };
      }
    });
    
    setPriceChanges(changes);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleApplyUpdates = async () => {
    if (selectedProducts.size === 0) {
      setError("Please select at least one product");
      setIsModalOpen(true);
      return;
    }

    if (!updateValue || updateValue === "") {
      setError("Please enter an update value");
      setIsModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      
      // Get store ID from user context
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const storeId = user.storeId || user.store?.id;
      
      if (!storeId) {
        setError("Store ID not found");
        setIsModalOpen(true);
        setLoading(false);
        return;
      }
      
      const updates = Array.from(selectedProducts).map(productId => ({
        productId,
        newPrice: parseFloat(priceChanges[productId]?.new || 0)
      }));

      // Update products using store products pricing endpoint
      for (const update of updates) {
        await storeService.updateStoreProductPricing(storeId, {
          productId: update.productId,
          customPrice: update.newPrice
        });
      }

      setError("✅ Prices updated successfully!");
      setIsModalOpen(true);
      setSelectedProducts(new Set());
      setUpdateValue("");
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update prices");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
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
        }}>Bulk Price Update</h2>
        <p style={{ 
          fontFamily: 'Poppins', 
          fontSize: '14px', 
          color: '#666',
          margin: 0
        }}>Update prices for multiple products at once</p>
      </div>

      {/* Update Controls */}
      <div className={styles.orderStatusCard} style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px', color: 'var(--primary-color)' }}>
          Update Settings
        </h4>
        <div className="row mb-3">
          <div className="col-md-4">
            <label style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Update Type
            </label>
            <select
              className="form-select"
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value)}
              style={{ fontFamily: 'Poppins' }}
            >
              <option value="percentage">Percentage Change</option>
              <option value="fixed">Fixed Amount Change</option>
            </select>
          </div>
          <div className="col-md-4">
            <label style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              {updateType === "percentage" ? "Percentage (%)" : "Amount (₹)"}
            </label>
            <input
              type="number"
              step={updateType === "percentage" ? "0.1" : "0.01"}
              className="form-control"
              value={updateValue}
              onChange={(e) => setUpdateValue(e.target.value)}
              placeholder={updateType === "percentage" ? "e.g., 10 for +10%" : "e.g., 50 for +₹50"}
              style={{ fontFamily: 'Poppins' }}
            />
          </div>
          <div className="col-md-4" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleApplyUpdates}
              disabled={selectedProducts.size === 0 || !updateValue}
              style={{ fontFamily: 'Poppins', width: '100%' }}
            >
              Apply to {selectedProducts.size} Selected
            </button>
          </div>
        </div>
        {selectedProducts.size > 0 && Object.keys(priceChanges).length > 0 && (
          <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', marginTop: '12px' }}>
            <div style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              Preview: {selectedProducts.size} product(s) will be updated
            </div>
          </div>
        )}
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
            placeholder="Search products..."
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
            Products ({filteredProducts.length})
          </h4>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleSelectAll}
            style={{ fontFamily: 'Poppins' }}
          >
            {selectedProducts.size === filteredProducts.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ marginBottom: 0, fontFamily: 'Poppins' }}>
            <thead>
              <tr>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product Name</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>SKU</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Current Price</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>New Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: '#666' }}>
                    {loading ? 'Loading products...' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, i) => {
                  const isSelected = selectedProducts.has(product.id);
                  const priceChange = priceChanges[product.id];
                  return (
                    <tr 
                      key={product.id} 
                      style={{ 
                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : (i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent'),
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectProduct(product.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>
                        {product.name}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                        {product.SKU || product.sku || '-'}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>
                        ₹{product.basePrice || product.price || '0.00'}
                      </td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>
                        {priceChange ? (
                          <span style={{ color: priceChange.new > priceChange.current ? 'green' : priceChange.new < priceChange.current ? 'red' : 'inherit' }}>
                            ₹{priceChange.new}
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
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

