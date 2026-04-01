import React, { useMemo, useState } from "react";
import ErrorModal from "@/components/ErrorModal";
import erpReportsService, {
  REPORT_CATEGORIES,
  REPORT_TYPES,
} from "@/services/erpReportsService";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  FileText,
  Filter,
  LayoutGrid,
  Store,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   STYLES (match Inventory -> Current Stock page)
═══════════════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

  .cs-page * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
  .cs-page {
    background: #f0f4fa;
    min-height: 100vh;
    padding: 0 0 48px;
  }

  .cs-loader-overlay {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(240,244,250,0.92);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: loaderFadeIn 0.25s ease;
  }
  @keyframes loaderFadeIn { from { opacity:0 } to { opacity:1 } }
  .cs-loader-card {
    background: #fff;
    border-radius: 24px;
    padding: 34px 40px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    box-shadow: 0 8px 48px rgba(0,49,118,0.16), 0 2px 8px rgba(0,49,118,0.08);
    border: 1px solid rgba(0,49,118,0.08);
    min-width: 320px;
    animation: loaderCardIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes loaderCardIn {
    from { opacity:0; transform:scale(0.9) translateY(16px) }
    to   { opacity:1; transform:scale(1) translateY(0) }
  }
  .cs-loader-bar {
    width: 160px; height: 4px; border-radius: 99px; overflow: hidden;
    background: #edf0f7;
  }
  .cs-loader-bar::after {
    content: '';
    display: block;
    height: 100%;
    width: 40%;
    background: linear-gradient(to right, transparent, #003176, #22a634, transparent);
    border-radius: 99px;
    animation: scanMove 1.4s ease-in-out infinite;
  }
  @keyframes scanMove { 0% { transform: translateX(-120%) } 100% { transform: translateX(360%) } }
  .cs-loader-text { font-size: 14px; font-weight: 700; color: #1a2236; }
  .cs-loader-sub { font-size: 12px; color: #7a88a8; }

  .cs-breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: #7a88a8; padding: 16px 28px 0;
  }
  .cs-breadcrumb-link {
    cursor: pointer; transition: color 0.15s;
    display: flex; align-items: center; gap: 4px;
  }
  .cs-breadcrumb-link:hover { color: #003176; }
  .cs-breadcrumb .sep { color: #c0c8dc; }
  .cs-breadcrumb .active { color: #003176; font-weight: 600; }

  .cs-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 16px 28px 0; flex-wrap: wrap; gap: 14px;
  }
  .cs-page-title h1 {
    font-size: 24px; font-weight: 700; color: #0d1a36; margin: 0;
    letter-spacing: -0.025em; line-height: 1.2;
  }
  .cs-page-title p { font-size: 13px; color: #7a88a8; margin: 4px 0 0; }

  .cs-pill-row {
    display: flex; flex-wrap: wrap; gap: 8px;
    padding: 8px 28px 0; font-size: 11.5px;
  }
  .cs-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 3px 10px; border-radius: 999px;
    background: rgba(0,49,118,0.05); color: #003176;
    border: 1px solid rgba(0,49,118,0.12);
    font-weight: 600;
  }
  .cs-pill span.key { text-transform: uppercase; letter-spacing: 0.06em; font-size: 10px; color: #7a88a8; }
  .cs-pill span.val { font-size: 11.5px; }

  .cs-toolbar-card {
    margin: 18px 28px 0;
    background: radial-gradient(circle at top left, rgba(0,49,118,0.06), transparent 55%), #ffffff;
    border-radius: 16px;
    border: 1px solid rgba(0,49,118,0.08);
    box-shadow: 0 6px 24px rgba(15, 23, 42, 0.12);
  }

  .cs-toolbar {
    display: flex; align-items: flex-end; gap: 12px;
    padding: 20px 28px 0; flex-wrap: wrap;
  }
  .cs-toolbar-field { display: flex; flex-direction: column; gap: 5px; }
  .cs-toolbar-field label {
    font-size: 10.5px; font-weight: 700; color: #4a5878;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .cs-input, .cs-select {
    padding: 9px 12px;
    border: 1.5px solid #d0d8ee;
    border-radius: 10px;
    font-size: 13px;
    font-family: inherit;
    color: #1a2236;
    background: #fff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    min-width: 190px;
  }
  .cs-input:focus, .cs-select:focus {
    border-color: #003176;
    box-shadow: 0 0 0 3px rgba(0,49,118,0.1);
  }

  .cs-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.16s; border: none; white-space: nowrap;
  }
  .cs-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .cs-btn-primary { background: linear-gradient(135deg,#003176,#004299); color:#fff; box-shadow:0 2px 8px rgba(0,49,118,0.22); }
  .cs-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg,#00276a,#003c8a); transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,49,118,0.3); }
  .cs-btn-ghost { background:#fff; color:#4a5878; border:1.5px solid #d0d8ee; }
  .cs-btn-ghost:hover:not(:disabled) { border-color:#003176; color:#003176; }

  .cs-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 10px; border-radius: 999px;
    background: rgba(0,49,118,0.07);
    border: 1px solid rgba(0,49,118,0.15);
    color: #003176; font-size: 12px; font-weight: 600;
  }
  .cs-chip input { margin: 0; }

  .cs-table-wrap {
    margin: 20px 28px 0;
    background: #fff; border-radius: 16px;
    border: 1px solid rgba(0,49,118,0.08);
    box-shadow: 0 2px 12px rgba(0,49,118,0.05);
    overflow: hidden;
  }
  .cs-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid #edf0f7;
    background: linear-gradient(to right, rgba(0,49,118,0.025), transparent);
    flex-wrap: wrap; gap: 8px;
  }
  .cs-table-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 700; color: #0d1a36;
  }
  .cs-count-badge {
    font-size: 11px; font-weight: 700; padding: 2px 9px;
    background: rgba(0,49,118,0.08); color: #003176; border-radius: 99px;
  }
  .cs-filter-badge {
    font-size: 11px; font-weight: 600; padding: 2px 9px;
    background: rgba(34,166,52,0.1); color: #22a634; border-radius: 99px;
  }
  .cs-table {
    width: 100%;
    border-collapse: collapse;
  }
  .cs-table thead tr { background: #f7f9fd; }
  .cs-table thead th {
    padding: 10px 14px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em; color: #8a94b0;
    border-bottom: 1px solid #edf0f7; white-space: nowrap;
    position: sticky; top: 0; background: #f7f9fd; z-index: 2;
  }
  .cs-table tbody tr { border-bottom: 1px solid #f0f3fa; transition: background 0.1s; }
  .cs-table tbody tr:hover { background: #f7faff; }
  .cs-table tbody td {
    padding: 11px 14px; font-size: 13px; color: #2a3452; vertical-align: middle;
  }
  .cs-pre {
    max-height: 520px;
    overflow: auto;
    background: #0b1020;
    color: #e8eefc;
    padding: 12px;
    border-radius: 12px;
    font-size: 12px;
    margin: 14px 18px 18px;
  }

  @media (max-width: 768px) {
    .cs-breadcrumb, .cs-page-header { padding-left: 16px; padding-right: 16px; }
    .cs-toolbar-card { margin-left: 16px; margin-right: 16px; }
    .cs-table-wrap { margin-left: 16px; margin-right: 16px; }
    .cs-input, .cs-select { min-width: 150px; }
  }
`;

const CATEGORY_TO_TYPES = {
  [REPORT_CATEGORIES.sales]: [
    REPORT_TYPES.comparison,
    REPORT_TYPES.summary,
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
  [REPORT_CATEGORIES.returns]: [],
  [REPORT_CATEGORIES.damage]: [],
  [REPORT_CATEGORIES.assets]: [],
};

function toISODateInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function normalizeStoreIds(input) {
  if (!input) return [];
  return input
    .split(/[,\s]+/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function prettifyKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function extractTableRows(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  if (payload.data && Array.isArray(payload.data.rows)) return payload.data.rows;
  if (payload.rows && Array.isArray(payload.rows)) return payload.rows;
  return null;
}

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function ErpReports({ navigate }) {
  const today = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => toISODateInputValue(today), [today]);
  const defaultFrom = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 30);
    return toISODateInputValue(d);
  }, [today]);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [reportCategory, setReportCategory] = useState(REPORT_CATEGORIES.sales);
  const [reportType, setReportType] = useState(REPORT_TYPES.summary);
  const [customReportType, setCustomReportType] = useState("");
  const [storeIdsText, setStoreIdsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const [result, setResult] = useState(null);
  const [showRaw, setShowRaw] = useState(true);

  const reportTypeOptions = CATEGORY_TO_TYPES[reportCategory] || [];
  const reportTypeRequired = reportTypeOptions.length > 0;

  const effectiveReportType = reportTypeRequired
    ? reportType
    : customReportType?.trim() || undefined;

  const closeError = () => setIsErrorOpen(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setResult(null);

      if (!fromDate || !toDate) {
        setError("Please select From Date and To Date");
        setIsErrorOpen(true);
        return;
      }

      if (new Date(fromDate) > new Date(toDate)) {
        setError("From Date cannot be after To Date");
        setIsErrorOpen(true);
        return;
      }

      if (reportTypeRequired && !reportType) {
        setError("Please select a report type");
        setIsErrorOpen(true);
        return;
      }

      const storeIds = normalizeStoreIds(storeIdsText);

      const res = await erpReportsService.getErpReport({
        fromDate,
        toDate,
        reportCategory,
        reportType: effectiveReportType,
        storeIds,
      });

      if (!res.success) {
        setError(res.message || "Failed to fetch ERP report");
        setIsErrorOpen(true);
        setResult(res.data || null);
        return;
      }

      setResult(res.data);
    } catch (e) {
      setError(e?.message || "Failed to fetch ERP report");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setReportCategory(REPORT_CATEGORIES.sales);
    setReportType(REPORT_TYPES.summary);
    setCustomReportType("");
    setStoreIdsText("");
    setResult(null);
    setShowRaw(true);
  };

  const tableRows = useMemo(() => {
    const rows = extractTableRows(result);
    return Array.isArray(rows) ? rows : null;
  }, [result]);

  const tableColumns = useMemo(() => {
    if (!tableRows || tableRows.length === 0) return [];
    const first = tableRows.find((r) => isPlainObject(r));
    if (!first) return [];
    return Object.keys(first).slice(0, 12);
  }, [tableRows]);

  return (
    <>
      <style>{css}</style>
      <div className="cs-page">
        {loading && (
          <div className="cs-loader-overlay">
            <div className="cs-loader-card">
              <div className="cs-loader-text">Fetching ERP report</div>
              <div className="cs-loader-sub">
                Applying filters and loading data…
              </div>
              <div className="cs-loader-bar" />
            </div>
          </div>
        )}

        <div className="cs-breadcrumb">
          <span
            className="cs-breadcrumb-link"
            onClick={() => navigate("/reports")}
          >
            <LayoutGrid size={13} /> Reports
          </span>
          <ChevronRight size={12} className="sep" />
          <span className="active">ERP Reports</span>
        </div>

        <div className="cs-page-header">
          <div className="cs-page-title">
            <h1>ERP Reports</h1>
            <p>Generate sales, inventory, finance and other ERP reports from your backend.</p>
          </div>
        </div>

        <div className="cs-toolbar-card">
          <div className="cs-toolbar">
            <div className="cs-toolbar-field">
              <label htmlFor="fromDate">
                <Calendar size={12} style={{ marginRight: 6 }} />
                From Date
              </label>
              <input
                id="fromDate"
                className="cs-input"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="cs-toolbar-field">
              <label htmlFor="toDate">
                <Calendar size={12} style={{ marginRight: 6 }} />
                To Date
              </label>
              <input
                id="toDate"
                className="cs-input"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="cs-toolbar-field">
              <label htmlFor="reportCategory">
                <FileText size={12} style={{ marginRight: 6 }} />
                Category
              </label>
              <select
                id="reportCategory"
                className="cs-select"
                value={reportCategory}
                onChange={(e) => {
                  const next = e.target.value;
                  setReportCategory(next);
                  const nextTypes = CATEGORY_TO_TYPES[next] || [];
                  if (nextTypes.length > 0) {
                    setReportType(nextTypes[0]);
                    setCustomReportType("");
                  } else {
                    setCustomReportType("");
                  }
                }}
              >
                {Object.values(REPORT_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {prettifyKey(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="cs-toolbar-field">
              <label htmlFor="reportType">
                <Filter size={12} style={{ marginRight: 6 }} />
                Type
              </label>
              {reportTypeRequired ? (
                <select
                  id="reportType"
                  className="cs-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {reportTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {prettifyKey(t)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="reportType"
                  className="cs-input"
                  type="text"
                  placeholder="optional"
                  value={customReportType}
                  onChange={(e) => setCustomReportType(e.target.value)}
                />
              )}
            </div>

            <div className="cs-toolbar-field">
              <label htmlFor="storeIds">
                <Store size={12} style={{ marginRight: 6 }} />
                Store Ids
              </label>
              <input
                id="storeIds"
                className="cs-input"
                type="text"
                placeholder="e.g. 1,2,3"
                value={storeIdsText}
                onChange={(e) => setStoreIdsText(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <button className="cs-btn cs-btn-primary" onClick={onSubmit} disabled={loading}>
                <BarChart3 size={14} /> Generate
              </button>
              <button className="cs-btn cs-btn-ghost" onClick={onCancel} disabled={loading}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="cs-pill-row">
          <div className="cs-pill">
            <span className="key">Range</span>
            <span className="val">
              {fromDate} → {toDate}
            </span>
          </div>
          <div className="cs-pill">
            <span className="key">Category</span>
            <span className="val">{prettifyKey(reportCategory)}</span>
          </div>
          <div className="cs-pill">
            <span className="key">Type</span>
            <span className="val">
              {prettifyKey(
                (reportTypeRequired ? reportType : customReportType) || "Any"
              )}
            </span>
          </div>
          {storeIdsText && (
            <div className="cs-pill">
              <span className="key">Stores</span>
              <span className="val">{storeIdsText}</span>
            </div>
          )}
        </div>

        {!loading && result && (
          <div className="cs-table-wrap">
            <div className="cs-table-header">
              <div className="cs-table-title">
                <BarChart3 size={15} color="#003176" />
                Result
                {tableRows?.length ? (
                  <span className="cs-count-badge">{tableRows.length} rows</span>
                ) : null}
                <span className="cs-filter-badge">
                  <Filter size={10} /> Filtered
                </span>
              </div>
              <label className="cs-chip">
                <input
                  id="showRaw"
                  type="checkbox"
                  checked={showRaw}
                  onChange={(e) => setShowRaw(e.target.checked)}
                />
                Show raw JSON
              </label>
            </div>

            {tableRows && tableRows.length > 0 && tableColumns.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table className="cs-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      {tableColumns.map((c) => (
                        <th key={c}>{prettifyKey(c)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.slice(0, 200).map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        {tableColumns.map((c) => {
                          const v = row?.[c];
                          const cell =
                            v === null || v === undefined
                              ? "-"
                              : typeof v === "object"
                                ? JSON.stringify(v)
                                : String(v);
                          return <td key={c}>{cell}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showRaw && <pre className="cs-pre">{JSON.stringify(result, null, 2)}</pre>}
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
