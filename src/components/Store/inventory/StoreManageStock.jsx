import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import * as XLSX from "xlsx";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import storeService from "@/services/storeService";
import { isAdmin, isSuperAdmin } from "@/utils/roleUtils";
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
  
  // Store ID
  const [storeId, setStoreId] = useState(null);
  const [storeCode, setStoreCode] = useState("");
  
  // Form data
  const [formData, setFormData] = useState({
    productId: '',
    transactionType: 'stockin',
    quantity: '',
    reason: '',
    recordedAt: new Date().toISOString().slice(0, 16),
  });
  
  // Data arrays
  const [products, setProducts] = useState([]);
  const [storeInventory, setStoreInventory] = useState([]);
  const [currentStock, setCurrentStock] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importPreviewCount, setImportPreviewCount] = useState(0);
  const [importType, setImportType] = useState("ledger_rows");
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [pendingImportRows, setPendingImportRows] = useState([]);
  const [pendingImportFileName, setPendingImportFileName] = useState("");

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const actualUser = userData.user || userData || {};
  const canUseBackdatedImport =
    isAdmin(actualUser) || isSuperAdmin(actualUser);

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
    return () => window.removeEventListener("storeChanged", hydrateStoreContext);
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
      const response = await storeService.manageStoreStock(storeId, {
        productId: parseInt(formData.productId),
        transactionType: formData.transactionType,
        quantity: parseFloat(formData.quantity),
        reason: formData.reason.trim(),
        recordedAt: formData.recordedAt,
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
          reason: '',
          recordedAt: new Date().toISOString().slice(0, 16),
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

  const downloadExcelTemplate = () => {
    const isInvoiceTemplate = importType === "store_invoices";
    const rowsSheet = XLSX.utils.json_to_sheet(
      isInvoiceTemplate
        ? [
            {
              invoiceNumber: "STORE-INV-IMPORT-001",
              storeCode: storeCode || "",
              recordedAt: "2026-03-05T10:30",
              customerName: "Ramesh Patel",
              customerMobile: "9876543210",
              farmerName: "Ramesh Patel",
              village: "Anand",
              paymentMethod: "cash",
              paymentAmount: 35400,
              transactionNumber: "",
              notes: "Imported backdated store invoice",
              productSku: "",
              quantity: 20,
              unitPrice: 1500,
              discountAmount: 0,
              taxAmount: 2400,
              finalAmount: 32400,
            },
            {
              invoiceNumber: "STORE-INV-IMPORT-001",
              storeCode: storeCode || "",
              recordedAt: "2026-03-05T10:30",
              customerName: "Ramesh Patel",
              customerMobile: "9876543210",
              farmerName: "Ramesh Patel",
              village: "Anand",
              paymentMethod: "cash",
              paymentAmount: 35400,
              transactionNumber: "",
              notes: "Imported backdated store invoice",
              productSku: "",
              quantity: 2,
              unitPrice: 1500,
              discountAmount: 0,
              taxAmount: 360,
              finalAmount: 3360,
            },
          ]
        : [
            {
              storeCode: storeCode || "",
              productSku: "",
              transactionType: "adjustment",
              quantity: 120,
              recordedAt: "2026-03-01T09:00",
              referenceId: "OPENING-2026-03-01",
              remarks: "Opening stock reset",
              unitPrice: 0,
              totalPrice: 0,
            },
            {
              storeCode: storeCode || "",
              productSku: "",
              transactionType: "stockin",
              quantity: 25,
              recordedAt: "2026-03-02T11:30",
              referenceId: "IMPORT-ROW-2",
              remarks: "Backdated warehouse receipt",
              unitPrice: 1450,
              totalPrice: 36250,
            },
          ],
    );

    const instructionsSheet = XLSX.utils.aoa_to_sheet(
      isInvoiceTemplate
        ? [
            ["Required Excel Format - Store Invoices"],
            ["Column", "Required", "Notes"],
            ["invoiceNumber", "Yes", "Use the same invoiceNumber on every item row of the invoice"],
            ["storeCode", "Yes", "Use the store code visible in the selected store screen"],
            ["recordedAt", "Yes", "Use YYYY-MM-DDTHH:mm for backdated posting"],
            ["customerName", "Optional", "Customer display name"],
            ["customerMobile", "Optional", "Used to match/create customer"],
            ["farmerName", "Optional", "Used to match/create customer"],
            ["village", "Optional", "Customer village"],
            ["paymentMethod", "Optional", "cash or bank"],
            ["paymentAmount", "Optional", "If blank, backend uses invoice grand total"],
            ["transactionNumber", "Optional", "UTR/reference for bank payment"],
            ["notes", "Optional", "Sale note"],
            ["productSku", "Yes", "Product SKU code, not internal product id"],
            ["quantity", "Yes", "Positive bag quantity only"],
            ["unitPrice", "Yes", "Numeric per-bag rate"],
            ["discountAmount", "Optional", "Numeric discount per row"],
            ["taxAmount", "Optional", "Numeric tax per row"],
            ["finalAmount", "Optional", "If blank, backend derives from row totals"],
            ["Rule", "", "One row = one invoice item. Repeat invoice/customer columns for each row."],
            ["Rule", "", "No PDF upload is supported. Excel data only."],
          ]
        : [
            ["Required Excel Format - Ledger Rows"],
            ["Column", "Required", "Notes"],
            ["storeCode", "Yes", "Use the store code visible in the selected store screen"],
            ["productSku", "Yes", "Product SKU code, not internal product id"],
            ["transactionType", "Yes", "Use inward, outward, stockin, stockout, or adjustment"],
            ["quantity", "Yes", "Positive bag quantity only"],
            ["recordedAt", "Yes", "Use YYYY-MM-DDTHH:mm for backdated posting"],
            ["referenceId", "Optional", "Unique row reference for idempotent imports"],
            ["remarks", "Optional", "User-facing note for audit"],
            ["unitPrice", "Optional", "Numeric price per bag"],
            ["totalPrice", "Optional", "Numeric total value"],
            ["Rule", "", "Do not use kg anywhere. quantity is always bags."],
            ["Rule", "", "adjustment resets stock to the absolute quantity value."],
            ["Rule", "", "No PDF upload is supported. Excel data only."],
          ],
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, rowsSheet, "LedgerRows");
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
    XLSX.writeFile(
      workbook,
      isInvoiceTemplate
        ? "store_invoice_import_template.xlsx"
        : "store_ledger_import_template.xlsx",
    );
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!storeId) {
      setError("Select a store before importing ledger rows.");
      setShowErrorModal(true);
      return;
    }

    try {
      setImporting(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (!rawRows.length) {
        throw new Error("The uploaded file does not contain any data rows.");
      }

      const normalizedRows = rawRows.map((row, index) => {
        if (importType === "store_invoices") {
          const invoiceNumber = String(row.invoiceNumber || "").trim();
          const productSku = String(
            row.productSku || row.productSKU || row.sku || row.SKU || "",
          ).trim();
          const quantity = Number(row.quantity);
          const rowRecordedAt = String(row.recordedAt || "").trim();
          const rowStoreCode = String(row.storeCode || storeCode || "").trim();

          if (!invoiceNumber) {
            throw new Error(`Row ${index + 2}: invoiceNumber is required.`);
          }
          if (!productSku) {
            throw new Error(`Row ${index + 2}: productSku is required.`);
          }
          if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(`Row ${index + 2}: quantity must be a positive bag value.`);
          }
          if (!rowRecordedAt) {
            throw new Error(`Row ${index + 2}: recordedAt is required.`);
          }
          if (!rowStoreCode) {
            throw new Error(`Row ${index + 2}: storeCode is required.`);
          }

          return {
            invoiceNumber,
            storeCode: rowStoreCode,
            recordedAt: rowRecordedAt,
            customerName: String(row.customerName || "").trim(),
            customerMobile: String(row.customerMobile || "").trim(),
            farmerName: String(row.farmerName || "").trim(),
            village: String(row.village || "").trim(),
            paymentMethod: String(row.paymentMethod || "cash").trim().toLowerCase(),
            paymentAmount: Number(row.paymentAmount || 0),
            transactionNumber: String(row.transactionNumber || "").trim(),
            notes: String(row.notes || "").trim(),
            productSku,
            quantity,
            unitPrice: Number(row.unitPrice || 0),
            discountAmount: Number(row.discountAmount || 0),
            taxAmount: Number(row.taxAmount || 0),
            finalAmount: Number(row.finalAmount || 0),
          };
        }

        const transactionType = String(row.transactionType || "").trim().toLowerCase();
        const quantity = Number(row.quantity);
        const productSku = String(
          row.productSku || row.productSKU || row.sku || row.SKU || "",
        ).trim();
        const rowRecordedAt = String(row.recordedAt || "").trim();
        const rowStoreCode = String(row.storeCode || storeCode || "").trim();

        if (!productSku) {
          throw new Error(`Row ${index + 2}: productSku is required.`);
        }
        if (!["inward", "outward", "stockin", "stockout", "adjustment"].includes(transactionType)) {
          throw new Error(`Row ${index + 2}: invalid transactionType.`);
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error(`Row ${index + 2}: quantity must be a positive bag value.`);
        }
        if (!rowRecordedAt) {
          throw new Error(`Row ${index + 2}: recordedAt is required.`);
        }
        if (!rowStoreCode) {
          throw new Error(`Row ${index + 2}: storeCode is required.`);
        }

        return {
          storeCode: rowStoreCode,
          productSku,
          transactionType,
          quantity,
          recordedAt: rowRecordedAt,
          referenceId: String(row.referenceId || `excel-${Date.now()}-${index}`),
          remarks: String(row.remarks || "").trim() || null,
          unitPrice: Number(row.unitPrice || 0),
          totalPrice: Number(row.totalPrice || 0),
        };
      });

      setImportPreviewCount(normalizedRows.length);
      setPendingImportRows(normalizedRows);
      setPendingImportFileName(file.name || "import.xlsx");
      setShowImportPreview(true);
    } catch (err) {
      console.error("Error importing excel ledger rows:", err);
      setError(err.message || "Failed to import excel ledger rows.");
      setShowErrorModal(true);
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const handleCancelImportPreview = () => {
    setShowImportPreview(false);
    setPendingImportRows([]);
    setPendingImportFileName("");
    setImportPreviewCount(0);
  };

  const handleConfirmImport = async () => {
    if (!pendingImportRows.length) return;

    try {
      setImporting(true);
      const response = await storeService.importStoreLedgerRows({
        rows: pendingImportRows,
        referenceType: "ExcelLedgerImport",
        importType,
      });

      if (!response.success) {
        throw new Error(response.message || "Import failed.");
      }

      setSuccess(
        importType === "store_invoices"
          ? `Imported ${pendingImportRows.length} excel invoice row(s) successfully.`
          : `Imported ${pendingImportRows.length} backdated ledger row(s) successfully.`,
      );
      setShowSuccessModal(true);
      setShowImportPreview(false);
      setPendingImportRows([]);
      setPendingImportFileName("");
      await loadStoreInventory(storeId);
    } catch (err) {
      console.error("Error confirming excel import:", err);
      const errorData = err.response?.data || {};
      const errorDetails = errorData.errorDetails || {};
      const detailedErrorMessage =
        errorDetails && errorDetails.productId
          ? [
              errorData.message || err.message || "Failed to import excel ledger rows.",
              `Product: ${errorDetails.productId}`,
              errorDetails.productSku ? `Product SKU: ${errorDetails.productSku}` : "",
              errorDetails.referenceId ? `Reference: ${errorDetails.referenceId}` : "",
              errorDetails.recordedAt ? `Recorded At: ${errorDetails.recordedAt}` : "",
              Number.isFinite(errorDetails.runningBalance)
                ? `Running Balance After Entry: ${errorDetails.runningBalance}`
                : "",
            ]
              .filter(Boolean)
              .join("\n")
          : err.message || "Failed to import excel ledger rows.";

      setError(detailedErrorMessage);
      setShowErrorModal(true);
    } finally {
      setImporting(false);
    }
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
            <option value="stockin">Stock In</option>
            <option value="stockout">Stock Out</option>
            <option value="inward">Inward</option>
            <option value="outward">Outward</option>
            <option value="adjustment">Adjustment Reset</option>
          </select>
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
                reason: '',
                recordedAt: new Date().toISOString().slice(0, 16),
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

      {canUseBackdatedImport && (
      <div className="row m-0 p-3">
        <div className={`col-12 ${styles.longform}`} style={{ background: "#fff", borderRadius: "10px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <h6 style={{ marginBottom: "6px" }}>Backdated Excel Import</h6>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Upload structured Excel data only. No PDF upload is supported. Choose the template type, format your sheet exactly like that template, then upload the workbook.
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                {importType === "store_invoices"
                  ? "Format: invoiceNumber, storeCode, recordedAt, customerName, customerMobile, farmerName, village, paymentMethod, paymentAmount, transactionNumber, notes, productSku, quantity, unitPrice, discountAmount, taxAmount, finalAmount"
                  : "Format: storeCode, productSku, transactionType, quantity, recordedAt, referenceId, remarks, unitPrice, totalPrice"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value)}
                style={{ minWidth: "180px", padding: "8px" }}
              >
                <option value="ledger_rows">Ledger Rows Template</option>
                <option value="store_invoices">Store Invoices Template</option>
              </select>
              <button className="homebtn" onClick={downloadExcelTemplate}>
                Download Template
              </button>
              <label className="submitbtn" style={{ margin: 0, cursor: importing ? "not-allowed" : "pointer", opacity: importing ? 0.7 : 1 }}>
                {importing ? "Preparing Preview..." : "Upload Excel"}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportFile}
                  disabled={importing}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
          {importPreviewCount > 0 && (
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#0f172a" }}>
              Last parsed import batch: {importPreviewCount} row(s)
            </div>
          )}
        </div>
      </div>
      )}

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

      {showImportPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "min(1100px, 100%)",
              maxHeight: "85vh",
              borderRadius: "12px",
              padding: "18px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
              <div>
                <h5 style={{ margin: 0 }}>Import Preview</h5>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  File: {pendingImportFileName} | Type: {importType} | Rows: {pendingImportRows.length}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  Review the parsed Excel data below. Import will be sent to backend only after you click Import.
                </div>
              </div>
            </div>

            <div style={{ overflow: "auto", maxHeight: "58vh", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <table className="table" style={{ marginBottom: 0, fontSize: "12px" }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8fafc" }}>
                  <tr>
                    {Object.keys(pendingImportRows[0] || {}).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingImportRows.map((row, index) => (
                    <tr key={`${index}-${row.referenceId || row.invoiceNumber || "row"}`}>
                      {Object.keys(pendingImportRows[0] || {}).map((key) => (
                        <td key={key}>{String(row[key] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                className="cancelbtn"
                onClick={handleCancelImportPreview}
                disabled={importing}
              >
                Cancel
              </button>
              <button
                className="submitbtn"
                onClick={handleConfirmImport}
                disabled={importing}
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
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

