import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import Loading from "@/components/Loading";
import styles from "../../Dashboard/HomePage/HomePage.module.css";

const MONTH_OPTIONS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const LIMIT_OPTIONS = [10, 25, 50];

const now = new Date();
const DEFAULT_FILTERS = {
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  page: 1,
  limit: 10,
};

const getInitialFormState = () => ({
  staffSalary: "",
  rent: "",
  powerBill: "",
  maintenance: "",
  customFields: [],
});

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const monthLabel = (monthNumber) => {
  const option = MONTH_OPTIONS.find((entry) => entry.value === Number(monthNumber));
  return option ? option.label : "Unknown";
};

const convertCustomFieldsToRows = (customFields) => {
  if (!customFields || typeof customFields !== "object") return [];
  return Object.entries(customFields).map(([key, value]) => ({
    key,
    value: value ?? "",
  }));
};

const convertRowsToCustomFields = (rows = []) =>
  rows.reduce((acc, row) => {
    const trimmedKey = row.key?.trim();
    if (!trimmedKey) return acc;

    if (row.value === null || row.value === undefined || row.value === "") {
      acc[trimmedKey] = 0;
      return acc;
    }

    const numericValue = Number(row.value);
    acc[trimmedKey] = Number.isNaN(numericValue) ? row.value : numericValue;
    return acc;
  }, {});

const totalCustomFieldsAmount = (customFields) =>
  Object.values(customFields || {}).reduce((sum, amount) => sum + Number(amount || 0), 0);

const totalRecordExpenditure = (record) =>
  Number(record.staffSalary || 0) +
  Number(record.rent || 0) +
  Number(record.powerBill || 0) +
  Number(record.maintenance || 0) +
  totalCustomFieldsAmount(record.customFields);

const renderCustomFieldList = (customFields) => {
  const entries = Object.entries(customFields || {});
  if (!entries.length) {
    return <span style={{ color: "#9ca3af", fontFamily: "Poppins", fontSize: "13px" }}>—</span>;
  }

  return (
    <ul style={{ margin: 0, paddingLeft: "18px" }}>
      {entries.map(([key, value]) => (
        <li key={key} style={{ fontFamily: "Poppins", fontSize: "13px" }}>
          <strong>{key}</strong>: {formatCurrency(value)}
        </li>
      ))}
    </ul>
  );
};

function StoreExpenditures() {
  const navigate = useNavigate();

  const [storeId, setStoreId] = useState(null);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [summaryYear, setSummaryYear] = useState(DEFAULT_FILTERS.year);

  const [expenditures, setExpenditures] = useState([]);
  const [allExpendituresData, setAllExpendituresData] = useState(null); // Persistent dummy data
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [summaryData, setSummaryData] = useState(null);

  const [selectedExpenditureId, setSelectedExpenditureId] = useState(null);
  const [selectedExpenditure, setSelectedExpenditure] = useState(null);
  const [editForm, setEditForm] = useState(getInitialFormState());

  const [listLoading, setListLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
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
    if (storeId) return;
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const user = stored.user || stored;
      const inferredStoreId = user?.storeId || user?.store?.id;
      if (inferredStoreId) {
        setStoreId(inferredStoreId);
      }
    } catch (err) {
      console.error("Unable to parse stored user data", err);
      showError("Unable to determine store information. Please re-login.");
    }
  }, [showError, storeId]);

  const fetchExpenditures = useCallback(async () => {
    if (!storeId) return;
    setListLoading(true);
    try {
      // Initialize dummy data only once
      if (!allExpendituresData) {
        const initialDummyExpenditures = [
          {
            id: 1,
            expenditureCode: "EXP-001",
            month: 1,
            year: 2024,
            staffSalary: 50000,
            rent: 30000,
            powerBill: 5000,
            maintenance: 10000,
            customFields: { "Internet": 2000, "Security": 5000 },
          },
          {
            id: 2,
            expenditureCode: "EXP-002",
            month: 2,
            year: 2024,
            staffSalary: 50000,
            rent: 30000,
            powerBill: 6000,
            maintenance: 12000,
            customFields: { "Internet": 2000, "Security": 5000 },
          },
          {
            id: 3,
            expenditureCode: "EXP-003",
            month: 3,
            year: 2024,
            staffSalary: 55000,
            rent: 30000,
            powerBill: 5500,
            maintenance: 11000,
            customFields: { "Internet": 2000 },
          },
          {
            id: 4,
            expenditureCode: "EXP-004",
            month: 4,
            year: 2024,
            staffSalary: 55000,
            rent: 30000,
            powerBill: 7000,
            maintenance: 10000,
            customFields: {},
          },
          {
            id: 5,
            expenditureCode: "EXP-005",
            month: 5,
            year: 2024,
            staffSalary: 50000,
            rent: 30000,
            powerBill: 5000,
            maintenance: 10000,
            customFields: { "Internet": 2000, "Security": 5000, "Cleaning": 3000 },
          },
        ];
        setAllExpendituresData(initialDummyExpenditures);
      }

      // Use existing data or initialize
      const currentExpenditures = allExpendituresData || [];

      // Filter by month and year
      let filtered = currentExpenditures.filter(
        (exp) => exp.month === filters.month && exp.year === filters.year
      );

      // Simulate pagination
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      const paginated = filtered.slice(startIndex, endIndex);

      setExpenditures(paginated);
      setPagination({
          page: filters.page,
          limit: filters.limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / filters.limit) || 1,
      });

      if (paginated.length === 0) {
        setSelectedExpenditureId(null);
        setSelectedExpenditure(null);
        setEditForm(getInitialFormState());
      } else {
        const stillVisible = paginated.find((entry) => entry.id === selectedExpenditureId);
        if (!stillVisible) {
          setSelectedExpenditureId(paginated[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch expenditures", err);
      showError(err.message);
    } finally {
      setListLoading(false);
    }
  }, [filters.limit, filters.month, filters.page, filters.year, selectedExpenditureId, showError, storeId, allExpendituresData]);

  const fetchSummary = useCallback(async () => {
    if (!storeId || !summaryYear) return;
    setSummaryLoading(true);
    try {
      // Dummy summary data
      const dummySummary = {
        year: summaryYear,
        totalExpenditure: 650000,
        monthlyBreakdown: [
          { month: 1, year: summaryYear, staffSalary: 50000, rent: 30000, powerBill: 5000, maintenance: 10000, total: 95000 },
          { month: 2, year: summaryYear, staffSalary: 50000, rent: 30000, powerBill: 6000, maintenance: 12000, total: 98000 },
          { month: 3, year: summaryYear, staffSalary: 55000, rent: 30000, powerBill: 5500, maintenance: 11000, total: 101500 },
          { month: 4, year: summaryYear, staffSalary: 55000, rent: 30000, powerBill: 7000, maintenance: 10000, total: 102000 },
          { month: 5, year: summaryYear, staffSalary: 50000, rent: 30000, powerBill: 5000, maintenance: 10000, total: 95000 },
          { month: 6, year: summaryYear, staffSalary: 50000, rent: 30000, powerBill: 6000, maintenance: 12000, total: 98000 },
        ],
      };
      setSummaryData(dummySummary);
    } catch (err) {
      console.error("Failed to fetch summary", err);
      showError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }, [showError, storeId, summaryYear]);

  const loadExpenditureDetails = useCallback(
    async (expenditureId, { silent = false } = {}) => {
      if (!storeId || !expenditureId) return;
      if (!silent) {
        setDetailLoading(true);
      }
      try {
        // Use persistent dummy data
        const currentExpenditures = allExpendituresData || [];
        const data = currentExpenditures.find((e) => e.id === Number(expenditureId)) || {};
        if (data.id) {
          setSelectedExpenditure(data);
          setEditForm({
            staffSalary: data.staffSalary ?? "",
            rent: data.rent ?? "",
            powerBill: data.powerBill ?? "",
            maintenance: data.maintenance ?? "",
            customFields: convertCustomFieldsToRows(data.customFields),
          });
        } else {
          throw new Error("Expenditure not found.");
        }
      } catch (err) {
        console.error("Failed to load expenditure details", err);
        showError(err.message);
      } finally {
        if (!silent) {
          setDetailLoading(false);
        }
      }
    },
    [showError, storeId, allExpendituresData]
  );

  useEffect(() => {
    if (storeId) {
      fetchExpenditures();
    }
  }, [fetchExpenditures, storeId]);

  useEffect(() => {
    if (storeId) {
      fetchSummary();
    }
  }, [fetchSummary, storeId]);

  useEffect(() => {
    if (storeId && selectedExpenditureId) {
      loadExpenditureDetails(selectedExpenditureId);
    }
  }, [loadExpenditureDetails, selectedExpenditureId, storeId]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field !== "page" ? { page: 1 } : {}),
    }));
  };

  const handlePaginationChange = (direction) => {
    setFilters((prev) => {
      const totalPages = pagination.totalPages || 1;
      const nextPage = direction === "next" ? prev.page + 1 : prev.page - 1;
      if (nextPage < 1 || nextPage > totalPages) {
        return prev;
      }
      return { ...prev, page: nextPage };
    });
  };

  const handleEditInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setEditForm((prev) => {
      const rows = [...(prev.customFields || [])];
      rows[index] = {
        ...rows[index],
        [field]: value,
      };
      return { ...prev, customFields: rows };
    });
  };

  const handleAddCustomField = () => {
    setEditForm((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), { key: "", value: "" }],
    }));
  };

  const handleRemoveCustomField = (index) => {
    setEditForm((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateExpenditure = async (event) => {
    event.preventDefault();
    if (!storeId || !selectedExpenditureId) {
      showError("Select an expenditure before updating.");
      return;
    }

    setActionLoading(true);
    try {
      // Update persistent dummy data
      const updatedExpenditure = {
        ...selectedExpenditure,
        staffSalary: Number(editForm.staffSalary || 0),
        rent: Number(editForm.rent || 0),
        powerBill: Number(editForm.powerBill || 0),
        maintenance: Number(editForm.maintenance || 0),
        customFields: convertRowsToCustomFields(editForm.customFields),
      };
      
      // Update in persistent data
      setAllExpendituresData((prev) => {
        if (!prev) return prev;
        return prev.map((exp) => (exp.id === updatedExpenditure.id ? updatedExpenditure : exp));
      });
      
      setSelectedExpenditure(updatedExpenditure);
      showSuccess("Store expenditure updated successfully.");
      await fetchExpenditures();
    } catch (err) {
      console.error("Failed to update expenditure", err);
      showError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExpenditure = async () => {
    if (!storeId || !selectedExpenditureId) return;
    const confirmed = window.confirm("Delete this expenditure record? This action cannot be undone.");
    if (!confirmed) return;

    setActionLoading(true);
    try {
      // Update persistent dummy data
      setAllExpendituresData((prev) => {
        if (!prev) return prev;
        return prev.filter((exp) => exp.id !== selectedExpenditureId);
      });
      
      showSuccess("Store expenditure deleted successfully.");
      setSelectedExpenditureId(null);
      setSelectedExpenditure(null);
      setEditForm(getInitialFormState());
      await fetchExpenditures();
    } catch (err) {
      console.error("Failed to delete expenditure", err);
      showError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const breakdownTotals = useMemo(() => {
    if (!summaryData?.monthlyBreakdown?.length) return null;
    return summaryData.monthlyBreakdown.reduce(
      (acc, item) => ({
        staffSalary: acc.staffSalary + Number(item.staffSalary || 0),
        rent: acc.rent + Number(item.rent || 0),
        powerBill: acc.powerBill + Number(item.powerBill || 0),
        maintenance: acc.maintenance + Number(item.maintenance || 0),
        total: acc.total + Number(item.total || 0),
      }),
      { staffSalary: 0, rent: 0, powerBill: 0, maintenance: 0, total: 0 }
    );
  }, [summaryData]);

  const closeErrorModal = () => setIsErrorModalOpen(false);
  const closeSuccessModal = () => setIsSuccessModalOpen(false);

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
          Store Expenditures
        </h2>
        <p className="path">
          <span onClick={() => navigate("/store")}>Store Home</span> <i className="bi bi-chevron-right"></i> Expenditures
        </p>
      </div>

      {!storeId && (
        <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, fontFamily: "Poppins" }}>Store information missing. Please re-login to continue.</p>
        </div>
      )}

      {storeId && (
        <>
          <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label>Month</label>
                <select value={filters.month} onChange={(e) => handleFilterChange("month", Number(e.target.value))}>
                  {MONTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Year</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", Number(e.target.value) || DEFAULT_FILTERS.year)}
                />
              </div>
              <div>
                <label>Rows per page</label>
                <select value={filters.limit} onChange={(e) => handleFilterChange("limit", Number(e.target.value))}>
                  {LIMIT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                <button className="homebtn" type="button" onClick={fetchExpenditures} disabled={listLoading}>
                  Refresh
                </button>
                <button
                  className="homebtn"
                  type="button"
                  onClick={() => {
                    setFilters({ ...DEFAULT_FILTERS });
                    setSummaryYear(DEFAULT_FILTERS.year);
                  }}
                  style={{ background: "#f3f4f6", color: "#2563eb" }}
                >
                  Reset
                </button>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: "Poppins", color: "#6b7280" }}>
              Showing page {pagination.page} of {pagination.totalPages || 1}
            </p>
          </div>

          <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "var(--primary-color)",
                }}
              >
                Expenditure Register
              </h4>
              <button className="homebtn" type="button" onClick={fetchExpenditures} disabled={listLoading}>
                Reload
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table table-bordered borderedtable table-sm" style={{ fontFamily: "Poppins" }}>
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Period</th>
                    <th>Staff Salary</th>
                    <th>Rent</th>
                    <th>Power Bill</th>
                    <th>Maintenance</th>
                    <th>Custom Fields</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                        {listLoading ? "Loading expenditures..." : "No expenditures found for the selected period."}
                      </td>
                    </tr>
                  )}
                  {expenditures.map((record) => {
                    const isSelected = record.id === selectedExpenditureId;
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedExpenditureId(record.id)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "rgba(37, 99, 235, 0.08)" : "transparent",
                        }}
                      >
                        <td style={{ fontWeight: 600 }}>{record.expenditureCode || `EXP-${record.id}`}</td>
                        <td>
                          {monthLabel(record.month)} {record.year}
                        </td>
                        <td>{formatCurrency(record.staffSalary)}</td>
                        <td>{formatCurrency(record.rent)}</td>
                        <td>{formatCurrency(record.powerBill)}</td>
                        <td>{formatCurrency(record.maintenance)}</td>
                        <td>{renderCustomFieldList(record.customFields)}</td>
                        <td>{formatCurrency(totalRecordExpenditure(record))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {expenditures.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "16px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <p style={{ margin: 0, fontFamily: "Poppins", color: "#374151" }}>
                  Total records: {pagination.total || expenditures.length}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="homebtn" type="button" onClick={() => handlePaginationChange("prev")} disabled={filters.page === 1}>
                    Previous
                  </button>
                  <button
                    className="homebtn"
                    type="button"
                    onClick={() => handlePaginationChange("next")}
                    disabled={filters.page >= (pagination.totalPages || 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "var(--primary-color)",
                }}
              >
                Yearly Summary
              </h4>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="number"
                  value={summaryYear}
                  onChange={(e) => setSummaryYear(Number(e.target.value) || DEFAULT_FILTERS.year)}
                  style={{ maxWidth: "120px" }}
                />
                <button className="homebtn" type="button" onClick={fetchSummary} disabled={summaryLoading}>
                  View
                </button>
              </div>
            </div>
            {summaryLoading ? (
              <p style={{ fontFamily: "Poppins", margin: 0 }}>Loading summary...</p>
            ) : summaryData ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ padding: "16px", background: "#eef2ff", borderRadius: "8px" }}>
                    <p style={{ margin: 0, color: "#4c1d95", fontSize: "13px" }}>Year</p>
                    <p style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>{summaryData.year}</p>
                  </div>
                  <div style={{ padding: "16px", background: "#fee2e2", borderRadius: "8px" }}>
                    <p style={{ margin: 0, color: "#991b1b", fontSize: "13px" }}>Total Expenditure</p>
                    <p style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>{formatCurrency(summaryData.totalExpenditure)}</p>
                  </div>
                  <div style={{ padding: "16px", background: "#ecfccb", borderRadius: "8px" }}>
                    <p style={{ margin: 0, color: "#3f6212", fontSize: "13px" }}>Months Tracked</p>
                    <p style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                      {summaryData.monthlyBreakdown?.length || 0}
                    </p>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="table table-bordered borderedtable table-sm" style={{ fontFamily: "Poppins" }}>
                    <thead className="table-light">
                      <tr>
                        <th>Month</th>
                        <th>Staff Salary</th>
                        <th>Rent</th>
                        <th>Power Bill</th>
                        <th>Maintenance</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.monthlyBreakdown?.map((item) => (
                        <tr key={`${item.year}-${item.month}`}>
                          <td>{monthLabel(item.month)}</td>
                          <td>{formatCurrency(item.staffSalary)}</td>
                          <td>{formatCurrency(item.rent)}</td>
                          <td>{formatCurrency(item.powerBill)}</td>
                          <td>{formatCurrency(item.maintenance)}</td>
                          <td>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                      {breakdownTotals && (
                        <tr style={{ background: "#f3f4f6", fontWeight: 600 }}>
                          <td>Total</td>
                          <td>{formatCurrency(breakdownTotals.staffSalary)}</td>
                          <td>{formatCurrency(breakdownTotals.rent)}</td>
                          <td>{formatCurrency(breakdownTotals.powerBill)}</td>
                          <td>{formatCurrency(breakdownTotals.maintenance)}</td>
                          <td>{formatCurrency(breakdownTotals.total)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p style={{ fontFamily: "Poppins", margin: 0 }}>No summary available for the selected year.</p>
            )}
          </div>

          <div className={styles.orderStatusCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "var(--primary-color)",
                }}
              >
                {selectedExpenditure ? `Expenditure #${selectedExpenditure.expenditureCode || selectedExpenditure.id}` : "Select an expenditure"}
              </h4>
              {selectedExpenditure && (
                <span style={{ fontFamily: "Poppins", color: "#6b7280" }}>
                  {monthLabel(selectedExpenditure.month)} {selectedExpenditure.year}
                </span>
              )}
            </div>

            {detailLoading ? (
              <p style={{ fontFamily: "Poppins", margin: 0 }}>Loading expenditure details...</p>
            ) : !selectedExpenditure ? (
              <p style={{ fontFamily: "Poppins", margin: 0 }}>
                Select a row from the register to view and edit expenditure details.
              </p>
            ) : (
              <form onSubmit={handleUpdateExpenditure}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label>Staff Salary (₹)</label>
                    <input
                      type="number"
                      value={editForm.staffSalary}
                      onChange={(e) => handleEditInputChange("staffSalary", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Rent (₹)</label>
                    <input type="number" value={editForm.rent} onChange={(e) => handleEditInputChange("rent", e.target.value)} />
                  </div>
                  <div>
                    <label>Power Bill (₹)</label>
                    <input
                      type="number"
                      value={editForm.powerBill}
                      onChange={(e) => handleEditInputChange("powerBill", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Maintenance (₹)</label>
                    <input
                      type="number"
                      value={editForm.maintenance}
                      onChange={(e) => handleEditInputChange("maintenance", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h5 style={{ margin: 0, fontFamily: "Poppins", fontWeight: 600 }}>Custom Fields</h5>
                    <button type="button" className="homebtn" onClick={handleAddCustomField}>
                      Add Field
                    </button>
                  </div>
                  {(editForm.customFields || []).length === 0 && (
                    <p style={{ fontFamily: "Poppins", color: "#6b7280", margin: 0 }}>No custom fields added.</p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {(editForm.customFields || []).map((row, index) => (
                      <div
                        key={`${row.key}-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr auto",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Field name"
                          value={row.key}
                          onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={row.value}
                          onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(index)}
                          style={{
                            border: "1px solid #ef4444",
                            background: "transparent",
                            color: "#ef4444",
                            borderRadius: "6px",
                            padding: "6px 12px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button className="homebtn" type="submit" disabled={actionLoading}>
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className="homebtn"
                    type="button"
                    onClick={handleDeleteExpenditure}
                    disabled={actionLoading}
                    style={{ background: "#fee2e2", color: "#b91c1c" }}
                  >
                    Delete
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}

      {(listLoading && expenditures.length === 0) && <Loading />}

      <ErrorModal isOpen={isErrorModalOpen} message={error} onClose={closeErrorModal} />
      <SuccessModal isOpen={isSuccessModalOpen} message={successMessage} onClose={closeSuccessModal} />
    </div>
  );
}

export default StoreExpenditures;
