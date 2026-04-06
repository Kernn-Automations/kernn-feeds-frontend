import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import logService from "../../../services/logService";
import { getUserFromStorage, isSuperAdmin } from "../../../utils/roleUtils";

const formatDateInput = (date) => date.toISOString().slice(0, 10);

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    return String(value);
  }
};

const badgeStyles = {
  info: { background: "#e6f4ff", color: "#0958d9" },
  warn: { background: "#fff7e6", color: "#d46b08" },
  error: { background: "#fff1f0", color: "#cf1322" },
};

const methodStyles = {
  GET: { background: "#eef2ff", color: "#3730a3" },
  POST: { background: "#ecfdf3", color: "#027a48" },
  PUT: { background: "#fff7e6", color: "#b54708" },
  PATCH: { background: "#f5f3ff", color: "#6d28d9" },
  DELETE: { background: "#fff1f0", color: "#cf1322" },
};

const prettyJson = (value) => {
  if (value == null) return "No data";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

const buildPreviewText = (log) => {
  const chunks = [
    log.error_message ? `Error: ${log.error_message}` : "",
    log.requestBodyPreview ? `Request: ${log.requestBodyPreview}` : "",
    log.responseBodyPreview ? `Response: ${log.responseBodyPreview}` : "",
  ].filter(Boolean);

  return chunks.length ? chunks.join("\n\n") : "-";
};

const buildVerificationUrl = (filters) => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, value);
  });
  return `${window.location.origin}/settings/logs${params.toString() ? `?${params.toString()}` : ""}`;
};

function LogsViewer() {
  const navigate = useNavigate();
  const storedUser = getUserFromStorage();
  const user = storedUser?.user || storedUser;
  const canViewLogs = isSuperAdmin(user);

  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const [filters, setFilters] = useState({
    fromDate: formatDateInput(weekAgo),
    toDate: formatDateInput(today),
    employeeId: "",
    method: "",
    logType: "",
    statusCode: "",
    search: "",
  });
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ info: 0, warn: 0, error: 0 });
  const [filterOptions, setFilterOptions] = useState({ users: [], methods: [], logTypes: [] });
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState("");

  const loadLogs = async (page = 1, activeFilters = filters, limit = pagination.limit) => {
    try {
      setLoading(true);
      setError("");
      const response = await logService.getLogs({
        ...activeFilters,
        page,
        limit,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load logs");
      }

      setLogs(response.data || []);
      setPagination(response.pagination || { page: 1, limit, total: 0, totalPages: 1 });
      setStats(response.stats || { info: 0, warn: 0, error: 0 });
    } catch (err) {
      console.error("Failed to load logs:", err);
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await logService.getLogFilters();
      if (!response?.success) return;
      setFilterOptions(response.data || { users: [], methods: [], logTypes: [] });
    } catch (err) {
      console.error("Failed to load log filter options:", err);
    }
  };

  useEffect(() => {
    if (!canViewLogs) return;
    loadFilterOptions();
    loadLogs(1);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadLogs(1, filters);
  };

  const handleReset = () => {
    const nextFilters = {
      fromDate: formatDateInput(weekAgo),
      toDate: formatDateInput(today),
      employeeId: "",
      method: "",
      logType: "",
      statusCode: "",
      search: "",
    };
    setFilters(nextFilters);
    loadLogs(1, nextFilters);
  };

  const openLogDetail = async (logId) => {
    try {
      setDetailLoading(true);
      setError("");
      const response = await logService.getLogDetail(logId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load log detail");
      }
      setSelectedLog(response.data);
    } catch (err) {
      console.error("Failed to load log detail:", err);
      setError(err.message || "Failed to load log detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const exportToPdf = async () => {
    try {
      setLoading(true);
      const response = await logService.getLogs({
        ...filters,
        page: 1,
        limit: 500,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to export logs");
      }

      const rows = response.data || [];
      const verificationUrl = buildVerificationUrl(filters);
      const qrBase64 = verificationUrl ? await QRCode.toDataURL(verificationUrl) : null;
      const downloadedBy = user?.name || user?.employeeId || user?.email || "Super Admin";
      const exportedAt = formatDateTime(new Date().toISOString());
      const doc = new jsPDF("l", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;

      doc.setFillColor(17, 70, 148);
      doc.rect(0, 0, pageWidth, 120, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("System Logs Report", margin, 48);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Incident traceability and API activity export", margin, 72);
      doc.text(`Downloaded by: ${downloadedBy}`, margin, 92);
      doc.text(`Downloaded at: ${exportedAt}`, margin, 110);

      doc.setTextColor(24, 24, 27);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, 150, 350, 180, 12, 12, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Report Summary", margin + 20, 180);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Date Range: ${filters.fromDate || "-"} to ${filters.toDate || "-"}`, margin + 20, 210);
      doc.text(`Total Requests: ${rows.length}`, margin + 20, 230);
      doc.text(`Info Logs: ${response.stats?.info || 0}`, margin + 20, 250);
      doc.text(`Warnings: ${response.stats?.warn || 0}`, margin + 20, 270);
      doc.text(`Errors: ${response.stats?.error || 0}`, margin + 20, 290);
      doc.text(`Filters Applied:`, margin + 20, 315);
      const filterSummary = [
        filters.employeeId ? `User ${filters.employeeId}` : "All users",
        filters.method || "All methods",
        filters.logType || "All types",
        filters.statusCode ? `Status ${filters.statusCode}` : "All statuses",
      ].join(" | ");
      const wrappedFilterSummary = doc.splitTextToSize(filterSummary, 300);
      doc.text(wrappedFilterSummary, margin + 20, 333);

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 280, 150, 240, 180, 12, 12, "F");
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(pageWidth - 280, 150, 240, 180, 12, 12, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Verification QR", pageWidth - 260, 180);
      if (qrBase64) {
        doc.addImage(qrBase64, "PNG", pageWidth - 245, 195, 110, 110);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const qrText = verificationUrl || "Verification URL unavailable";
      const qrWrapped = doc.splitTextToSize(qrText, 210);
      doc.text(qrWrapped, pageWidth - 260, 320);
      doc.setFontSize(8);
      doc.text("Scan to reopen the exact filtered log report.", pageWidth - 260, 350);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Generated for fault analysis, audit review, and incident reconstruction.", margin, pageHeight - 30);

      autoTable(doc, {
        startY: 360,
        theme: "grid",
        body: rows.flatMap((row, index) => {
          const logUser = row.employee_name || row.employee_id || "PUBLIC_USER";
          const previewText = buildPreviewText(row);
          return [
            [
              {
                content: `#${index + 1}  ${row.api_method || "-"}  ${row.api_url || "-"}`,
                colSpan: 2,
                styles: {
                  fillColor: [17, 70, 148],
                  textColor: [255, 255, 255],
                  fontStyle: "bold",
                  fontSize: 10,
                  cellPadding: 7,
                },
              },
            ],
            [
              { content: "Time", styles: { fontStyle: "bold", cellWidth: 100 } },
              { content: formatDateTime(row.timestamp) },
            ],
            [
              { content: "User", styles: { fontStyle: "bold" } },
              { content: `${logUser}${row.employee_email ? ` | ${row.employee_email}` : ""}` },
            ],
            [
              { content: "Status / Type", styles: { fontStyle: "bold" } },
              { content: `${row.status_code ?? "-"} / ${row.log_type || "-"}` },
            ],
            [
              { content: "URL", styles: { fontStyle: "bold" } },
              { content: row.api_url || "-" },
            ],
            [
              { content: "Preview", styles: { fontStyle: "bold" } },
              { content: previewText },
            ],
          ];
        }),
        styles: {
          fontSize: 9,
          cellPadding: 6,
          overflow: "linebreak",
          valign: "top",
          lineColor: [226, 232, 240],
        },
        columnStyles: {
          0: { cellWidth: 110, fillColor: [248, 250, 252] },
          1: { cellWidth: pageWidth - (margin * 2) - 110 },
        },
        margin: { top: 360, left: margin, right: margin, bottom: 40 },
        rowPageBreak: "avoid",
        didDrawPage: ({ pageNumber }) => {
          if (pageNumber === 1) return;
          doc.setFillColor(17, 70, 148);
          doc.rect(0, 0, pageWidth, 32, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.text("System Logs Report", margin, 21);
          doc.setTextColor(24, 24, 27);
        },
      });

      doc.save(`system-logs-${filters.fromDate || "from"}-to-${filters.toDate || "to"}.pdf`);
    } catch (err) {
      console.error("Failed to export logs PDF:", err);
      setError(err.message || "Failed to export logs PDF");
    } finally {
      setLoading(false);
    }
  };

  const users = useMemo(() => filterOptions.users || [], [filterOptions.users]);

  if (!canViewLogs) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger mb-0">
          Only Super Admin can access system logs.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-secondary" onClick={() => navigate("/settings")}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <div>
            <h2 className="mb-1">System Logs</h2>
            <div className="text-muted">Super Admin activity and API trace viewer</div>
          </div>
        </div>
        <button className="btn btn-danger" onClick={exportToPdf} disabled={loading}>
          {loading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Info Logs</div>
              <div className="fs-2 fw-bold text-primary">{stats.info || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Warnings</div>
              <div className="fs-2 fw-bold" style={{ color: "#d46b08" }}>{stats.warn || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Errors</div>
              <div className="fs-2 fw-bold text-danger">{stats.error || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-2">
              <label className="form-label fw-bold">From</label>
              <input
                type="date"
                className="form-control"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                max={formatDateInput(today)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">To</label>
              <input
                type="date"
                className="form-control"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                max={formatDateInput(today)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">User</label>
              <select
                className="form-select"
                value={filters.employeeId}
                onChange={(e) => handleFilterChange("employeeId", e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((option) => (
                  <option key={`${option.employee_id}-${option.employee_name}`} value={option.employee_id || ""}>
                    {option.employee_name || option.employee_id}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Method</label>
              <select
                className="form-select"
                value={filters.method}
                onChange={(e) => handleFilterChange("method", e.target.value)}
              >
                <option value="">All Methods</option>
                {(filterOptions.methods || []).map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Type</label>
              <select
                className="form-select"
                value={filters.logType}
                onChange={(e) => handleFilterChange("logType", e.target.value)}
              >
                <option value="">All Types</option>
                {(filterOptions.logTypes || []).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Status</label>
              <input
                type="number"
                className="form-control"
                value={filters.statusCode}
                onChange={(e) => handleFilterChange("statusCode", e.target.value)}
                placeholder="200 / 500"
              />
            </div>
            <div className="col-md-8">
              <label className="form-label fw-bold">Search</label>
              <input
                type="text"
                className="form-control"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="URL, user, employee id, error message..."
              />
            </div>
            <div className="col-md-4 d-flex align-items-end gap-2">
              <button className="btn btn-success" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Apply Filters"}
              </button>
              <button className="btn btn-outline-secondary" type="button" onClick={handleReset} disabled={loading}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Time</th>
                  <th>Method</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Preview</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No logs found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={log.id}>
                      <td className="fw-semibold text-muted">
                        {((pagination.page - 1) * pagination.limit) + index + 1}
                      </td>
                      <td>{formatDateTime(log.timestamp)}</td>
                      <td>
                        <span
                          className="px-2 py-1 rounded-pill fw-semibold small"
                          style={methodStyles[log.api_method] || { background: "#f3f4f6", color: "#374151" }}
                        >
                          {log.api_method}
                        </span>
                      </td>
                      <td style={{ minWidth: 320, maxWidth: 420, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        <div className="fw-semibold text-dark">{log.api_url || "-"}</div>
                      </td>
                      <td>{log.status_code}</td>
                      <td>
                        <span
                          className="px-2 py-1 rounded-pill fw-semibold small"
                          style={badgeStyles[log.log_type] || { background: "#f3f4f6", color: "#374151" }}
                        >
                          {log.log_type}
                        </span>
                      </td>
                      <td style={{ minWidth: 220 }}>
                        <div className="fw-semibold">{log.employee_name || log.employee_id || "PUBLIC_USER"}</div>
                        {log.employee_id && <div className="text-muted small">ID: {log.employee_id}</div>}
                        {log.employee_email && <div className="text-muted small">{log.employee_email}</div>}
                      </td>
                      <td style={{ minWidth: 420, maxWidth: 560, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        <div className="small text-dark">{buildPreviewText(log)}</div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openLogDetail(log.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
              Showing page {pagination.page} of {pagination.totalPages} | Total {pagination.total} log(s)
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => loadLogs(pagination.page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => loadLogs(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(15, 23, 42, 0.55)", zIndex: 2000 }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4" style={{ width: "min(1100px, 92vw)", maxHeight: "88vh", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1">Log Detail</h4>
                <div className="text-muted small">{selectedLog.api_url}</div>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-3"><strong>Time:</strong><br />{formatDateTime(selectedLog.timestamp)}</div>
              <div className="col-md-2"><strong>Method:</strong><br />{selectedLog.api_method}</div>
              <div className="col-md-2"><strong>Status:</strong><br />{selectedLog.status_code}</div>
              <div className="col-md-2"><strong>Type:</strong><br />{selectedLog.log_type}</div>
              <div className="col-md-3"><strong>User:</strong><br />{selectedLog.employee_name || selectedLog.employee_id || "PUBLIC_USER"}</div>
            </div>

            {selectedLog.error_message && (
              <div className="alert alert-danger">{selectedLog.error_message}</div>
            )}

            <div className="row g-4">
              <div className="col-lg-6">
                <h5>Request Body</h5>
                <pre
                  className="border rounded-3 p-3 bg-light"
                  style={{ maxHeight: 420, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {prettyJson(selectedLog.request_body)}
                </pre>
              </div>
              <div className="col-lg-6">
                <h5>Response Body</h5>
                <pre
                  className="border rounded-3 p-3 bg-light"
                  style={{ maxHeight: 420, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {prettyJson(selectedLog.response_body)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(15, 23, 42, 0.35)", zIndex: 2100 }}
        >
          <div className="bg-white rounded-4 shadow p-4">Loading log details...</div>
        </div>
      )}
    </div>
  );
}

export default LogsViewer;
