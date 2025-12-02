import React, { useMemo, useState, useEffect } from "react";
import styles from "./StoreSalesOrders.module.css";
import homeStyles from "../../Dashboard/HomePage/HomePage.module.css";
import salesStyles from "../../Dashboard/Sales/Sales.module.css";
import xls from "../../../images/xls-png.png";
import pdf from "../../../images/pdf-png.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import storeService from "../../../services/storeService";

const DEFAULT_FILTERS = {
  from: "",
  to: "",
  customer: "",
  employee: "",
  status: "all",
};

function StoreSalesOrders({ onBack }) {
  const { axiosAPI } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [entityCount, setEntityCount] = useState(10);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get store ID from user context
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const user = userData.user || userData;
    const id = user.storeId || user.store?.id;
    setStoreId(id);
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchSales();
    }
  }, [storeId, appliedFilters]);

  const fetchSales = async () => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (appliedFilters.from) params.fromDate = appliedFilters.from;
      if (appliedFilters.to) params.toDate = appliedFilters.to;
      if (appliedFilters.customer) params.customerId = appliedFilters.customer;
      if (appliedFilters.employee) params.employeeId = appliedFilters.employee;
      if (appliedFilters.status !== "all") params.status = appliedFilters.status;
      
      const response = await storeService.getStoreSales(storeId, params);
      
      if (response.success) {
        // Map API response to match component structure
        const mappedOrders = (response.data || []).map((sale) => ({
          id: sale.saleCode || sale.id,
          date: sale.createdAt || sale.saleDate || new Date().toISOString().split('T')[0],
          storeName: sale.store?.name || "Store",
          storeEmployee: sale.employee?.name || "Employee",
          customerName: sale.customer?.name || "Customer",
          quantity: sale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
          status: sale.paymentStatus === "completed" ? "completed" : "pending",
          grandTotal: sale.grandTotal || 0,
          originalData: sale
        }));
        setOrders(mappedOrders);
      } else {
        setError(response.message || "Failed to fetch sales");
        setIsModalOpen(true);
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.response?.data?.message || "Failed to fetch sales data.");
      setIsModalOpen(true);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const customerOptions = useMemo(() => {
    const uniques = new Set(orders.map((order) => order.customerName));
    return Array.from(uniques);
  }, [orders]);

  const employeeOptions = useMemo(() => {
    const uniques = new Set(orders.map((order) => order.storeEmployee));
    return Array.from(uniques);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    // Filtering is now done on the backend, but we can do additional client-side filtering if needed
    return orders;
  }, [orders, appliedFilters]);

  const displayOrders = filteredOrders.slice(0, Number(entityCount) || 10);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setAppliedFilters(filters);
  };

  const handleCancel = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setEntityCount(10);
  };

  const handleExport = (type) => {
    console.log(`Exporting ${displayOrders.length} orders as ${type}`);
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const closeModal = () => setIsModalOpen(false);

  return (
    <div style={{ padding: "20px" }}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Store Sales Orders</h2>
          <p className="path">
            <span onClick={() => navigate("/store/sales")}>Sales</span>{" "}
            <i className="bi bi-chevron-right"></i> Orders
          </p>
        </div>
      </div>

      {loading && <Loading />}

      <div className={`${homeStyles.orderStatusCard} ${styles.cardWrapper}`}>
        

        <div className={`row g-3 ${styles.filtersRow}`}>
          <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 formcontent">
            <label>From :</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange("from", e.target.value)}
            />
          </div>
          <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 formcontent">
            <label>To :</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange("to", e.target.value)}
            />
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 formcontent">
            <label>Customers :</label>
            <select value={filters.customer} onChange={(e) => handleFilterChange("customer", e.target.value)}>
              <option value="">Select</option>
              {customerOptions.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 formcontent">
            <label>Store Employee :</label>
            <select value={filters.employee} onChange={(e) => handleFilterChange("employee", e.target.value)}>
              <option value="">Select</option>
              {employeeOptions.map((employee) => (
                <option key={employee} value={employee}>
                  {employee}
                </option>
              ))}
            </select>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 formcontent">
            <label>Status :</label>
            <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className={styles.buttonsRow}>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button className="submitbtn" onClick={handleSubmit}>
              Submit
            </button>
            <button className="cancelbtn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>

        <div className={styles.exportSection}>
          <div className={styles.exportButtons}>
            <button className={salesStyles.xls} onClick={() => handleExport("XLS")}>
              <p>Export to </p>
              <img src={xls} alt="Export to Excel" />
            </button>
            <button className={salesStyles.xls} onClick={() => handleExport("PDF")}>
              <p>Export to </p>
              <img src={pdf} alt="Export to PDF" />
            </button>
          </div>
          <div className={`${salesStyles.entity} ${styles.entityOverride}`}>
            <label>Entity :</label>
            <select value={entityCount} onChange={(e) => setEntityCount(e.target.value)}>
              {[10, 20, 30, 40, 50].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`${styles.tableContainer} table-responsive`}>
          <table className="table table-hover table-bordered borderedtable">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Order ID</th>
                <th>Store Name</th>
                <th>Store Employee</th>
                <th>Customer Name</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    No sales orders match the selected filters.
                  </td>
                </tr>
              ) : (
                displayOrders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{index + 1}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.id}</td>
                    <td>{order.storeName}</td>
                    <td>{order.storeEmployee}</td>
                    <td>{order.customerName}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          order.status === "completed" ? styles.completed : styles.pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal
          isOpen={isModalOpen}
          message={error}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default StoreSalesOrders;

