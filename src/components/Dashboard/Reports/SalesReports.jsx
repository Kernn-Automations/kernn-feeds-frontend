import React, { useState, useEffect } from "react";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import xls from "../../../images/xls-png.png";
import pdf from "../../../images/pdf-png.png";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import styles from "../Sales/Sales.module.css";

function SalesReports({ navigate }) {
  const { axiosAPI } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const closeError = () => setIsErrorOpen(false);

  // Data will be fetched from API
  const [simpleData, setSimpleData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);

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

  useEffect(() => {
    // Load initial divisions
    loadDivisions();
    
    // Add sample data for testing while CORS is being fixed
    setOptions(prev => ({
      ...prev,
      divisions: [
        { id: 1, name: "Division 1" },
        { id: 2, name: "Division 2" },
        { id: 3, name: "Division 3" }
      ]
    }));
  }, []);

  // Load divisions
  const loadDivisions = async () => {
    try {
      const response = await axiosAPI.get('/reports/sales/options/divisions');
      console.log('Divisions response:', response.data);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, divisions: response.data.data }));
      } else if (response.data.divisions) {
        setOptions(prev => ({ ...prev, divisions: response.data.divisions }));
      } else if (Array.isArray(response.data)) {
        setOptions(prev => ({ ...prev, divisions: response.data }));
      }
    } catch (error) {
      console.error('Error loading divisions:', error);
      // Fallback to sample data if API fails
      setOptions(prev => ({ 
        ...prev, 
        divisions: [
          { id: 1, name: "Division 1" },
          { id: 2, name: "Division 2" },
          { id: 3, name: "Division 3" }
        ]
      }));
    }
  };

  // Load zones when division changes
  const loadZones = async (divisionId) => {
    if (!divisionId) return;
    try {
      const response = await axiosAPI.get(`/reports/sales/options/zones?parentId=${divisionId}`);
      console.log('Zones response:', response.data);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, zones: response.data.data }));
      } else if (response.data.zones) {
        setOptions(prev => ({ ...prev, zones: response.data.zones }));
      } else if (Array.isArray(response.data)) {
        setOptions(prev => ({ ...prev, zones: response.data }));
      }
    } catch (error) {
      console.error('Error loading zones:', error);
      // Fallback to sample data if API fails
      setOptions(prev => ({ 
        ...prev, 
        zones: [
          { id: 1, name: `Zone 1 (Div ${divisionId})` },
          { id: 2, name: `Zone 2 (Div ${divisionId})` }
        ]
      }));
    }
  };

  // Load sub-zones when zone changes
  const loadSubZones = async (zoneId) => {
    if (!zoneId) return;
    try {
      const response = await axiosAPI.get(`/reports/sales/options/subzones?parentId=${zoneId}`);
      console.log('Sub-zones response:', response.data);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, subzones: response.data.data }));
      } else if (response.data.subZones) {
        setOptions(prev => ({ ...prev, subzones: response.data.subZones }));
      } else if (Array.isArray(response.data)) {
        setOptions(prev => ({ ...prev, subzones: response.data }));
      }
    } catch (error) {
      console.error('Error loading sub-zones:', error);
      // Fallback to sample data if API fails
      setOptions(prev => ({ 
        ...prev, 
        subzones: [
          { id: 1, name: `Sub-Zone 1 (Zone ${zoneId})` },
          { id: 2, name: `Sub-Zone 2 (Zone ${zoneId})` }
        ]
      }));
    }
  };

  // Load teams when sub-zone changes
  const loadTeams = async (subZoneId) => {
    if (!subZoneId) return;
    try {
      const response = await axiosAPI.get(`/reports/sales/options/teams?parentId=${subZoneId}`);
      console.log('Teams response:', response.data);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, teams: response.data.data }));
      } else if (response.data.teams) {
        setOptions(prev => ({ ...prev, teams: response.data.teams }));
      } else if (Array.isArray(response.data)) {
        setOptions(prev => ({ ...prev, teams: response.data }));
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      // Fallback to sample data if API fails
      setOptions(prev => ({ 
        ...prev, 
        teams: [
          { id: 1, name: `Team 1 (SubZone ${subZoneId})` },
          { id: 2, name: `Team 2 (SubZone ${subZoneId})` }
        ]
      }));
    }
  };

  // Load employees when team changes
  const loadEmployees = async (teamId) => {
    if (!teamId) return;
    try {
      const response = await axiosAPI.get(`/reports/sales/options/employees?parentId=${teamId}`);
      console.log('Employees response:', response.data);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, employees: response.data.data }));
      } else if (response.data.employees) {
        setOptions(prev => ({ ...prev, employees: response.data.employees }));
      } else if (Array.isArray(response.data)) {
        setOptions(prev => ({ ...prev, employees: response.data }));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      // Fallback to sample data if API fails
      setOptions(prev => ({ 
        ...prev, 
        employees: [
          { id: 1, name: `Employee 1 (Team ${teamId})` },
          { id: 2, name: `Employee 2 (Team ${teamId})` }
        ]
      }));
    }
  };

  // Load customers when employee changes
  const loadCustomers = async (employeeId) => {
    if (!employeeId) return;
    try {
      const response = await axiosAPI.get(`/reports/sales/options/customers?parentId=${employeeId}`);
      console.log('Customers response:', response.data);
      if (response.data.success && response.data.data) {
        setOptions(prev => ({ ...prev, customers: response.data.data }));
      } else if (response.data.customers) {
        setOptions(prev => ({ ...prev, customers: response.data.customers }));
      } else if (Array.isArray(response.data)) {
        setOptions(prev => ({ ...prev, customers: response.data }));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      // Fallback to sample data if API fails
      setOptions(prev => ({ 
        ...prev, 
        customers: [
          { id: 1, name: `Customer 1 (Emp ${employeeId})` },
          { id: 2, name: `Customer 2 (Emp ${employeeId})` }
        ]
      }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Reset dependent filters
      if (key === 'divisionId') {
        newFilters.zoneId = null;
        newFilters.subZoneId = null;
        newFilters.teamId = null;
        newFilters.employeeId = null;
        newFilters.customerId = null;
        setOptions(prev => ({ 
          ...prev, 
          zones: [], 
          subzones: [], 
          teams: [], 
          employees: [], 
          customers: [] 
        }));
        if (value) {
          loadZones(value);
        }
      } else if (key === 'zoneId') {
        newFilters.subZoneId = null;
        newFilters.teamId = null;
        newFilters.employeeId = null;
        newFilters.customerId = null;
        setOptions(prev => ({ 
          ...prev, 
          subzones: [], 
          teams: [], 
          employees: [], 
          customers: [] 
        }));
        if (value) {
          loadSubZones(value);
        }
      } else if (key === 'subZoneId') {
        newFilters.teamId = null;
        newFilters.employeeId = null;
        newFilters.customerId = null;
        setOptions(prev => ({ 
          ...prev, 
          teams: [], 
          employees: [], 
          customers: [] 
        }));
        if (value) {
          loadTeams(value);
        }
      } else if (key === 'teamId') {
        newFilters.employeeId = null;
        newFilters.customerId = null;
        setOptions(prev => ({ 
          ...prev, 
          employees: [], 
          customers: [] 
        }));
        if (value) {
          loadEmployees(value);
        }
      } else if (key === 'employeeId') {
        newFilters.customerId = null;
        setOptions(prev => ({ 
          ...prev, 
          customers: [] 
        }));
        if (value) {
          loadCustomers(value);
        }
      }
      
      return newFilters;
    });
  };

  // Determine the appropriate endpoint based on filters
  const getReportEndpoint = () => {
    if (filters.customerId) return '/reports/sales/customer';
    if (filters.employeeId) return '/reports/sales/employee';
    if (filters.teamId) return '/reports/sales/team';
    if (filters.subZoneId) return '/reports/sales/subzone';
    if (filters.zoneId) return '/reports/sales/zone';
    if (filters.divisionId) return '/reports/sales/division';
    return '/reports/sales/all-divisions'; // Default to all divisions
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const endpoint = getReportEndpoint();
      const params = {
        ...filters,
        showProducts: false,
        showAll: false
      };
      
      // Remove null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      // Build query string manually to avoid axios params formatting
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const fullUrl = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
      console.log('API URL:', fullUrl);
      
      const response = await axiosAPI.get(fullUrl);
      console.log('Sales data response:', response.data);
      
      if (response.data.success) {
        setSimpleData(response.data.data || []);
        setSalesData(response.data.data || []);
      } else {
        setError(response.data.message || "Error fetching sales data");
        setIsErrorOpen(true);
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      // Fallback to sample simple data if API fails
      const sampleSimpleData = [
        {
          date: "2025-09-26",
          particulars: "SO-ZONE-002",
          bags: 0,
          tons: 0.000,
          value: 35000.00
        },
        {
          date: "2025-09-25",
          particulars: "SO-20250925-000NaN",
          bags: 1,
          tons: 0.020,
          value: 239.00
        }
      ];
      setSimpleData(sampleSimpleData);
      setSalesData(sampleSimpleData);
      setError(err.response?.data?.message || "Error fetching sales data");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedData = async () => {
    try {
      setLoading(true);
      const endpoint = getReportEndpoint();
      const params = {
        ...filters,
        showProducts: true,
        showAll: true
      };
      
      // Remove null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      // Build query string manually to avoid axios params formatting
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const fullUrl = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;
      console.log('API URL:', fullUrl);
      
      const response = await axiosAPI.get(fullUrl);
      console.log('Detailed data response:', response.data);
      
      if (response.data.success) {
        setDetailedData(response.data.data || []);
        setSalesData(response.data.data || []);
      } else {
        setError(response.data.message || "Error fetching detailed sales data");
        setIsErrorOpen(true);
      }
    } catch (err) {
      console.error('Error fetching detailed sales data:', err);
      // Fallback to sample detailed data if API fails
      const sampleDetailedData = [
        {
          orderName: "SO-ZONE-002",
          cattleFeed: "-",
          natu: "-", 
          organicFertilizer: "-",
          poultryFeed: "-",
          testProduct1: "-",
          testsWithoutSlabs: "-",
          totalBags: 0,
          totalTons: 0.000,
          totalValue: 35000.00
        },
        {
          orderName: "SO-20250925-000NaN",
          cattleFeed: "-",
          natu: "-",
          organicFertilizer: "-", 
          poultryFeed: "-",
          testProduct1: "-",
          testsWithoutSlabs: "-",
          totalBags: 1,
          totalTons: 0.020,
          totalValue: 239.00
        }
      ];
      setDetailedData(sampleDetailedData);
      setSalesData(sampleDetailedData);
      setError(err.response?.data?.message || "Error fetching detailed sales data");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    if (showAll) {
      fetchDetailedData();
      setIsDetailedView(true);
    } else {
      fetchSalesData();
      setIsDetailedView(false);
    }
    setTrigger(trigger ? false : true);
  };

  const onCancel = () => {
    // Reset everything to initial state but stay on same page
    setShowAll(false);
    setIsDetailedView(false);
    setSalesData([]);
    setFilters({
      divisionId: null,
      zoneId: null,
      subZoneId: null,
      teamId: null,
      employeeId: null,
      customerId: null,
      startDate: null,
      endDate: null
    });
    setOptions(prev => ({
      ...prev,
      zones: [],
      subzones: [],
      teams: [],
      employees: [],
      customers: []
    }));
  };

  // Export functionality using API endpoints
  const onExport = async (type) => {
    try {
      setLoading(true);
      
      const endpoint = getReportEndpoint();
      const exportEndpoint = type === "PDF" ? 
        `${endpoint}/export/pdf` : 
        `${endpoint}/export/excel`;
      
      const params = {
        ...filters,
        showProducts: showAll,
        showAll: showAll
      };
      
      // Remove null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      console.log('Export endpoint:', exportEndpoint);
      console.log('Export params:', params);

      // Build query string manually to avoid axios params formatting
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const fullExportUrl = queryParams.toString() ? `${exportEndpoint}?${queryParams.toString()}` : exportEndpoint;
      console.log('Export URL:', fullExportUrl);

      const response = await axiosAPI.get(fullExportUrl, { 
        responseType: 'blob'
      });
      
      // Create download
      const blob = new Blob([response.data], { 
        type: type === "PDF" ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `sales_report_${new Date().toISOString().split('T')[0]}.${type === "PDF" ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (err) {
      console.error(`Error exporting ${type}:`, err);
      setError(err.response?.data?.message || `Error exporting ${type}`);
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i className="bi bi-chevron-right"></i> Sales-Reports
      </p>

      {/* Date Filters */}
      <div className="row m-0 p-3">
        <div className="col-md-3 formcontent">
          <label htmlFor="startDate">From:</label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
          />
        </div>
        <div className="col-md-3 formcontent">
          <label htmlFor="endDate">To:</label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="row m-0 p-3">
        {/* Division Filter */}
        <div className="col-md-2 formcontent">
          <label htmlFor="division">Division:</label>
          <select 
            id="division"
            value={filters.divisionId || ''} 
            onChange={(e) => handleFilterChange('divisionId', e.target.value || null)}
          >
            <option value="">--select--</option>
            {options.divisions.map(div => (
              <option key={div.id} value={div.id}>{div.name}</option>
            ))}
          </select>
        </div>

        {/* Zone Filter */}
        <div className="col-md-2 formcontent">
          <label htmlFor="zone">Zone:</label>
          <select 
            id="zone"
            value={filters.zoneId || ''} 
            onChange={(e) => handleFilterChange('zoneId', e.target.value || null)}
            disabled={!filters.divisionId}
          >
            <option value="">--select--</option>
            {options.zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>

        {/* Sub-Zone Filter */}
        <div className="col-md-2 formcontent">
          <label htmlFor="subzone">Sub-Zone:</label>
          <select 
            id="subzone"
            value={filters.subZoneId || ''} 
            onChange={(e) => handleFilterChange('subZoneId', e.target.value || null)}
            disabled={!filters.zoneId}
          >
            <option value="">--select--</option>
            {options.subzones.map(subzone => (
              <option key={subzone.id} value={subzone.id}>{subzone.name}</option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div className="col-md-2 formcontent">
          <label htmlFor="team">Team:</label>
          <select 
            id="team"
            value={filters.teamId || ''} 
            onChange={(e) => handleFilterChange('teamId', e.target.value || null)}
            disabled={!filters.subZoneId}
          >
            <option value="">--select--</option>
            {options.teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* Employee Filter */}
        <div className="col-md-2 formcontent">
          <label htmlFor="employee">Employee:</label>
          <select 
            id="employee"
            value={filters.employeeId || ''} 
            onChange={(e) => handleFilterChange('employeeId', e.target.value || null)}
            disabled={!filters.teamId}
          >
            <option value="">--select--</option>
            {options.employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        {/* Customer Filter */}
        <div className="col-md-2 formcontent">
          <label htmlFor="customer">Customer:</label>
          <select 
            id="customer"
            value={filters.customerId || ''} 
            onChange={(e) => handleFilterChange('customerId', e.target.value || null)}
            disabled={!filters.employeeId}
          >
            <option value="">--select--</option>
            {options.customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Show All Checkbox */}
      <div className="row m-0 p-3">
        <div className="col-12 d-flex align-items-center gap-2">
          <input
            type="checkbox"
            id="showAll"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          <label htmlFor="showAll" className="mb-0">Show All</label>
        </div>
      </div>

      {/* Submit/Cancel buttons */}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-12 d-flex justify-content-center">
          <div className="d-flex gap-3">
            <button className="submitbtn" onClick={onSubmit}>
              Submit
            </button>
            <button className="cancelbtn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && <Loading />}

      {/* Export buttons */}
      {!loading && salesData && salesData.length > 0 && (
        <div className="row m-0 p-3 justify-content-around">
          <div className="col-lg-5">
            <button className={styles.xls} onClick={() => onExport("XLS")}>
              <p>Export to </p>
              <img src={xls} alt="" />
            </button>
            <button className={styles.xls} onClick={() => onExport("PDF")}>
              <p>Export to </p>
              <img src={pdf} alt="" />
            </button>
          </div>
        </div>
      )}

      {/* Sales Reports Table */}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-md-12">
          <div className="table-responsive">
            <table className="table table-bordered borderedtable">
              <thead>
                {isDetailedView ? (
                  // Detailed table headers
                  <tr>
                    <th className="text-center">Order Name</th>
                    <th className="text-center">Cattle Feed<br/><small style={{fontWeight: 'normal', fontSize: '10px'}}>(loose)</small></th>
                    <th className="text-center">Natu<br/><small style={{fontWeight: 'normal', fontSize: '10px'}}>(packed)</small></th>
                    <th className="text-center">Organic Fertilizer<br/><small style={{fontWeight: 'normal', fontSize: '10px'}}>(packed)</small></th>
                    <th className="text-center">Poultry Feed<br/><small style={{fontWeight: 'normal', fontSize: '10px'}}>(loose)</small></th>
                    <th className="text-center">Test Product #1<br/><small style={{fontWeight: 'normal', fontSize: '10px'}}>(packed)</small></th>
                    <th className="text-center">TESTS WITHOUT SLABS<br/><small style={{fontWeight: 'normal', fontSize: '10px'}}>(packed)</small></th>
                    <th className="text-center">Total Bags</th>
                    <th className="text-center">Total Tons</th>
                    <th className="text-center">Total Value (₹)</th>
                  </tr>
                ) : (
                  // Simple table headers
                  <tr>
                    <th className="text-center">Date</th>
                    <th className="text-center">Particulars</th>
                    <th className="text-center">Bags</th>
                    <th className="text-center">Tons</th>
                    <th className="text-center">Value (₹)</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {salesData.length === 0 && (
                  <tr className="animated-row">
                    <td colSpan={isDetailedView ? 10 : 5} className="text-center">NO DATA FOUND</td>
                  </tr>
                )}
                {salesData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="animated-row"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {isDetailedView ? (
                      // Detailed table row
                      <>
                        <td className="text-center">{row.orderName || '-'}</td>
                        <td className="text-center">{row.cattleFeed || '-'}</td>
                        <td className="text-center">{row.natu || '-'}</td>
                        <td className="text-center">{row.organicFertilizer || '-'}</td>
                        <td className="text-center">{row.poultryFeed || '-'}</td>
                        <td className="text-center">{row.testProduct1 || '-'}</td>
                        <td className="text-center">{row.testsWithoutSlabs || '-'}</td>
                        <td className="text-center">{row.totalBags || 0}</td>
                        <td className="text-center">{row.totalTons ? row.totalTons.toFixed(3) : '0.000'}</td>
                        <td className="text-center">{row.totalValue ? row.totalValue.toFixed(2) : '0.00'}</td>
                      </>
                    ) : (
                      // Simple table row
                      <>
                        <td className="text-center">{row.date || '-'}</td>
                        <td className="text-center">{row.particulars || '-'}</td>
                        <td className="text-center">{row.bags || 0}</td>
                        <td className="text-center">{row.tons ? row.tons.toFixed(3) : '0.000'}</td>
                        <td className="text-center">{row.value ? row.value.toFixed(2) : '0.00'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isErrorOpen && (
        <ErrorModal isOpen={isErrorOpen} message={error} onClose={closeError} />
      )}
    </>
  );
}

export default SalesReports;
