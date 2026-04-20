import React, { useEffect, useMemo, useState } from "react";
import ErrorModal from "@/components/ErrorModal";
import erpReportsService, {
  REPORT_CATEGORIES,
  REPORT_TYPES,
} from "@/services/erpReportsService";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Database,
  Filter,
  LayoutGrid,
  Search,
  Store,
} from "lucide-react";

const css = `
  .erp-page * { box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
  .erp-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(0,49,118,0.05), transparent 28%),
      linear-gradient(180deg, #f6f8fc 0%, #eef3fb 100%);
    padding: 0 0 36px;
    color: #10213f;
  }
  .erp-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 28px 0;
    font-size: 12px;
    color: #64748b;
  }
  .erp-breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  .erp-breadcrumb-link:hover { color: #003176; }
  .erp-header {
    padding: 12px 28px 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }
  .erp-title h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #0f172a;
  }
  .erp-title p {
    margin: 6px 0 0;
    font-size: 14px;
    color: #5f6f8f;
  }
  .erp-filters {
    margin: 18px 28px 0;
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(148,163,184,0.2);
    border-radius: 22px;
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
    overflow: hidden;
  }
  .erp-filters-top {
    padding: 20px 22px;
    display: grid;
    grid-template-columns: repeat(5, minmax(180px, 1fr));
    gap: 14px;
    align-items: end;
  }
  .erp-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .erp-field label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    color: #64748b;
  }
  .erp-input, .erp-select {
    width: 100%;
    min-height: 44px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #0f172a;
    font-size: 14px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
  }
  .erp-input:focus, .erp-select:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
  }
  .erp-filter-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .erp-btn {
    min-height: 44px;
    border-radius: 12px;
    border: 1px solid transparent;
    padding: 0 18px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .erp-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .erp-btn:disabled { opacity: .6; cursor: not-allowed; }
  .erp-btn-primary {
    background: linear-gradient(135deg, #003176, #1d4ed8);
    color: #fff;
    box-shadow: 0 10px 20px rgba(0,49,118,0.18);
  }
  .erp-btn-secondary {
    background: #fff;
    color: #334155;
    border-color: #cbd5e1;
  }
  .erp-store-panel {
    border-top: 1px solid rgba(148,163,184,0.18);
    padding: 18px 22px 22px;
    background: linear-gradient(180deg, rgba(248,250,252,0.95), rgba(241,245,249,0.95));
  }
  .erp-store-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .erp-store-head-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .erp-store-head-title h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }
  .erp-store-head-title p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
  .erp-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .erp-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(37,99,235,0.08);
    color: #1d4ed8;
    border: 1px solid rgba(37,99,235,0.12);
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 700;
  }
  .erp-store-search {
    position: relative;
    max-width: 360px;
    width: 100%;
  }
  .erp-store-search svg {
    position: absolute;
    top: 12px;
    left: 12px;
    color: #94a3b8;
  }
  .erp-store-search input {
    padding-left: 38px;
  }
  .erp-store-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    max-height: 280px;
    overflow: auto;
    padding-right: 4px;
  }
  .erp-store-card {
    background: #fff;
    border: 1px solid #dbe4f0;
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    min-height: 86px;
    cursor: pointer;
    transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
  }
  .erp-store-card:hover {
    border-color: #93c5fd;
    box-shadow: 0 10px 24px rgba(37,99,235,0.08);
    transform: translateY(-1px);
  }
  .erp-store-card.active {
    border-color: #2563eb;
    background: linear-gradient(180deg, #eff6ff, #ffffff);
    box-shadow: 0 12px 24px rgba(37,99,235,0.12);
  }
  .erp-store-card input { margin-top: 4px; }
  .erp-store-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .erp-store-info strong { font-size: 14px; color: #0f172a; }
  .erp-store-info span { font-size: 12px; color: #64748b; }
  .erp-summary-grid {
    margin: 20px 28px 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }
  .erp-summary-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(148,163,184,0.18);
    box-shadow: 0 12px 30px rgba(15,23,42,0.06);
    padding: 16px 18px;
  }
  .erp-summary-card label {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .erp-summary-card strong {
    font-size: 28px;
    line-height: 1.1;
    color: #0f172a;
    display: block;
  }
  .erp-results {
    margin: 20px 28px 0;
    background: #fff;
    border-radius: 22px;
    border: 1px solid rgba(148,163,184,0.2);
    box-shadow: 0 18px 40px rgba(15,23,42,0.06);
    overflow: hidden;
  }
  .erp-results-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 18px 20px;
    border-bottom: 1px solid #e5edf6;
    background: linear-gradient(180deg, rgba(239,246,255,0.65), rgba(255,255,255,1));
  }
  .erp-results-head h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }
  .erp-results-head p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #64748b;
  }
  .erp-badge-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .erp-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: rgba(15,23,42,0.05);
    color: #334155;
  }
  .erp-table-wrap {
    overflow: auto;
    max-height: calc(100vh - 290px);
  }
  .erp-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 980px;
  }
  .erp-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #f8fbff;
    padding: 12px 14px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid #dbe4f0;
    text-align: left;
  }
  .erp-table tbody td {
    padding: 12px 14px;
    font-size: 13px;
    color: #1e293b;
    border-bottom: 1px solid #edf2f7;
    vertical-align: top;
  }
  .erp-table tbody tr:hover { background: #f8fbff; }
  .erp-empty {
    margin: 20px 28px 0;
    background: #fff;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    border-radius: 20px;
    padding: 44px 20px;
    text-align: center;
  }
  .erp-loader {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(241,245,249,0.84);
    backdrop-filter: blur(7px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .erp-loader-card {
    background: #fff;
    border-radius: 24px;
    padding: 30px 34px;
    min-width: 320px;
    box-shadow: 0 18px 50px rgba(15,23,42,0.15);
    border: 1px solid rgba(148,163,184,0.22);
    text-align: center;
  }
  .erp-loader-card strong {
    display: block;
    font-size: 18px;
    color: #0f172a;
    margin-bottom: 8px;
  }
  .erp-loader-card span {
    display: block;
    font-size: 13px;
    color: #64748b;
    margin-bottom: 14px;
  }
  .erp-loader-bar {
    height: 5px;
    border-radius: 999px;
    overflow: hidden;
    background: #e2e8f0;
  }
  .erp-loader-bar::after {
    content: "";
    display: block;
    width: 34%;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #003176, #2563eb, #22c55e);
    animation: erp-loading 1.2s ease-in-out infinite;
  }
  @keyframes erp-loading {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(320%); }
  }
  @media (max-width: 1100px) {
    .erp-filters-top { grid-template-columns: repeat(2, minmax(180px, 1fr)); }
  }
  @media (max-width: 768px) {
    .erp-breadcrumb, .erp-header { padding-left: 16px; padding-right: 16px; }
    .erp-filters, .erp-summary-grid, .erp-results, .erp-empty { margin-left: 16px; margin-right: 16px; }
    .erp-filters-top { grid-template-columns: 1fr; }
    .erp-store-grid { grid-template-columns: 1fr; }
  }
`;

const CATEGORY_TO_TYPES = {
  [REPORT_CATEGORIES.sales]: [
    REPORT_TYPES.summary,
    REPORT_TYPES.comparison,
    REPORT_TYPES.leaderboard,
    REPORT_TYPES.trend,
  ],
  [REPORT_CATEGORIES.inventory]: [
    REPORT_TYPES.stockSummary,
    REPORT_TYPES.stockMovement,
  ],
  [REPORT_CATEGORIES.finance]: [
    REPORT_TYPES.profitability,
    REPORT_TYPES.paymentAnalysis,
  ],
  [REPORT_CATEGORIES.target]: [REPORT_TYPES.targetVsAchievement],
  [REPORT_CATEGORIES.returns]: [
    REPORT_TYPES.returnSummary,
    REPORT_TYPES.returnRegister,
  ],
  [REPORT_CATEGORIES.damage]: [
    REPORT_TYPES.damageSummary,
    REPORT_TYPES.damageRegister,
  ],
  [REPORT_CATEGORIES.assets]: [
    REPORT_TYPES.assetSummary,
    REPORT_TYPES.assetRegister,
  ],
};

function toISODateInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function prettifyKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatValue(value, type) {
  if (value === null || value === undefined || value === "") return "-";

  if (type === "currency" && typeof Number(value) === "number" && !Number.isNaN(Number(value))) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  if (type === "percent" && typeof Number(value) === "number" && !Number.isNaN(Number(value))) {
    return `${Number(value).toFixed(2)}%`;
  }

  if (type === "number" && typeof Number(value) === "number" && !Number.isNaN(Number(value))) {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  return String(value);
}

function ErpReports({ navigate }) {
  const today = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => toISODateInputValue(today), [today]);
  const defaultFrom = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 30);
    return toISODateInputValue(date);
  }, [today]);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [reportCategory, setReportCategory] = useState(REPORT_CATEGORIES.sales);
  const [reportType, setReportType] = useState(REPORT_TYPES.summary);
  const [availableStores, setAvailableStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const reportTypeOptions = CATEGORY_TO_TYPES[reportCategory] || [];

  useEffect(() => {
    if (!reportTypeOptions.includes(reportType)) {
      setReportType(reportTypeOptions[0] || "");
    }
  }, [reportCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true;

    async function loadStores() {
      try {
        setStoresLoading(true);
        const response = await erpReportsService.getAvailableStores();
        if (!mounted) return;

        if (!response.success) {
          setError(response.message || "Failed to load stores");
          setIsErrorOpen(true);
          return;
        }

        setAvailableStores(response.data || []);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError?.message || "Failed to load stores");
        setIsErrorOpen(true);
      } finally {
        if (mounted) setStoresLoading(false);
      }
    }

    loadStores();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleStores = useMemo(() => {
    const query = storeSearch.trim().toLowerCase();
    if (!query) return availableStores;
    return availableStores.filter((store) =>
      [store.name, store.storeCode, String(store.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [availableStores, storeSearch]);

  const selectedStoreNames = useMemo(
    () =>
      availableStores
        .filter((store) => selectedStoreIds.includes(store.id))
        .map((store) => `${store.name} (${store.storeCode || store.id})`),
    [availableStores, selectedStoreIds],
  );

  const toggleStore = (storeId) => {
    setSelectedStoreIds((previous) =>
      previous.includes(storeId)
        ? previous.filter((id) => id !== storeId)
        : [...previous, storeId],
    );
  };

  const toggleVisibleStores = () => {
    const visibleIds = visibleStores.map((store) => store.id);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((storeId) => selectedStoreIds.includes(storeId));

    if (allVisibleSelected) {
      setSelectedStoreIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedStoreIds((previous) => [
      ...new Set([...previous, ...visibleIds]),
    ]);
  };

  const closeError = () => setIsErrorOpen(false);

  const runReport = async () => {
    try {
      if (!fromDate || !toDate) {
        setError("Please choose both From Date and To Date.");
        setIsErrorOpen(true);
        return;
      }

      if (new Date(fromDate) > new Date(toDate)) {
        setError("From Date cannot be after To Date.");
        setIsErrorOpen(true);
        return;
      }

      if (!reportCategory || !reportType) {
        setError("Please choose a report category and type.");
        setIsErrorOpen(true);
        return;
      }

      setLoading(true);
      const response = await erpReportsService.getErpReport({
        fromDate,
        toDate,
        reportCategory,
        reportType,
        storeIds: selectedStoreIds,
      });

      if (!response.success) {
        setError(response.message || "Failed to load ERP report");
        setIsErrorOpen(true);
        return;
      }

      setReport(response.data?.data || response.data || null);
    } catch (loadError) {
      setError(loadError?.message || "Failed to load ERP report");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setReportCategory(REPORT_CATEGORIES.sales);
    setReportType(REPORT_TYPES.summary);
    setStoreSearch("");
    setSelectedStoreIds([]);
    setReport(null);
  };

  const hasRows = Boolean(report?.rows?.length);

  return (
    <>
      <style>{css}</style>

      <div className="erp-page">
        {loading && (
          <div className="erp-loader">
            <div className="erp-loader-card">
              <strong>Building ERP report</strong>
              <span>Pulling data, shaping summaries, and preparing the table.</span>
              <div className="erp-loader-bar" />
            </div>
          </div>
        )}

        <div className="erp-breadcrumb">
          <span
            className="erp-breadcrumb-link"
            onClick={() => navigate("/reports")}
          >
            <LayoutGrid size={13} /> Reports
          </span>
          <ChevronRight size={12} />
          <span>ERP Reports</span>
        </div>

        <div className="erp-header">
          <div className="erp-title">
            <h1>ERP Reports</h1>
            <p>
              Sales, inventory, finance, targets, returns, damages, and asset reports
              from one workspace.
            </p>
          </div>
        </div>

        <div className="erp-filters">
          <div className="erp-filters-top">
            <div className="erp-field">
              <label htmlFor="erpFrom">
                <Calendar size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />
                From Date
              </label>
              <input
                id="erpFrom"
                className="erp-input"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </div>

            <div className="erp-field">
              <label htmlFor="erpTo">
                <Calendar size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />
                To Date
              </label>
              <input
                id="erpTo"
                className="erp-input"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>

            <div className="erp-field">
              <label htmlFor="erpCategory">
                <Database size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Report Category
              </label>
              <select
                id="erpCategory"
                className="erp-select"
                value={reportCategory}
                onChange={(event) => setReportCategory(event.target.value)}
              >
                {Object.values(REPORT_CATEGORIES).map((category) => (
                  <option key={category} value={category}>
                    {prettifyKey(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="erp-field">
              <label htmlFor="erpType">
                <Filter size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Report Type
              </label>
              <select
                id="erpType"
                className="erp-select"
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
              >
                {reportTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {prettifyKey(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="erp-filter-actions">
              <button className="erp-btn erp-btn-primary" onClick={runReport} disabled={loading || storesLoading}>
                <BarChart3 size={16} /> Generate Report
              </button>
              <button className="erp-btn erp-btn-secondary" onClick={resetFilters} disabled={loading}>
                Reset
              </button>
            </div>
          </div>

          <div className="erp-store-panel">
            <div className="erp-store-head">
              <div className="erp-store-head-title">
                <h3>Store Filter</h3>
                <p>
                  Leave this empty to run the report across all stores you can access.
                </p>
              </div>

              <div className="erp-chip-row">
                <span className="erp-chip">
                  <Store size={13} /> Accessible: {availableStores.length}
                </span>
                <span className="erp-chip">
                  Selected: {selectedStoreIds.length || "All"}
                </span>
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  style={{ minHeight: 34, padding: "0 12px", fontSize: 12 }}
                  onClick={toggleVisibleStores}
                  disabled={storesLoading || visibleStores.length === 0}
                >
                  {visibleStores.length > 0 &&
                  visibleStores.every((store) => selectedStoreIds.includes(store.id))
                    ? "Clear Visible"
                    : "Select Visible"}
                </button>
              </div>
            </div>

            <div className="erp-store-search">
              <Search size={16} />
              <input
                className="erp-input"
                type="text"
                placeholder="Search by store name, code, or id"
                value={storeSearch}
                onChange={(event) => setStoreSearch(event.target.value)}
              />
            </div>

            <div style={{ height: 12 }} />

            <div className="erp-store-grid">
              {visibleStores.map((store) => {
                const checked = selectedStoreIds.includes(store.id);
                return (
                  <label
                    key={store.id}
                    className={`erp-store-card${checked ? " active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStore(store.id)}
                    />
                    <div className="erp-store-info">
                      <strong>{store.name}</strong>
                      <span>Code: {store.storeCode || "-"}</span>
                      <span>Store Id: {store.id}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedStoreNames.length > 0 && (
              <div style={{ marginTop: 14 }} className="erp-chip-row">
                {selectedStoreNames.slice(0, 10).map((name) => (
                  <span key={name} className="erp-chip">
                    {name}
                  </span>
                ))}
                {selectedStoreNames.length > 10 && (
                  <span className="erp-chip">+{selectedStoreNames.length - 10} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        {report?.summary?.length > 0 && (
          <div className="erp-summary-grid">
            {report.summary.map((item) => (
              <div key={item.label} className="erp-summary-card">
                <label>{item.label}</label>
                <strong>{formatValue(item.value, item.type)}</strong>
              </div>
            ))}
          </div>
        )}

        {report && (
          <div className="erp-results">
            <div className="erp-results-head">
              <div>
                <h3>{report.title || "ERP Report"}</h3>
                <p>{report.subtitle || "Report data for the selected ERP filters."}</p>
              </div>

              <div className="erp-badge-row">
                <span className="erp-badge">
                  Category: {prettifyKey(report.reportCategory || reportCategory)}
                </span>
                <span className="erp-badge">
                  Type: {prettifyKey(report.reportType || reportType)}
                </span>
                <span className="erp-badge">
                  Rows: {report.rowCount || report.rows?.length || 0}
                </span>
              </div>
            </div>

            {hasRows ? (
              <div className="erp-table-wrap">
                <table className="erp-table">
                  <thead>
                    <tr>
                      {(report.columns || []).map((column) => (
                        <th key={column.key}>{column.label || prettifyKey(column.key)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, index) => (
                      <tr key={row.id || row.code || row.sNo || index}>
                        {(report.columns || []).map((column) => (
                          <td key={column.key}>
                            {formatValue(row[column.key], column.type)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="erp-empty" style={{ margin: 0, border: "none", borderRadius: 0 }}>
                No rows matched the selected filters.
              </div>
            )}
          </div>
        )}

        {!report && !loading && (
          <div className="erp-empty">
            <strong style={{ display: "block", marginBottom: 8, color: "#0f172a" }}>
              Generate an ERP report
            </strong>
            Pick a category, report type, optional stores, and date range to load the data.
          </div>
        )}
      </div>

      {isErrorOpen && (
        <ErrorModal isOpen={isErrorOpen} message={error} onClose={closeError} />
      )}
    </>
  );
}

export default ErpReports;
