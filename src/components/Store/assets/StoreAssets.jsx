import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import { isStoreEmployee } from "../../../utils/roleUtils";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import Loading from "@/components/Loading";
import styles from "../../Dashboard/HomePage/HomePage.module.css";

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const initialUpdateForm = {
  assetDate: "",
  itemName: "",
  quantity: "",
  value: "",
  tax: "",
  notes: "",
};

export default function StoreAssets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const actualUser = user?.user || user || {};
  const inferredStoreId = actualUser?.storeId || actualUser?.store?.id || null;
  const isEmployee = isStoreEmployee(actualUser);

  const [storeId, setStoreId] = useState(inferredStoreId);
  const [assets, setAssets] = useState([]);
  const [allAssetsData, setAllAssetsData] = useState(null); // Persistent dummy data
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [query, setQuery] = useState({ page: 1, limit: 10 });
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [updateForm, setUpdateForm] = useState(initialUpdateForm);
  const [stockInQty, setStockInQty] = useState("");

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const showError = useCallback((message) => {
    setError(message || "Something went wrong. Please try again.");
    setIsErrorModalOpen(true);
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message || "Action completed successfully.");
    setIsSuccessModalOpen(true);
  }, []);

  useEffect(() => {
    if (!storeId) {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const storedUser = stored.user || stored;
        const fallbackId = storedUser?.storeId || storedUser?.store?.id;
        if (fallbackId) {
          setStoreId(fallbackId);
        }
      } catch (err) {
        console.error("Unable to parse stored user data", err);
      }
    }
  }, [storeId]);

  const fetchStoreAssets = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      // Initialize dummy data only once
      if (!allAssetsData) {
        const initialDummyAssets = [
          {
            id: 1,
            assetCode: "AST-001",
            assetDate: "2024-01-15",
            itemName: "Laptop Computer",
            requestedQuantity: 5,
            receivedQuantity: 3,
            value: 50000,
            tax: 9000,
            total: 59000,
            status: "pending",
            notes: "High priority item",
            store: { name: "Store 1" },
          },
          {
            id: 2,
            assetCode: "AST-002",
            assetDate: "2024-02-20",
            itemName: "Office Chair",
            requestedQuantity: 10,
            receivedQuantity: 10,
            value: 15000,
            tax: 2700,
            total: 17700,
            status: "completed",
            notes: "Ergonomic chairs",
            store: { name: "Store 1" },
          },
          {
            id: 3,
            assetCode: "AST-003",
            assetDate: "2024-03-10",
            itemName: "Printer",
            requestedQuantity: 2,
            receivedQuantity: 1,
            value: 25000,
            tax: 4500,
            total: 29500,
            status: "processing",
            notes: "Color laser printer",
            store: { name: "Store 1" },
          },
          {
            id: 4,
            assetCode: "AST-004",
            assetDate: "2024-01-25",
            itemName: "Desk Table",
            requestedQuantity: 8,
            receivedQuantity: 0,
            value: 32000,
            tax: 5760,
            total: 37760,
            status: "pending",
            notes: "Standard office desks",
            store: { name: "Store 1" },
          },
          {
            id: 5,
            assetCode: "AST-005",
            assetDate: "2024-02-05",
            itemName: "Air Conditioner",
            requestedQuantity: 3,
            receivedQuantity: 0,
            value: 80000,
            tax: 14400,
            total: 94400,
            status: "cancelled",
            notes: "1.5 ton AC units",
            store: { name: "Store 1" },
          },
        ];
        setAllAssetsData(initialDummyAssets);
      }

      // Use existing data or initialize
      const currentAssets = allAssetsData || [];

      // Filter by status
      let filtered = currentAssets;
      if (statusFilter) {
        filtered = currentAssets.filter((asset) => asset.status === statusFilter);
      }

      // Simulate pagination
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedAssets = filtered.slice(startIndex, endIndex);

      setAssets(paginatedAssets);
      setPagination({
        page: query.page,
        limit: query.limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / query.limit) || 1,
      });
    } catch (err) {
      console.error("Failed to fetch store assets", err);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storeId, query.page, query.limit, statusFilter, showError, allAssetsData]);

  useEffect(() => {
    if (storeId) {
      fetchStoreAssets();
    }
  }, [storeId, fetchStoreAssets]);

  const loadAssetDetails = useCallback(
    async (assetId, { silent = false } = {}) => {
      if (!storeId || !assetId) return;
      if (!silent) {
        setDetailLoading(true);
      }
      try {
        // Use persistent dummy data
        const currentAssets = allAssetsData || [];
        const data = currentAssets.find((a) => a.id === Number(assetId)) || {};
        if (data.id) {
          setSelectedAsset(data);
          setUpdateForm({
            assetDate: data.assetDate ? data.assetDate.split("T")[0] : "",
            itemName: data.itemName || "",
            quantity: (data.quantity ?? data.requestedQuantity ?? "").toString(),
            value: (data.value ?? "").toString(),
            tax: (data.tax ?? "").toString(),
            notes: data.notes || "",
          });
          setStockInQty("");
        } else {
          throw new Error("Asset not found.");
        }
      } catch (err) {
        console.error("Failed to load asset details", err);
        showError(err.message);
      } finally {
        if (!silent) {
          setDetailLoading(false);
        }
      }
    },
    [storeId, showError, allAssetsData]
  );

  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    const needle = searchTerm.toLowerCase();
    return assets.filter((asset) => {
      const code = asset.assetCode?.toLowerCase() || "";
      const name = asset.itemName?.toLowerCase() || "";
      return code.includes(needle) || name.includes(needle);
    });
  }, [assets, searchTerm]);

  const totalValue = useMemo(
    () => filteredAssets.reduce((sum, asset) => sum + Number(asset.total ?? asset.value ?? 0), 0),
    [filteredAssets]
  );

  const maxReceivable = useMemo(() => {
    if (!selectedAsset) return 0;
    const requested = Number(selectedAsset.requestedQuantity || selectedAsset.quantity || 0);
    const received = Number(selectedAsset.receivedQuantity || 0);
    return Math.max(requested - received, 0);
  }, [selectedAsset]);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setQuery((prev) => ({ ...prev, page: 1 }));
  };

  const handleLimitChange = (value) => {
    setQuery((prev) => ({ ...prev, limit: Number(value) || 10, page: 1 }));
  };

  const handlePageChange = (direction) => {
    setQuery((prev) => {
      const totalPages = pagination.totalPages || 1;
      const nextPage = direction === "next" ? prev.page + 1 : prev.page - 1;
      if (nextPage < 1 || nextPage > totalPages) {
        return prev;
      }
      return { ...prev, page: nextPage };
    });
  };

  const handleUpdateInputChange = (field, value) => {
    setUpdateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectAsset = (assetId) => {
    loadAssetDetails(assetId);
  };

  const handleUpdateAsset = async (event) => {
    event.preventDefault();
    if (!selectedAsset) return;
    if (selectedAsset.status !== "pending") {
      showError("Only assets in pending status can be updated.");
      return;
    }

    setActionLoading(true);
    try {
      // Update persistent dummy data
      const updatedAsset = {
        ...selectedAsset,
        assetDate: updateForm.assetDate,
        itemName: updateForm.itemName,
        requestedQuantity: Number(updateForm.quantity || 0),
        quantity: Number(updateForm.quantity || 0),
        value: Number(updateForm.value || 0),
        tax: Number(updateForm.tax || 0),
        total: Number(updateForm.value || 0) + Number(updateForm.tax || 0),
        notes: updateForm.notes || "",
      };

      // Update in persistent data
      setAllAssetsData((prev) => {
        if (!prev) return prev;
        return prev.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset));
      });
      
      setSelectedAsset(updatedAsset);
      showSuccess("Asset updated successfully.");
        await fetchStoreAssets();
    } catch (err) {
      console.error("Failed to update asset", err);
      showError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockIn = async (event) => {
    event.preventDefault();
    if (!selectedAsset) return;

    const qty = Number(stockInQty || 0);
    if (!qty) {
      showError("Enter the received quantity to continue.");
      return;
    }
    if (qty > maxReceivable) {
      showError(`You can receive a maximum of ${maxReceivable} units.`);
      return;
    }

    setActionLoading(true);
    try {
      // Update persistent dummy data
      const newReceivedQty = (selectedAsset.receivedQuantity || 0) + qty;
      const updatedAsset = {
        ...selectedAsset,
        receivedQuantity: newReceivedQty,
        status: newReceivedQty >= selectedAsset.requestedQuantity ? "completed" : "processing",
      };
      
      // Update in persistent data
      setAllAssetsData((prev) => {
        if (!prev) return prev;
        return prev.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset));
      });
      
      setSelectedAsset(updatedAsset);
      showSuccess("Stock in processed successfully.");
        setStockInQty("");
        await fetchStoreAssets();
    } catch (err) {
      console.error("Failed to process stock in", err);
      showError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset || selectedAsset.status !== "pending") {
      showError("Only pending assets can be deleted.");
      return;
    }
    const confirmDelete = window.confirm(`Delete asset ${selectedAsset.assetCode}? This action cannot be undone.`);
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      // Update persistent dummy data
      setAllAssetsData((prev) => {
        if (!prev) return prev;
        return prev.filter((asset) => asset.id !== selectedAsset.id);
      });
      
        setSelectedAsset(null);
        setUpdateForm(initialUpdateForm);
        setStockInQty("");
      showSuccess("Asset deleted successfully.");
        await fetchStoreAssets();
    } catch (err) {
      console.error("Failed to delete asset", err);
      showError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const closeErrorModal = () => setIsErrorModalOpen(false);
  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2
            style={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "28px",
              color: "var(--primary-color)",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            Store Assets
          </h2>
          <p className="path">
            <span onClick={() => navigate("/store")}>Store Home</span> <i className="bi bi-chevron-right"></i> Assets
          </p>
        </div>
        {!isEmployee && (
          <button className="homebtn" onClick={() => navigate("/store/assets/transfer")} style={{ fontFamily: "Poppins" }}>
            Asset Transfer
          </button>
        )}
      </div>

      {!storeId && (
        <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, fontFamily: "Poppins" }}>Store details are missing. Please re-login to continue.</p>
        </div>
      )}

      {storeId && (
        <>
          <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: "Poppins", fontWeight: 600, fontSize: "20px", color: "var(--primary-color)" }}>
                  Asset Summary
                </h4>
                <p style={{ margin: 0, fontFamily: "Poppins", color: "#6b7280" }}>
                  Showing page {pagination.page} of {pagination.totalPages || 1}
                </p>
              </div>
              <p style={{ fontFamily: "Poppins", margin: 0, color: "#059669", fontWeight: 600 }}>
                Total Value (page): {formatCurrency(totalValue)}
              </p>
            </div>

            <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <div>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Rows per page</label>
                <select value={query.limit} onChange={(e) => handleLimitChange(e.target.value)}>
                  {[10, 25, 50].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search by name or code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                <button className="homebtn" type="button" onClick={fetchStoreAssets} disabled={loading}>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className={styles.orderStatusCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <h4
                style={{
                  margin: 0,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "var(--primary-color)",
                }}
              >
                Asset Register ({filteredAssets.length})
              </h4>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button className="cancelbtn" type="button" onClick={() => handlePageChange("prev")} disabled={query.page <= 1}>
                  Prev
                </button>
                <span style={{ fontFamily: "Poppins" }}>
                  Page {pagination.page} / {pagination.totalPages || 1}
                </span>
                <button
                  className="homebtn"
                  type="button"
                  onClick={() => handlePageChange("next")}
                  disabled={pagination.totalPages <= pagination.page}
                >
                  Next
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto", marginTop: "16px" }}>
              <table className="table table-bordered borderedtable table-sm" style={{ fontFamily: "Poppins" }}>
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Asset Code</th>
                    <th>Date</th>
                    <th>Item Name</th>
                    <th>Requested</th>
                    <th>Received</th>
                    <th>Value (₹)</th>
                    <th>Tax (₹)</th>
                    <th>Total (₹)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: "center", padding: "32px", color: "#666" }}>
                        {loading ? "Loading assets..." : "No assets found"}
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset, index) => (
                      <tr key={asset.id} style={{ background: index % 2 === 0 ? "rgba(59, 130, 246, 0.03)" : "transparent" }}>
                        <td>{index + 1}</td>
                        <td>{asset.assetCode || "-"}</td>
                        <td>{asset.assetDate ? new Date(asset.assetDate).toLocaleDateString("en-IN") : "-"}</td>
                        <td style={{ fontWeight: 600 }}>{asset.itemName || "-"}</td>
                        <td>{asset.requestedQuantity ?? asset.quantity ?? "-"}</td>
                        <td>{asset.receivedQuantity ?? "-"}</td>
                        <td>{formatCurrency(asset.value)}</td>
                        <td>{formatCurrency(asset.tax)}</td>
                        <td>{formatCurrency(asset.total)}</td>
                        <td>
                          <span
                            className={`badge ${
                              asset.status === "completed"
                                ? "bg-success"
                                : asset.status === "pending"
                                ? "bg-warning text-dark"
                                : asset.status === "cancelled"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {asset.status || "-"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <button className="homebtn" style={{ fontSize: "11px" }} type="button" onClick={() => handleSelectAsset(asset.id)}>
                              View Details
                            </button>
                            {!isEmployee && asset.status === "pending" && (
                              <>
                                <button className="homebtn" style={{ fontSize: "11px" }} type="button" onClick={() => handleSelectAsset(asset.id)}>
                                  Edit
                                </button>
                                <button className="cancelbtn" style={{ fontSize: "11px" }} type="button" onClick={() => handleSelectAsset(asset.id)}>
                                  Stock In
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedAsset && (
            <div className={styles.orderStatusCard} style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ margin: 0, fontFamily: "Poppins", fontWeight: 600, fontSize: "20px", color: "var(--primary-color)" }}>
                    Asset Details
                  </h4>
                  <p style={{ margin: 0, fontFamily: "Poppins", color: "#6b7280" }}>
                    {selectedAsset.assetCode} &middot; Status: {selectedAsset.status}
                  </p>
                </div>
                {!isEmployee && selectedAsset.status === "pending" && (
                  <button className="cancelbtn" type="button" onClick={handleDeleteAsset} disabled={actionLoading}>
                    Delete Asset
                  </button>
                )}
              </div>

              {detailLoading ? (
                <p style={{ marginTop: "16px", fontFamily: "Poppins" }}>Loading details...</p>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "16px" }}>
                    <div>
                      <label>Store</label>
                      <p style={{ fontFamily: "Poppins", fontWeight: 600 }}>{selectedAsset.store?.name || "-"}</p>
                    </div>
                    <div>
                      <label>Requested vs Received</label>
                      <p style={{ fontFamily: "Poppins", fontWeight: 600 }}>
                        {selectedAsset.requestedQuantity ?? selectedAsset.quantity ?? 0} / {selectedAsset.receivedQuantity ?? 0}
                      </p>
                    </div>
                    <div>
                      <label>Total Value</label>
                      <p style={{ fontFamily: "Poppins", fontWeight: 600 }}>{formatCurrency(selectedAsset.total)}</p>
                    </div>
                  </div>

                  {!isEmployee && (
                    <div style={{ marginTop: "24px", display: "grid", gap: "24px" }}>
                      <form onSubmit={handleUpdateAsset}>
                        <h5 style={{ fontFamily: "Poppins", fontWeight: 600 }}>Update Asset</h5>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                          <div>
                            <label>Date</label>
                            <input type="date" value={updateForm.assetDate} onChange={(e) => handleUpdateInputChange("assetDate", e.target.value)} required />
                          </div>
                          <div>
                            <label>Item Name</label>
                            <input type="text" value={updateForm.itemName} onChange={(e) => handleUpdateInputChange("itemName", e.target.value)} required />
                          </div>
                          <div>
                            <label>Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={updateForm.quantity}
                              onChange={(e) => handleUpdateInputChange("quantity", e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label>Value (₹)</label>
                            <input type="number" min="0" value={updateForm.value} onChange={(e) => handleUpdateInputChange("value", e.target.value)} required />
                          </div>
                          <div>
                            <label>Tax (₹)</label>
                            <input type="number" min="0" value={updateForm.tax} onChange={(e) => handleUpdateInputChange("tax", e.target.value)} />
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label>Notes</label>
                            <textarea rows="2" value={updateForm.notes} onChange={(e) => handleUpdateInputChange("notes", e.target.value)} />
                          </div>
                        </div>
                        <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
                          <button className="homebtn" type="submit" disabled={actionLoading || selectedAsset.status !== "pending"}>
                            Save Changes
                          </button>
                        </div>
                      </form>

                      <form onSubmit={handleStockIn}>
                        <h5 style={{ fontFamily: "Poppins", fontWeight: 600 }}>Process Stock In</h5>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                          <div style={{ flex: "1 1 200px" }}>
                            <label>Received Quantity</label>
                            <input
                              type="number"
                              min="1"
                              max={maxReceivable || undefined}
                              value={stockInQty}
                              onChange={(e) => setStockInQty(e.target.value)}
                              required
                            />
                            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                              Remaining receivable: {maxReceivable} units
                            </p>
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button className="homebtn" type="submit" disabled={actionLoading || maxReceivable === 0}>
                              Stock In
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {(loading || detailLoading || actionLoading) && <Loading />}
      <ErrorModal isOpen={isErrorModalOpen} message={error} onClose={closeErrorModal} />
      <SuccessModal isOpen={isSuccessModalOpen} message={successMessage} onClose={closeSuccessModal} />
    </div>
  );
}