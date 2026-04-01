import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import StoreImportPanel from "@/components/Store/inventory/StoreImportPanel";
import storeService from "@/services/storeService";
import {
  formatDateTimeIN,
  getCurrentDateTimeLocal,
} from "@/utils/dateFormat";
import { isAdmin, isDivisionHead, isSuperAdmin } from "@/utils/roleUtils";
import styles from "../../Dashboard/Customers/Customer.module.css";
import inventoryStyles from "../../Dashboard/Inventory/Inventory.module.css";

function StoreManageStock() {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastLedgerResult, setLastLedgerResult] = useState(null);

  // Store ID
  const [storeId, setStoreId] = useState(null);
  const [storeCode, setStoreCode] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    productId: "",
    transactionType: "stockin",
    quantity: "",
    reason: "",
    recordedAt: getCurrentDateTimeLocal(),
  });

  // Data arrays
  const [products, setProducts] = useState([]);
  const [storeInventory, setStoreInventory] = useState([]);
  const [currentStock, setCurrentStock] = useState(null);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const actualUser = userData.user || userData || {};
  const canUseBackdatedImport =
    isAdmin(actualUser) ||
    isSuperAdmin(actualUser) ||
    isDivisionHead(actualUser);

  // Get store ID from multiple sources
  const getStoreContext = () => {
    try {
      // Priority 1: selectedStore from localStorage
      const selectedStore = localStorage.getItem("selectedStore");
      if (selectedStore) {
        try {
          const store = JSON.parse(selectedStore);
          if (store && store.id) {
            return {
              id: store.id,
              storeCode: store.storeCode || store.code || "",
            };
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
          return { id, storeCode: "" };
        }
      }

      // Priority 3: From user data
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      if (user?.storeId) {
        return {
          id: user.storeId,
          storeCode: user.storeCode || user?.store?.storeCode || "",
        };
      }
      if (user?.store?.id) {
        return {
          id: user.store.id,
          storeCode: user.store.storeCode || "",
        };
      }

      return { id: null, storeCode: "" };
    } catch (err) {
      console.error("Error getting store ID:", err);
      return { id: null, storeCode: "" };
    }
  };

  // Load initial data
  useEffect(() => {
    const hydrateStoreContext = () => {
      const { id, storeCode: currentStoreCode } = getStoreContext();
      if (id) {
        setStoreId(id);
        setStoreCode(currentStoreCode || "");
        loadProducts(id);
        loadStoreInventory(id);
      }
    };

    hydrateStoreContext();
    window.addEventListener("storeChanged", hydrateStoreContext);
    return () =>
      window.removeEventListener("storeChanged", hydrateStoreContext);
  }, []);

  // Load current stock when product changes
  useEffect(() => {
    if (formData.productId && storeInventory.length > 0) {
      const product = storeInventory.find(
        (item) =>
          item.productId === parseInt(formData.productId) ||
          item.product?.id === parseInt(formData.productId) ||
          item.id === parseInt(formData.productId),
      );
      if (product) {
        setCurrentStock({
          quantity: product.stockQuantity || product.quantity || 0,
          unit: product.unit || product.product?.unit || "",
        });
      } else {
        setCurrentStock({ quantity: 0, unit: "" });
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "transactionType" && value === "openingstock"
        ? { reason: prev.reason || "Opening stock for new store" }
        : {}),
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setShowErrorModal(false);
    setSuccess(null);
    setShowSuccessModal(false);

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
      const response = await storeService.manageStoreStock(storeId, {
        productId: parseInt(formData.productId),
        transactionType: formData.transactionType,
        quantity: parseFloat(formData.quantity),
        reason: formData.reason.trim(),
        recordedAt: formData.recordedAt,
      });

      const responseData = response;

      if (
        responseData.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        const ledgerDetails = responseData.data || null;
        setError(null);
        setShowErrorModal(false);
        setSuccess(
          `${formData.transactionType === "openingstock"
            ? "Opening stock saved successfully!"
            : "Stock updated successfully!"}${
            ledgerDetails
              ? `\n\nBalance at recorded time: ${Number(
                  ledgerDetails.balanceAtRecordedAt || 0,
                )} ${currentStock?.unit || "bag"}\nCurrent balance after later entries: ${Number(
                  ledgerDetails.currentBalance || 0,
                )} ${currentStock?.unit || "bag"}`
              : ""
          }`,
        );
        setShowSuccessModal(true);
        setLastLedgerResult(ledgerDetails);

        // Reset form
        setFormData({
          productId: "",
          transactionType: "stockin",
          quantity: "",
          reason: "",
          recordedAt: getCurrentDateTimeLocal(),
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
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update stock";
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(
      (p) =>
        p.id === parseInt(productId) || p.productId === parseInt(productId),
    );
    return product ? product.name || product.productName : "Unknown Product";
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
        <h5 className={styles.head}>Manage Stock</h5>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className={styles.head} style={{ margin: 0 }}>
            Manage Stock
          </h5>
          <button
            className="homebtn"
            onClick={() => navigate("/store/inventory/manage-stock/history")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              border: "1px solid var(--primary-color)",
              color: "var(--primary-color)",
              background: "#fff",
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
              <option
                key={product.id || product.productId}
                value={product.id || product.productId}
              >
                {product.name || product.productName}
              </option>
            ))}
          </select>
        </div>

        {/* Current Stock Display */}
        {formData.productId && currentStock && (
          <div className={`col-4 ${styles.longform}`}>
            <label>Current Stock :</label>
            <span
              className="ms-2"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: currentStock.quantity > 0 ? "#28a745" : "#dc3545",
              }}
            >
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
            <option value="stockin">Stock In</option>
            <option value="stockout">Stock Out</option>
            <option value="adjustment">Adjustment Reset</option>
            <option value="openingstock">Opening Stock</option>
          </select>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
            Manual stock only supports stock in, stock out, adjustment reset,
            and opening stock.
          </div>
        </div>

        <div className={`col-3 ${styles.longform}`}>
          <label>Recorded At :</label>
          <input
            type="datetime-local"
            name="recordedAt"
            value={formData.recordedAt}
            onChange={handleInputChange}
            required
          />
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
            Date format: DD/MM/YYYY HH:mm
          </div>
        </div>

        {/* Reason */}
        <div className={`col-6 ${styles.longform}`}>
          <label>Reason :</label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            placeholder={
              formData.transactionType === "openingstock"
                ? "Enter opening stock note for this store"
                : "Enter reason for this stock movement"
            }
            required
          />
        </div>
      </div>

      {lastLedgerResult && (
        <div className="row m-0 p-3">
          <div className="col-12">
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid #bfdbfe",
                background:
                  "linear-gradient(135deg, rgba(239, 246, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#2563eb",
                    }}
                  >
                    Ledger Transparency
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Stock position after this entry
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  Recorded at {formatDateTimeIN(lastLedgerResult.recordedAt || formData.recordedAt)}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    borderRadius: "14px",
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#475569" }}>
                    Balance At Recorded Time
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#0f766e",
                      marginTop: "4px",
                    }}
                  >
                    {Number(lastLedgerResult.balanceAtRecordedAt || 0)}{" "}
                    {currentStock?.unit || "bag"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Immediate balance after posting at the selected date and time.
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: "14px",
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#475569" }}>
                    Current Balance After Later Entries
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#1d4ed8",
                      marginTop: "4px",
                    }}
                  >
                    {Number(lastLedgerResult.currentBalance || 0)}{" "}
                    {currentStock?.unit || "bag"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Present stock after later transfers, sales, or resets.
                  </div>
                </div>
              </div>

              {lastLedgerResult.laterAdjustmentBoundary && (
                <div
                  style={{
                    marginTop: "14px",
                    borderRadius: "12px",
                    border: "1px solid #fed7aa",
                    background: "#fff7ed",
                    color: "#9a3412",
                    padding: "12px 14px",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  A later adjustment boundary exists on{" "}
                  <strong>
                    {formatDateTimeIN(
                      lastLedgerResult.laterAdjustmentBoundary.recordedAt,
                    )}
                  </strong>
                  . That later reset can make the current balance differ from
                  the balance at the recorded time.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit and Cancel Buttons */}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-3">
          <button
            className="submitbtn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              position: "relative",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Spinner size="sm" color="white" thickness="2px" />
                Updating...
              </span>
            ) : formData.transactionType === "openingstock" ? (
              "Save Opening Stock"
            ) : (
              "Update Stock"
            )}
          </button>
          <button
            className="cancelbtn"
            onClick={() => {
              setFormData({
                productId: "",
                transactionType: "stockin",
                quantity: "",
                reason: "",
                recordedAt: getCurrentDateTimeLocal(),
              });
              setCurrentStock(null);
              setLastLedgerResult(null);
            }}
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {canUseBackdatedImport && (
        <div className="row m-0 p-3">
          <div className="col-12">
            <StoreImportPanel
              storeCode={storeCode}
              allowMultiStore={false}
              onImportSuccess={() => loadStoreInventory(storeId)}
            />
          </div>
        </div>
      )}

      {/* Round Loading Spinner Overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Spinner size="xl" color="#003176" thickness="4px" speed="0.65s" />
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 500,
                color: "#333",
              }}
            >
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
