import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import { Spinner } from "@chakra-ui/react";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import storeService from "@/services/storeService";
import styles from "../../Dashboard/Customers/Customer.module.css";
import inventoryStyles from "../../Dashboard/Inventory/Inventory.module.css";

function StoreManageStock() {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Store ID
  const [storeId, setStoreId] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    productId: '',
    transactionType: 'stockin',
    quantity: '',
    reason: ''
  });
  
  // Data arrays
  const [products, setProducts] = useState([]);
  const [storeInventory, setStoreInventory] = useState([]);
  const [currentStock, setCurrentStock] = useState(null);

  // Get store ID from multiple sources
  const getStoreId = () => {
    try {
      // Priority 1: selectedStore from localStorage
      const selectedStore = localStorage.getItem("selectedStore");
      if (selectedStore) {
        try {
          const store = JSON.parse(selectedStore);
          if (store && store.id) {
            return store.id;
          }
        } catch (e) {
          console.error("Error parsing selectedStore:", e);
        }
      }
      
      // Priority 2: currentStoreId from localStorage
      const currentStoreId = localStorage.getItem("currentStoreId");
      if (currentStoreId) {
        const id = parseInt(currentStoreId);
        if (!isNaN(id)) {
          return id;
        }
      }
      
      // Priority 3: From user data
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      if (user?.storeId) {
        return user.storeId;
      }
      if (user?.store?.id) {
        return user.store.id;
      }
      
      return null;
    } catch (err) {
      console.error("Error getting store ID:", err);
      return null;
    }
  };

  // Load initial data
  useEffect(() => {
    const id = getStoreId();
    if (id) {
      setStoreId(id);
      loadProducts(id);
      loadStoreInventory(id);
    }
  }, []);

  // Load current stock when product changes
  useEffect(() => {
    if (formData.productId && storeInventory.length > 0) {
      const product = storeInventory.find(item => 
        item.productId === parseInt(formData.productId) || 
        item.product?.id === parseInt(formData.productId) ||
        item.id === parseInt(formData.productId)
      );
      if (product) {
        setCurrentStock({
          quantity: product.stockQuantity || product.quantity || 0,
          unit: product.unit || product.product?.unit || ''
        });
      } else {
        setCurrentStock({ quantity: 0, unit: '' });
      }
    } else {
      setCurrentStock(null);
    }
  }, [formData.productId, storeInventory]);

  const loadProducts = async (storeId) => {
    try {
      setLoading(true);
      const response = await storeService.getStoreProducts(storeId);
      
      if (response.success) {
        setProducts(response.data || response.products || []);
      } else if (response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setProducts(response);
      } else {
        setError(response.message || "Failed to load products");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const loadStoreInventory = async (storeId) => {
    try {
      setLoading(true);
      const response = await storeService.getStoreInventory(storeId);
      
      if (response.success) {
        const inventoryData = response.data || response;
        if (inventoryData.inventory) {
          setStoreInventory(inventoryData.inventory || []);
        } else if (Array.isArray(inventoryData)) {
          setStoreInventory(inventoryData);
        } else {
          setStoreInventory([]);
        }
      } else if (response.data) {
        const inventoryData = response.data;
        if (Array.isArray(inventoryData)) {
          setStoreInventory(inventoryData);
        } else if (inventoryData.inventory) {
          setStoreInventory(inventoryData.inventory || []);
        } else {
          setStoreInventory([]);
        }
      } else if (Array.isArray(response)) {
        setStoreInventory(response);
      } else {
        setStoreInventory([]);
      }
    } catch (err) {
      console.error("Error loading store inventory:", err);
      setError("Failed to load store inventory");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.productId || !formData.quantity || !formData.reason) {
      setError("Please fill in all required fields");
      setShowErrorModal(true);
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      setShowErrorModal(true);
      return;
    }

    if (!storeId) {
      setError("Store ID not found");
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      
      // Call the manage-stock endpoint
      const response = await axiosAPI.post(`/stores/${storeId}/manage-stock`, {
        productId: parseInt(formData.productId),
        transactionType: formData.transactionType,
        quantity: parseFloat(formData.quantity),
        reason: formData.reason.trim()
      });

      const responseData = response.data || response;

      if (responseData.success || response.status === 200 || response.status === 201) {
        setSuccess("Stock updated successfully!");
        setShowSuccessModal(true);
        
        // Reset form
        setFormData({
          productId: '',
          transactionType: 'stockin',
          quantity: '',
          reason: ''
        });
        setCurrentStock(null);
        
        // Reload inventory
        await loadStoreInventory(storeId);
      } else {
        setError(responseData.message || "Failed to update stock");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update stock";
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => 
      p.id === parseInt(productId) || 
      p.productId === parseInt(productId)
    );
    return product ? (product.name || product.productName) : 'Unknown Product';
  };

  const disableWheel = (e) => {
    e.target.blur();
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/store/inventory")}>Inventory</span>{" "}
        <i className="bi bi-chevron-right"></i> Manage Stock
      </p>

      <div className="row m-0 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className={styles.head} style={{ margin: 0 }}>Manage Stock</h5>
          <button 
            className="homebtn"
            onClick={() => navigate("/store/inventory/manage-stock/history")}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '36px',
              border: '1px solid var(--primary-color)',
              color: 'var(--primary-color)',
              background: '#fff'
            }}
          >
            History
          </button>
        </div>
        
        {/* Product Selection */}
        <div className={`col-4 ${styles.longform}`}>
          <label>Product :</label>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleInputChange}
            required
          >
            <option value="">--Select Product--</option>
            {products.map((product) => (
              <option key={product.id || product.productId} value={product.id || product.productId}>
                {product.name || product.productName}
              </option>
            ))}
          </select>
        </div>

        {/* Current Stock Display */}
        {formData.productId && currentStock && (
          <div className={`col-4 ${styles.longform}`}>
            <label>Current Stock :</label>
            <span className="ms-2" style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: currentStock.quantity > 0 ? '#28a745' : '#dc3545'
            }}>
              {currentStock.quantity} {currentStock.unit}
            </span>
          </div>
        )}

        {/* Quantity */}
        <div className={`col-3 ${styles.longform}`}>
          <label>Quantity :</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            onWheel={disableWheel}
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            required
          />
        </div>

        {/* Transaction Type */}
        <div className={`col-3 ${styles.longform}`}>
          <label>Transaction Type :</label>
          <select
            name="transactionType"
            value={formData.transactionType}
            onChange={handleInputChange}
            required
          >
            <option value="stockin">Stock In (Add Stock)</option>
            <option value="stockout">Stock Out (Remove Stock)</option>
            <option value="inward">Inward (Add Stock)</option>
          </select>
        </div>

        {/* Reason */}
        <div className={`col-6 ${styles.longform}`}>
          <label>Reason :</label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            placeholder="Enter reason for this stock movement"
            required
          />
        </div>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-3">
          <button 
            className="submitbtn" 
            onClick={handleSubmit}
            disabled={loading}
            style={{ 
              position: 'relative',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Spinner size="sm" color="white" thickness="2px" />
                Updating...
              </span>
            ) : (
              'Update Stock'
            )}
          </button>
          <button
            className="cancelbtn"
            onClick={() => {
              setFormData({
                productId: '',
                transactionType: 'stockin',
                quantity: '',
                reason: ''
              });
              setCurrentStock(null);
            }}
            disabled={loading}
            style={{ 
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Round Loading Spinner Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9999
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <Spinner 
              size="xl" 
              color="#003176" 
              thickness="4px"
              speed="0.65s"
            />
            <p style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Updating Stock...
            </p>
          </div>
        </div>
      )}
      
      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          message={error}
          onClose={() => setShowErrorModal(false)}
        />
      )}
      
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          message={success}
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/store/inventory");
          }}
        />
      )}
    </>
  );
}

export default StoreManageStock;

