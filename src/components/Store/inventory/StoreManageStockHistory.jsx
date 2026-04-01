import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import storeService from "../../../services/storeService";
import styles from "../../Dashboard/Customers/Customer.module.css";
import { Spinner } from "@chakra-ui/react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

const sourceTone = {
  "Excel Import": { bg: "#dbeafe", color: "#1d4ed8" },
  "Opening Stock": { bg: "#fef3c7", color: "#b45309" },
  "Manual Adjustment": { bg: "#fde2e8", color: "#be123c" },
  "Manual Stock In": { bg: "#dcfce7", color: "#166534" },
  "Manual Stock Out": { bg: "#fee2e2", color: "#b91c1c" },
};

const actionTone = {
  stockin: { bg: "#dcfce7", color: "#166534", label: "Added" },
  inward: { bg: "#dcfce7", color: "#166534", label: "Added" },
  stockout: { bg: "#fee2e2", color: "#b91c1c", label: "Removed" },
  outward: { bg: "#fee2e2", color: "#b91c1c", label: "Removed" },
  adjustment: { bg: "#fef3c7", color: "#b45309", label: "Reset" },
};

const StoreManageStockHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    try {
      let id = null;
      const selectedStore = localStorage.getItem("selectedStore");
      if (selectedStore) {
        const store = JSON.parse(selectedStore);
        id = store.id;
      }

      if (!id) {
        const currentStoreId = localStorage.getItem("currentStoreId");
        id = currentStoreId ? parseInt(currentStoreId, 10) : null;
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
      fetchHistory(page);
    }
  }, [storeId, page]);

  const fetchHistory = async (nextPage = 1) => {
    setLoading(true);
    try {
      const res = await storeService.getManageStockHistory(storeId, {
        page: nextPage,
        limit,
      });
      if (res.success) {
        setHistory(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        setError(res.message || "Failed to fetch history");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "An error occurred while fetching history",
      );
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    return history.reduce(
      (acc, item) => {
        const type = String(item.transactionType || "").toLowerCase();
        if (type === "adjustment") acc.resets += 1;
        else if (type === "stockin" || type === "inward") acc.added += Number(item.quantity || 0);
        else if (type === "stockout" || type === "outward") acc.removed += Number(item.quantity || 0);
        if (item.sourceLabel === "Excel Import") acc.importRows += 1;
        return acc;
      },
      { added: 0, removed: 0, resets: 0, importRows: 0 },
    );
  }, [history]);

  const visibleStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const visibleEnd = Math.min(page * limit, total);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
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
          Stock History
        </h2>
        <p className="path">
          <span onClick={() => navigate("/store/inventory")}>Inventory</span>{" "}
          <i className="bi bi-chevron-right"></i>{" "}
          <span onClick={() => navigate("/store/inventory/manage-stock")}>
            Manage Stock
          </span>{" "}
          <i className="bi bi-chevron-right"></i> History
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        {[
          { label: "Visible Rows", value: history.length, tone: "#1d4ed8" },
          { label: "Imported Rows", value: summary.importRows, tone: "#7c3aed" },
          { label: "Added Bags", value: summary.added.toFixed(2), tone: "#166534" },
          { label: "Removed Bags", value: summary.removed.toFixed(2), tone: "#b91c1c" },
          { label: "Reset Entries", value: summary.resets, tone: "#b45309" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "14px 16px",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "Poppins" }}>
              {card.label}
            </div>
            <div
              style={{
                marginTop: "6px",
                fontFamily: "Poppins",
                fontSize: "24px",
                fontWeight: 700,
                color: card.tone,
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.orderStatusCard}>
        {error && (
          <div className="alert alert-danger" style={{ fontFamily: "Poppins" }}>
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table
            className="table table-bordered borderedtable"
            style={{ fontFamily: "Poppins" }}
          >
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Source</th>
                <th>Action</th>
                <th>Qty</th>
                <th>Reference</th>
                <th>Updated By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center" style={{ padding: "20px" }}>
                    <Spinner size="md" color="var(--primary-color)" /> Loading...
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map((item) => {
                  const action = actionTone[String(item.transactionType || "").toLowerCase()] || {
                    bg: "#e5e7eb",
                    color: "#374151",
                    label: item.transactionType || "-",
                  };
                  const source = sourceTone[item.sourceLabel] || {
                    bg: "#e0f2fe",
                    color: "#075985",
                  };

                  return (
                    <tr key={item.id}>
                      <td style={{ fontSize: "13px", minWidth: "150px" }}>
                        {item.date ? new Date(item.date).toLocaleString() : "-"}
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        <div style={{ fontWeight: 600 }}>{item.productName || "-"}</div>
                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                          SKU: {item.productSKU || "-"}
                        </div>
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            background: source.bg,
                            color: source.color,
                            fontWeight: 600,
                          }}
                        >
                          {item.sourceLabel || "Manual Entry"}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            background: action.bg,
                            color: action.color,
                            fontWeight: 600,
                          }}
                        >
                          {action.label}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", fontWeight: 700 }}>
                        {Number(item.quantity || 0).toFixed(2)} {item.unit || "bag"}
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        <div style={{ fontWeight: 600 }}>{item.referenceId || "-"}</div>
                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                          {item.referenceType || "Direct"}
                        </div>
                      </td>
                      <td style={{ fontSize: "13px" }}>{item.performedBy || "-"}</td>
                      <td style={{ fontSize: "13px", color: "#475569" }}>
                        {item.reason || "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center" style={{ padding: "20px", color: "#666" }}>
                    No history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
            }}
          >
            <div style={{ fontFamily: "Poppins", color: "#666", fontSize: "14px" }}>
              Showing {visibleStart} to {visibleEnd} of {total} entries
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
              >
                <FaArrowLeftLong />
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || loading}
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
