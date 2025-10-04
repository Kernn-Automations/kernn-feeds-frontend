import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import styles from "./TargetReports.module.css";
import xls from "../../../images/xls-png.png";
import pdf from "../../../images/pdf-png.png";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import { 
  FaBullseye as FaTarget, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartLine, 
  FaPlus,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaUserTie,
  FaInbox,
  FaDownload,
  FaFileExcel,
  FaFilePdf
} from "react-icons/fa";

function TargetReports({ navigate }) {
  const { axiosAPI } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || "";

  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(false);

  // Filters for API calls
  const [filters, setFilters] = useState({
    divisionId: null,
    zoneId: null,
    subZoneId: null,
    teamId: null,
    employeeId: null,
    customerId: null,
    startDate: null,
    endDate: null
  });
  
  // Options for dropdowns
  const [options, setOptions] = useState({
    divisions: [],
    zones: [],
    subzones: [],
    teams: [],
    employees: [],
    customers: []
  });

  const closeError = () => setIsErrorOpen(false);
  const refresh = () => setTrigger((t) => !t);

  useEffect(() => {
    loadDropdownOptions();
    fetchActiveTargetsWithAssignments();
  }, [trigger]);

  // Load dropdown options for filtering
  const loadDropdownOptions = async () => {
    try {
      const response = await axiosAPI.get('/target-reports/options');
      console.log('Target Reports options response:', response.data);
      if (response.data.success && response.data.data) {
        setOptions(response.data.data);
      } else if (response.data) {
        setOptions(response.data);
      }
    } catch (error) {
      console.error('Error loading dropdown options:', error);
      // Fallback to sample data if API fails
      setOptions({
        divisions: [
          { id: 1, name: "Division 1" },
          { id: 2, name: "Division 2" },
          { id: 3, name: "Division 3" }
        ],
        zones: [],
        subzones: [],
        teams: [],
        employees: [],
        customers: []
      });
    }
  };

  // Load zones when division changes
  const loadZones = async (divisionId) => {
    if (!divisionId) return;
    try {
      const response = await axiosAPI.get(`/target-reports/zones?divisionId=${divisionId}`);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, zones: response.data.data, subzones: [], teams: [], employees: [] }));
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  // Load subzones when zone changes
  const loadSubZones = async (zoneId) => {
    if (!zoneId) return;
    try {
      const response = await axiosAPI.get(`/target-reports/subzones?zoneId=${zoneId}`);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, subzones: response.data.data, teams: [], employees: [] }));
      }
    } catch (error) {
      console.error('Error loading subzones:', error);
    }
  };

  // Load teams when subzone changes
  const loadTeams = async (subZoneId) => {
    if (!subZoneId) return;
    try {
      const response = await axiosAPI.get(`/target-reports/teams?subZoneId=${subZoneId}`);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, teams: response.data.data, employees: [] }));
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  // Load employees when team changes
  const loadEmployees = async (teamId) => {
    if (!teamId) return;
    try {
      const response = await axiosAPI.get(`/target-reports/employees?teamId=${teamId}`);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, employees: response.data.data }));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  // Load customers
  const loadCustomers = async () => {
    try {
      const response = await axiosAPI.get('/target-reports/customers');
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, customers: response.data.data }));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const fetchActiveTargetsWithAssignments = async () => {
    try {
      setLoading(true);
      console.log("Fetching active targets with filters:", filters);
      
      // Build query parameters
      const params = {
        status: 'active',
        ...filters,
        showAll: showAll
      };
      
      // Remove null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/target-reports/targets${queryString ? '?' + queryString : ''}`;
      
      console.log("API endpoint:", endpoint);
      
      // 1) Fetch filtered targets
      let res;
      try {
        res = await axiosAPI.get(endpoint);
      } catch (filterError) {
        console.log("Failed with filters, trying basic endpoint:", filterError);
        // Fallback: try basic targets endpoint
        res = await axiosAPI.get("/targets/targets?status=active");
      }
      console.log("Targets API response:", res.data);
      
      const rows = Array.isArray(res.data?.targets)
        ? res.data.targets
        : Array.isArray(res.data)
        ? res.data
        : [];

      console.log("Parsed targets rows:", rows);

      if (rows.length === 0) {
        console.log("No targets found");
        setTargets([]);
        return;
      }

      // 2) For each target, fetch assignments via NEW endpoint using absolute backend URL
      const enriched = await Promise.all(
        rows.map(async (t) => {
          try {
            const url = `${API_BASE}/targets/${t.id}/assignments`;
            console.log("Fetching assignments for target:", t.id, "URL:", url);
            const ar = await axiosAPI.get(url);
            const assignments = Array.isArray(ar.data?.assignments)
              ? ar.data.assignments
              : Array.isArray(ar.data)
              ? ar.data
              : [];
            return { ...t, __assignments: assignments };
          } catch (_e) {
            console.log("Failed to fetch assignments for target:", t.id, _e);
            return { ...t, __assignments: [] };
          }
        })
      );

      console.log("Final enriched targets:", enriched);
      setTargets(enriched);
    } catch (e) {
      console.error("Error fetching targets:", e);
      setError(e?.response?.data?.message || "Failed to fetch targets");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    // Load dependent dropdowns
    if (field === 'divisionId') {
      loadZones(value);
      setFilters(prev => ({ ...prev, zoneId: null, subZoneId: null, teamId: null, employeeId: null }));
    } else if (field === 'zoneId') {
      loadSubZones(value);
      setFilters(prev => ({ ...prev, subZoneId: null, teamId: null, employeeId: null }));
    } else if (field === 'subZoneId') {
      loadTeams(value);
      setFilters(prev => ({ ...prev, teamId: null, employeeId: null }));
    } else if (field === 'teamId') {
      loadEmployees(value);
      setFilters(prev => ({ ...prev, employeeId: null }));
    }
  };

  // Submit filters
  const onSubmit = () => {
    console.log('onSubmit called - showAll:', showAll, 'filters:', filters);
    fetchActiveTargetsWithAssignments();
    if (showAll) {
      setIsDetailedView(true);
    }
  };

  // Export functions
  const handleExportToPDF = async () => {
    try {
      const params = {
        ...filters,
        showAll: showAll,
        format: 'pdf'
      };
      
      // Remove null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      const queryString = new URLSearchParams(params).toString();
      const response = await axiosAPI.get(`/target-reports/export/pdf?${queryString}`, {
        responseType: 'blob'
      });
      
      handleExportPDF(response.data, 'target-reports.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setError('Failed to export PDF');
      setIsErrorOpen(true);
    }
  };

  const handleExportToExcel = async () => {
    try {
      const params = {
        ...filters,
        showAll: showAll,
        format: 'excel'
      };
      
      // Remove null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      const queryString = new URLSearchParams(params).toString();
      const response = await axiosAPI.get(`/target-reports/export/excel?${queryString}`, {
        responseType: 'blob'
      });
      
      handleExportExcel(response.data, 'target-reports.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export Excel');
      setIsErrorOpen(true);
    }
  };

  const renderParticulars = (row) => {
    const assignments = Array.isArray(row?.__assignments) ? row.__assignments : [];

    if (assignments.length) {
      const names = assignments
        .map((a) => {
          if (a.assignmentType === "team" && a.team) return a.team.name;
          if (a.assignmentType === "employee" && a.employee) return a.employee.name;
          if (a.team) return a.team.name;
          if (a.employee) return a.employee.name;
          return null;
        })
        .filter(Boolean);
      if (names.length) return names.join(", ");
    }

    const teamNames = Array.isArray(row?.assignedTeams)
      ? row.assignedTeams.map((t) => t.name).filter(Boolean)
      : [];
    const employeeNames = Array.isArray(row?.assignedEmployees)
      ? row.assignedEmployees.map((e) => e.name).filter(Boolean)
      : [];
    const names = [...teamNames, ...employeeNames];
    return names.length ? names.join(", ") : "-";
  };

  const renderTargetNumber = (row) => {
    if (row?.budgetNumber != null) return row.budgetNumber.toLocaleString();
    return "-";
  };

  const renderTargetUnit = (row) => {
    return row?.budgetUnit || "-";
  };

  const renderAssignedOn = (row) => {
    if (row?.startDate) {
      return new Date(row.startDate).toLocaleDateString('en-IN');
    }
    if (row?.createdAt) {
      return new Date(row.createdAt).toLocaleDateString('en-IN');
    }
    return "-";
  };

  const renderDeadline = (row) => {
    if (row?.endDate) {
      return new Date(row.endDate).toLocaleDateString('en-IN');
    }
    return "-";
  };

  const renderCurrentlyMet = (row) => {
    const assignments = Array.isArray(row?.__assignments) ? row.__assignments : [];
    if (assignments.length) {
      const sumProgress = assignments
        .map((a) => (a.currentProgress != null ? Number(a.currentProgress) : 0))
        .reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
      if (sumProgress > 0) return sumProgress.toLocaleString();
    }
    return "0";
  };

  return (
    <div className={styles.targetReportsContainer}>
      {/* Simple Breadcrumb and Create Button */}
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i className="bi bi-chevron-right"></i> Target-Reports
      </p>

      {/* Filters Section */}
      <div className="row m-0 p-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 d-flex align-items-center">
                <FaFilter className="me-2" />
                Target Reports Filters
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Division Filter */}
                <div className="col-md-3">
                  <label className="form-label">Division</label>
                  <select 
                    className="form-select"
                    value={filters.divisionId || ''}
                    onChange={(e) => handleFilterChange('divisionId', e.target.value || null)}
                  >
                    <option value="">All Divisions</option>
                    {options.divisions.map(division => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zone Filter */}
                <div className="col-md-3">
                  <label className="form-label">Zone</label>
                  <select 
                    className="form-select"
                    value={filters.zoneId || ''}
                    onChange={(e) => handleFilterChange('zoneId', e.target.value || null)}
                    disabled={!filters.divisionId}
                  >
                    <option value="">All Zones</option>
                    {options.zones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SubZone Filter */}
                <div className="col-md-3">
                  <label className="form-label">Sub Zone</label>
                  <select 
                    className="form-select"
                    value={filters.subZoneId || ''}
                    onChange={(e) => handleFilterChange('subZoneId', e.target.value || null)}
                    disabled={!filters.zoneId}
                  >
                    <option value="">All Sub Zones</option>
                    {options.subzones.map(subzone => (
                      <option key={subzone.id} value={subzone.id}>
                        {subzone.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team Filter */}
                <div className="col-md-3">
                  <label className="form-label">Team</label>
                  <select 
                    className="form-select"
                    value={filters.teamId || ''}
                    onChange={(e) => handleFilterChange('teamId', e.target.value || null)}
                    disabled={!filters.subZoneId}
                  >
                    <option value="">All Teams</option>
                    {options.teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Filter */}
                <div className="col-md-3">
                  <label className="form-label">Employee</label>
                  <select 
                    className="form-select"
                    value={filters.employeeId || ''}
                    onChange={(e) => handleFilterChange('employeeId', e.target.value || null)}
                    disabled={!filters.teamId}
                  >
                    <option value="">All Employees</option>
                    {options.employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Filter */}
                <div className="col-md-3">
                  <label className="form-label">Customer</label>
                  <select 
                    className="form-select"
                    value={filters.customerId || ''}
                    onChange={(e) => handleFilterChange('customerId', e.target.value || null)}
                  >
                    <option value="">All Customers</option>
                    {options.customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filters */}
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row mt-3">
                <div className="col-12 d-flex gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={onSubmit}
                    disabled={loading}
                  >
                    <FaSearch className="me-2" />
                    Apply Filters
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={handleExportToExcel}
                    disabled={loading || targets.length === 0}
                  >
                    <img src={xls} alt="Excel" width="16" height="16" className="me-2" />
                    Export Excel
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={handleExportToPDF}
                    disabled={loading || targets.length === 0}
                  >
                    <img src={pdf} alt="PDF" width="16" height="16" className="me-2" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show All Checkbox */}
      <div className="row m-0 p-3">
        <div className="col-12 d-flex align-items-center gap-2">
          <input
            type="checkbox"
            id="showAllTargets"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          <label htmlFor="showAllTargets" className="mb-0">Show All Target Details</label>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingCard}>
            <Loading />
            <p className={styles.loadingText}>Loading active targets...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-md-12">
            <div className="table-responsive">
              <table className="table table-bordered borderedtable">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Particulars</th>
                    <th>Target Number</th>
                    <th>Target Unit</th>
                    <th>Assigned On</th>
                    <th>Deadline</th>
                    <th>Currently Met</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.length === 0 && (
                    <tr className="animated-row">
                      <td colSpan={7} className="text-center py-4">
                        <div className="text-muted">
                          <i className="bi bi-inbox display-4 d-block mb-2"></i>
                          <h6>No Active Targets Found</h6>
                          <p className="mb-0">Click "Create Target" to add your first target.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {targets.map((row, idx) => (
                    <tr
                      key={row.id || row.targetCode || idx}
                      className="animated-row"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <td className="text-center">{idx + 1}</td>
                      <td>
                        <div>
                          <div className="fw-medium text-primary">
                            {row.name || 'Unnamed Target'}
                          </div>
                          <div className="text-muted small">
                            {renderParticulars(row)}
                          </div>
                          {row.targetType && (
                            <span className={`badge ${
                              row.targetType === 'sales' ? 'bg-success' : 
                              row.targetType === 'customer' ? 'bg-info' : 'bg-secondary'
                            } mt-1`}>
                              {row.targetType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-end fw-medium">
                        {renderTargetNumber(row)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {renderTargetUnit(row)}
                        </span>
                      </td>
                      <td>{renderAssignedOn(row)}</td>
                      <td>
                        <span className={`badge ${
                          new Date(row.endDate) < new Date() ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {renderDeadline(row)}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end">
                          <span className="fw-medium me-2">
                            {renderCurrentlyMet(row)}
                          </span>
                          {row.budgetNumber && (
                            <div className="progress" style={{ width: '60px', height: '6px' }}>
                              <div
                                className={`progress-bar ${
                                  (renderCurrentlyMet(row) / row.budgetNumber) * 100 >= 100 ? 'bg-success' :
                                  (renderCurrentlyMet(row) / row.budgetNumber) * 100 >= 75 ? 'bg-info' :
                                  (renderCurrentlyMet(row) / row.budgetNumber) * 100 >= 50 ? 'bg-warning' : 'bg-danger'
                                }`}
                                role="progressbar"
                                style={{ 
                                  width: `${Math.min((renderCurrentlyMet(row) / row.budgetNumber) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorOpen && (
        <ErrorModal isOpen={isErrorOpen} message={error} onClose={closeError} />
      )}
    </div>
  );
}

export default TargetReports;