import React, { useEffect, useState, useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";

// ========================================
// STYLES - Modify these to change the design
// ========================================
const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },

  errorAlert: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
    color: "#c33",
  },

  buttonContainer: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "32px",
  },

  button: {
    minWidth: "160px",
    height: "36px",
    padding: "3px 15px",
    margin: "10px 25px",
    border: "1px solid var(--primary-color)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "26.82px",
    textAlign: "center",
    background: "transparent",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    cursor: "pointer",
    transition: "0.25s ease",
  },

  buttonHover: {
    background: "var(--primary-hover-opacity)",
    color: "var(--primary-color)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 8px #00000040",
  },

  buttonActive: {
    background: "var(--primary-active-opacity)",
    color: "var(--primary-color)",
  },

  cardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "32px",
  },

  card: {
    flex: "1 1 300px",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease",
  },

  cardTitle: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "8px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  cardValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2a4d9b",
  },

  cardValueRed: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#dc3545",
  },

  cardValueYellow: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#ffc107",
  },

  storeInventorySection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2a4d9b",
    marginBottom: "20px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "12px",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statBox: {
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
  },

  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "8px",
    fontWeight: "500",
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2a4d9b",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
  },

  tableHeader: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },

  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
    color: "#495057",
  },

  storeBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },

  ownBadge: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },

  franchiseBadge: {
    backgroundColor: "#d1ecf1",
    color: "#0c5460",
  },

  stockQtyHigh: {
    fontWeight: "600",
    color: "#28a745",
  },

  stockQtyMedium: {
    fontWeight: "600",
    color: "#ffc107",
  },

  stockQtyLow: {
    fontWeight: "600",
    color: "#dc3545",
  },

  chartsContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
};

function InventoryHome({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInventoryDashboard() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/dashboard/inventory");
        console.log("Inventory Dashboard Response:", res.data);
        setInventoryData(res.data);
      } catch (err) {
        console.error("Inventory dashboard fetch error:", err);
        setError(
          err?.response?.data?.message || "Failed to load inventory dashboard",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchInventoryDashboard();
  }, []);

  // Transform backend arrays for Chart.js
  const trendData = useMemo(() => {
    if (
      !inventoryData?.stockLevelTrend ||
      !Array.isArray(inventoryData.stockLevelTrend)
    ) {
      return {
        labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
        datasets: [
          {
            label: "Stock Level",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(42,77,155,0.1)",
            borderColor: "#2a4d9b",
            fill: true,
            tension: 0.3,
          },
        ],
      };
    }

    const labels = inventoryData.stockLevelTrend.map(
      (item) => item.month || item.label || item.date || "",
    );
    const data = inventoryData.stockLevelTrend.map((item) => {
      const value = item.value ?? item.stock ?? 0;
      return Number(value); // Ensure it's a number
    });

    return {
      labels,
      datasets: [
        {
          label: "Stock Level",
          data,
          backgroundColor: "rgba(42,77,155,0.1)",
          borderColor: "#2a4d9b",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [inventoryData?.stockLevelTrend]);

  const warehouseData = useMemo(() => {
    if (
      !inventoryData?.stockByWarehouse ||
      !Array.isArray(inventoryData.stockByWarehouse) ||
      inventoryData.stockByWarehouse.length === 0
    ) {
      return {
        labels: ["No Warehouses"],
        datasets: [
          {
            label: "Stock",
            data: [0],
            backgroundColor: ["#e0e0e0"],
          },
        ],
      };
    }

    const labels = inventoryData.stockByWarehouse.map(
      (item) => item.warehouse || item.label || "",
    );
    const data = inventoryData.stockByWarehouse.map((item) => {
      const value = item.stock ?? 0;
      return Number(value); // Ensure it's a number
    });

    return {
      labels,
      datasets: [
        {
          label: "Stock",
          data,
          backgroundColor: [
            "#4e73df",
            "#1cc88a",
            "#36b9cc",
            "#f6c23e",
            "#e74a3b",
            "#858796",
            "#ff6384",
            "#36a2eb",
            "#cc65fe",
            "#ffce56",
          ],
        },
      ],
    };
  }, [inventoryData?.stockByWarehouse]);

  // Get top 10 stores by stock quantity
  const topStores = useMemo(() => {
    if (!inventoryData?.storeInventory?.stores) return [];
    return [...inventoryData.storeInventory.stores]
      .sort((a, b) => b.stockQty - a.stockQty)
      .slice(0, 10);
  }, [inventoryData?.storeInventory?.stores]);

  const getStockQtyStyle = (qty) => {
    if (qty > 50) return styles.stockQtyHigh;
    if (qty > 20) return styles.stockQtyMedium;
    return styles.stockQtyLow;
  };

  return (
    <div style={styles.container}>
      {/* Error Display */}
      {error && (
        <div style={styles.errorAlert}>
          <strong>Error loading inventory dashboard</strong>
          <br />
          <small>{error}</small>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={styles.buttonContainer}>
        <button
          className="homebtn"
          onClick={() => navigate("/inventory/incoming-stock")}
        >
          Incoming Stock
        </button>
        <button
          className="homebtn"
          onClick={() => navigate("/inventory/outgoing-stock")}
        >
          Outgoing Stock
        </button>
        <button
          className="homebtn"
          onClick={() => navigate("/inventory/current-stock")}
        >
          Current Stock
        </button>
        <button
          className="homebtn"
          onClick={() => navigate("/inventory/stock-summary")}
        >
          Stock Summary
        </button>
        <button
          className="homebtn"
          onClick={() => navigate("/inventory/damaged-goods")}
        >
          Damaged Goods
        </button>
        <button
          className="homebtn"
          onClick={() => navigate("/inventory/manage-stock")}
        >
          Manage Stock
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Inventory Value</div>
          <div style={styles.cardValue}>
            {loading ? (
              <Loading />
            ) : (
              `₹${inventoryData?.totalInventoryValue || 0}`
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Outgoing Value</div>
          <div style={styles.cardValueRed}>
            {loading ? <Loading /> : `₹${inventoryData?.outgoingValue || 0}`}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Damaged Stock</div>
          <div style={styles.cardValueYellow}>
            {loading ? (
              <Loading />
            ) : (
              `₹${inventoryData?.damagedStockValue || 0}`
            )}
          </div>
        </div>
      </div>

      {/* Store Inventory Section - MOVED TO TOP */}
      {inventoryData?.storeInventory && (
        <div style={styles.storeInventorySection}>
          <div style={styles.sectionTitle}>Store Inventory Overview</div>

          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Total Stores</div>
              <div style={styles.statValue}>
                {inventoryData.storeInventory.totalStores || 0}
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={styles.statLabel}>Total Stock Qty</div>
              <div style={styles.statValue}>
                {inventoryData.storeInventory.totalStockQty || 0} bags
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={styles.statLabel}>Own Stores Stock</div>
              <div style={styles.statValue}>
                {inventoryData.storeInventory.ownStoresStockQty || 0} bags
              </div>
            </div>

            <div style={styles.statBox}>
              <div style={styles.statLabel}>Franchise Stock</div>
              <div style={styles.statValue}>
                {inventoryData.storeInventory.franchiseStoresStockQty || 0} bags
              </div>
            </div>
          </div>

          <div style={styles.sectionTitle}>Top 10 Stores by Stock</div>

          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Store Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Stock Qty</th>
              </tr>
            </thead>
            <tbody>
              {topStores.map((store) => (
                <tr key={store.storeId}>
                  <td style={styles.td}>{store.storeName}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.storeBadge,
                        ...(store.storeType === "own"
                          ? styles.ownBadge
                          : styles.franchiseBadge),
                      }}
                    >
                      {store.storeType === "own" ? "Own" : "Franchise"}
                    </span>
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...getStockQtyStyle(store.stockQty),
                    }}
                  >
                    {store.stockQty} bags
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts Section - MOVED TO BOTTOM */}
      <div style={styles.chartsContainer}>
        <div style={styles.sectionTitle}>Inventory Analytics</div>
        <Flex wrap="wrap" gap={4} justify="space-between">
          <ChartComponent
            type="line"
            title="Stock Level Trend"
            data={trendData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: true,
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return context.dataset.label + ": " + context.parsed.y;
                    },
                  },
                },
              },
            }}
          />

          <ChartComponent
            type="doughnut"
            title="Stock by Warehouse"
            data={warehouseData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed || 0;
                      return label + ": " + value;
                    },
                  },
                },
              },
            }}
            legendPosition="left"
          />
        </Flex>
      </div>
    </div>
  );
}

export default InventoryHome;
