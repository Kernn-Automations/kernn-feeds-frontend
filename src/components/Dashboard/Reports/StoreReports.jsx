import { useAuth } from "../../../Auth"; // Corrected import path
import React, { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
import { useNavigate } from "react-router-dom";
import storeService from "../../../services/storeService";
import Loading from "../../Loading";
import ErrorModal from "../../ErrorModal";
import styles from "./StoreReports.module.css";
import commonStyles from "./Reports.module.css";
import { FaStore, FaMoneyBillWave, FaBoxOpen, FaChartLine } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { exportToExcel, exportToPDF } from "./EmployeeReports/PDFndXLSCode";
import xls from "@/images/xls-png.png";
import pdf from "@/images/pdf-png.png";

export default function StoreReports() {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth(); // Get axiosAPI

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [storeTypeFilter, setStoreTypeFilter] = useState("all"); // 'all', 'franchise', 'own'
  
  // Navigation Confirmation Modal
  const [showNavModal, setShowNavModal] = useState(false);
  const [selectedStoreForNav, setSelectedStoreForNav] = useState(null);

  // Comparison State
  const [showComparison, setShowComparison] = useState(false);

  // --- NEW Store Comparison Report State ---
  const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [reportType, setReportType] = useState("summary"); // 'summary', 'leaderboard', 'trend'

  const [availableStoresForComparison, setAvailableStoresForComparison] = useState([]);
  const [selectedComparisonStoreIds, setSelectedComparisonStoreIds] = useState([]);
  const [comparisonReportData, setComparisonReportData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [selectedNames, setSelectedNames] = useState([]);

  // Fetch available stores for comparison dropdown
  useEffect(() => {
    async function fetchComparisonStores() {
        try {
            const res = await axiosAPI.get("/reports/store-comparison/stores");
            const storesData = res.data.stores || res.data.data || [];
            setAvailableStoresForComparison(storesData);
        } catch (e) {
            console.error("Failed to fetch comparison stores list", e);
        }
    }
    fetchComparisonStores();
  }, [axiosAPI]);
  
  // Fetch Stores Data
  const fetchStoresData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosAPI.get('/stores/reports/store-list-summary');
      const storesList = res.data.data || res.data || [];

      setStores(storesList);
      setFilteredStores(storesList);

    } catch (err) {
      console.error("Failed to fetch store reports data", err);
      setError("Failed to fetch store reports data.");
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchStoresData();
  }, [fetchStoresData]);

  // Filtering Logic
  useEffect(() => {
    let result = stores;
    if (storeTypeFilter !== 'all') {
      result = result.filter(store => 
        (store.storeType || "").toLowerCase() === storeTypeFilter.toLowerCase()
      );
    }
    setFilteredStores(result);
  }, [storeTypeFilter, stores]);

  const [comparisonData, setComparisonData] = useState([]);

  // Handlers
  const handleStoreClick = (store) => {
    setSelectedStoreForNav(store);
    setShowNavModal(true);
  };

  const confirmNavigation = () => {
    if (selectedStoreForNav) {
        // Build logic to switch context if needed, then navigate
        // Storing selected store in localStorage is a common pattern here to "switch" context
        localStorage.setItem("selectedStore", JSON.stringify(selectedStoreForNav));
        localStorage.setItem("currentStoreId", selectedStoreForNav.storeId);
        
        navigate(`/store/dashboard/${selectedStoreForNav.storeId}`); // Or just /store/dashboard if context handles it
    }
    setShowNavModal(false);
  };

  // fetch comparison report
  const fetchComparisonReport = async () => {
    if (selectedComparisonStoreIds.length === 0) {
      setError("Please select at least one store to compare");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      setComparisonLoading(true);
      setComparisonReportData(null);
      const ids = selectedComparisonStoreIds.join(",");
      // API Parameters: fromDate, toDate, storeIds, reportType
      // Default: reportType=summary if not specified (we have state for it)
      const query = `/reports/store-comparison?storeIds=${ids}&fromDate=${from}&toDate=${to}&reportType=${reportType}`;
      console.log("Fetching Comparison Report:", query);
      
      const res = await axiosAPI.get(query);
      const data = res.data;
      setComparisonReportData(data);
      
      // Determine columns based on response or selected IDs
      // If API returns list of stores with data, we can map names from there or use availableStoresForComparison
      // Employee Report uses data.ids array. Let's assume similar structure or map from store list.
      // If data.ids exists, use it. Else map selected IDs to names.
      if (data.ids) {
          setSelectedNames(data.ids.map((x) => x.name || x.storeName || x.label));
      } else {
          // Fallback: Map selected IDs to names from availableStores
          const names = selectedComparisonStoreIds.map(id => {
              const store = availableStoresForComparison.find(s => s.id === id);
              return store ? store.name : `Store ${id}`;
          });
          setSelectedNames(names);
      }
      
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Error fetching comparison report");
      setIsErrorModalOpen(true);
    } finally {
      setComparisonLoading(false);
    }
  };

  const toggleStoreSelect = (id) => {
    if (selectedComparisonStoreIds.includes(id)) {
      setSelectedComparisonStoreIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedComparisonStoreIds(prev => [...prev, id]);
    }
  };

  // Calculations
  const totalStores = stores.length;
  const franchiseStores = stores.filter(s => (s.storeType || "").toLowerCase() === 'franchise').length;
  const ownStores = stores.filter(s => (s.storeType || "").toLowerCase() === 'own').length; // Assuming 'own' is the type value

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <h2 className="mb-4" style={{ fontFamily: "Poppins", fontWeight: 700, color: "var(--primary-color)" }}>Store Reports</h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        {/* Total Stores */}
        <div className="col-md-3 mb-3">
          <div 
            className="card shadow-sm p-3 h-100" 
            style={{ cursor: "pointer", borderLeft: "5px solid #0d6efd" }}
            onClick={() => setStoreTypeFilter('all')}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Total Stores</h6>
                <h3 className="mb-0 fw-bold">{totalStores}</h3>
              </div>
              <FaStore size={28} className="text-primary opacity-50" />
            </div>
          </div>
        </div>
        
        {/* Franchise Stores */}
        <div className="col-md-3 mb-3">
          <div 
            className="card shadow-sm p-3 h-100" 
            style={{ cursor: "pointer", borderLeft: "5px solid #198754", backgroundColor: storeTypeFilter === 'franchise' ? '#f0fff4' : 'white' }}
            onClick={() => setStoreTypeFilter('franchise')}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Franchise Stores</h6>
                <h3 className="mb-0 fw-bold">{franchiseStores}</h3>
              </div>
              <FaStore size={28} className="text-success opacity-50" />
            </div>
          </div>
        </div>

        {/* Own Stores */}
        <div className="col-md-3 mb-3">
          <div 
            className="card shadow-sm p-3 h-100" 
            style={{ cursor: "pointer", borderLeft: "5px solid #fd7e14", backgroundColor: storeTypeFilter === 'own' ? '#fff4e6' : 'white' }}
            onClick={() => setStoreTypeFilter('own')}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Own Stores</h6>
                <h3 className="mb-0 fw-bold">{ownStores}</h3>
              </div>
              <FaStore size={28} className="text-warning opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold" style={{fontSize: '18px'}}>Store List</h4>
        <div>
            <button 
                className="btn btn-outline-primary me-2"
                onClick={() => setShowComparison(!showComparison)}
            >
                {showComparison ? "Hide Comparison" : "Store Wise Comparison"}
            </button>
        </div>
      </div>

      {/* Store Wise Comparison Section (Collapsible) */}
      {showComparison && (
        <div className="card shadow-sm p-4 mb-4" style={{ backgroundColor: "#f8f9fa", border: "1px dashed #ced4da" }}>
            <h5 className="mb-3">Store Comparison</h5>
            
            {/* Filters */}
            <div className="row g-3 mb-4">
                 <div className="col-md-3 formcontent">
                    <label>From :</label>
                    <input
                        type="date"
                        className="form-control"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </div>
                <div className="col-md-3 formcontent">
                    <label>To :</label>
                    <input
                        type="date"
                        className="form-control"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <div className="col-md-3 formcontent">
                    <label>Report Type :</label>
                    <select
                        className="form-select"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="summary">Summary</option>
                        <option value="leaderboard">Leaderboard</option>
                        <option value="trend">Trend</option>
                    </select>
                </div>
            </div>

            {/* Store Selection */}
            <h6 className="mb-2">Select Stores to Compare</h6>
            <div className="row g-2 mb-4 p-2 border rounded bg-white" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {availableStoresForComparison.length > 0 ? (
                    availableStoresForComparison.map((store) => (
                        <div key={store.id} className="col-md-3 col-sm-6">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`store-${store.id}`}
                                    checked={selectedComparisonStoreIds.includes(store.id)}
                                    onChange={() => toggleStoreSelect(store.id)}
                                />
                                <label className="form-check-label" htmlFor={`store-${store.id}`}>
                                    {store.name}
                                </label>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-muted">Loading stores or no stores available...</div>
                )}
            </div>

            <div className="text-center mb-4">
                <button 
                    className={commonStyles.comparebtn || "btn btn-primary"} 
                    onClick={fetchComparisonReport}
                    disabled={comparisonLoading}
                >
                    {comparisonLoading ? "Loading..." : "Compare"}
                </button>
            </div>

            {/* Summary Report Table (Rows) - Only for Summary/Leaderboard */}
            {reportType !== 'trend' && comparisonReportData && comparisonReportData.rows && comparisonReportData.rows.length > 0 && (
                <div className="mt-4">
                    <div className="mb-3">
                         <button
                           className={commonStyles.xls}
                           onClick={() => exportToExcel(selectedNames, comparisonReportData)}
                         >
                           <p>Export to </p>
                           <img src={xls} alt="Excel" />
                         </button>
                         <button
                           className={commonStyles.xls}
                           onClick={() => exportToPDF(selectedNames, comparisonReportData)}
                         >
                           <p>Export to </p>
                           <img src={pdf} alt="PDF" />
                         </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered borderedtable bg-white text-center align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>S.No</th>
                                    <th>Store Name</th>
                                    <th>Store Code</th>
                                    <th>Total Sales</th>
                                    <th>Prev. Period Sales</th>
                                    <th>Diff</th>
                                    <th>Growth %</th>
                                    <th>Avg Daily Sales</th>
                                    <th>Peak Day</th>
                                    <th>Peak Day Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonReportData.rows.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.sNo}</td>
                                        <td className="fw-bold">{row.storeName}</td>
                                        <td>{row.storeCode}</td>
                                        <td className="fw-bold">₹{row.totalSales?.toLocaleString()}</td>
                                        <td className="text-muted">₹{row.previousMonthTotalSales?.toLocaleString()}</td>
                                        <td className={row.increaseOrDecrease >= 0 ? "text-success" : "text-danger"}>
                                            {row.increaseOrDecrease >= 0 ? "+" : ""}₹{row.increaseOrDecrease?.toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={`badge ${row.growthPercentage >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                                {row.growthPercentage?.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td>₹{row.averageDailySales?.toLocaleString()}</td>
                                        <td>{row.peakDay || "-"}</td>
                                        <td>₹{row.peakDaySales?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Trend Report Table - Only for Trend */}
            {reportType === 'trend' && comparisonReportData && comparisonReportData.rows && comparisonReportData.rows.length > 0 && (
                <div className="mt-4">
                    <div className="mb-3">
                         <button
                           className={commonStyles.xls}
                           onClick={() => exportToExcel(selectedNames, comparisonReportData)}
                         >
                           <p>Export to </p>
                           <img src={xls} alt="Excel" />
                         </button>
                         <button
                           className={commonStyles.xls}
                           onClick={() => exportToPDF(selectedNames, comparisonReportData)}
                         >
                           <p>Export to </p>
                           <img src={pdf} alt="PDF" />
                         </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered borderedtable bg-white text-center align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>S.No</th>
                                    <th>Date</th>
                                    <th>Store</th>
                                    <th>Sales</th>
                                    <th>Prev Month</th>
                                    <th>Change Accumulated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonReportData.rows.map((row, index) => {
                                    // Map storeId to Name using availableStoresForComparison
                                    const storeObj = availableStoresForComparison.find(s => s.id === row.storeId);
                                    const storeName = storeObj ? storeObj.name : `Store ${row.storeId}`;
                                    
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{row.date || row.isoDate}</td>
                                            <td>{storeName}</td>
                                            <td>{row.totalSales}</td>
                                            <td>{row.previousMonthSameDateSales}</td>
                                            <td>{row.increaseOrDecrease}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Date Wise Report Table (Leaderboard only now) */}
            {reportType !== 'trend' && comparisonReportData && comparisonReportData.dateWise && comparisonReportData.dateWise.length > 0 && (
                <div className="mt-4">
                    <div className="mb-3">
                         <button
                           className={commonStyles.xls}
                           onClick={() => exportToExcel(selectedNames, comparisonReportData)}
                         >
                           <p>Export to </p>
                           <img src={xls} alt="Excel" />
                         </button>
                         <button
                           className={commonStyles.xls}
                           onClick={() => exportToPDF(selectedNames, comparisonReportData)}
                         >
                           <p>Export to </p>
                           <img src={pdf} alt="PDF" />
                         </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered borderedtable bg-white">
                            <thead>
                                <tr>
                                    <th rowSpan={2}>S.No</th>
                                    <th rowSpan={2}>Date</th>
                                    {selectedNames.map((name) => (
                                        <th key={name} colSpan={4} className="text-center">
                                            {name}
                                        </th>
                                    ))}
                                </tr>
                                <tr>
                                    {selectedNames.map((name) => (
                                        <React.Fragment key={name + "-headers"}>
                                            <th>Qty</th>
                                            <th>Increase</th>
                                            <th>Decrease</th>
                                            <th>Accumulated</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonReportData.dateWise.map((day, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{day.date}</td>
                                        {selectedNames.map((name) => (
                                            <React.Fragment key={name + index}>
                                                <td>{day[name] ?? 0}</td>
                                                <td>{comparisonReportData.increase?.[name]?.[day.date] ?? 0}</td>
                                                <td>{comparisonReportData.decrease?.[name]?.[day.date] ?? 0}</td>
                                                <td>{comparisonReportData.accumulation?.[name]?.[day.date] ?? 0}</td>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Show message if no data but search was performed */}
            {comparisonReportData && 
             (!comparisonReportData.dateWise || comparisonReportData.dateWise.length === 0) && 
             (!comparisonReportData.rows || comparisonReportData.rows.length === 0) && (
                <div className="alert alert-info text-center">No data found for the selected criteria.</div>
            )}
        </div>
      )}

      {/* Stores Table */}
      <div className={styles.tableContainer}>
        <table className={styles.reportsTable}>
            <thead>
                <tr>
                    <th className="ps-4">S.No</th>
                    <th>Store Name</th>
                    <th className="text-center">Type</th>
                    <th colSpan="2" className="text-center border-start border-end">Today Sales</th>
                    <th colSpan="2" className="text-center border-end">Monthly Sales</th>
                    <th className="text-end">Available Cash</th>
                    <th className="text-center">Actions</th>
                </tr>
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    {/* Today Sub-headers */}
                    <th className="text-center border-start">Value (₹)</th>
                    <th className="text-center border-end">Qty</th>
                     {/* Monthly Sub-headers */}
                    <th className="text-center">Value (₹)</th>
                    <th className="text-center border-end">Qty</th>
                    
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan="11" className="text-center p-5"><Loading /></td></tr>
                ) : filteredStores.length === 0 ? (
                    <tr><td colSpan="11" className="text-center p-5 text-muted">No stores found.</td></tr>
                ) : (
                    filteredStores.map((store, index) => (
                        <tr key={store.storeId}>
                            <td className="ps-4">{index + 1}</td>
                            <td>
                                <span 
                                    className="text-primary fw-bold text-decoration-underline" 
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleStoreClick(store)}
                                >
                                    {store.storeName}
                                </span>
                            </td>
                            <td className="text-center">
                                <span className={`badge bg-${(store.storeType || '').toLowerCase() === 'franchise' ? 'success' : 'warning'}`}>
                                    {store.storeType || 'Own'}
                                </span>
                            </td>
                            
                            <td className="text-center border-start fw-bold">₹{store.todaySales?.value?.toLocaleString() || 0}</td>
                            <td className="text-center border-end">{store.todaySales?.qty || 0}</td>
                            
                            <td className="text-center">₹{store.monthlySales?.value?.toLocaleString() || 0}</td>
                            <td className="text-center border-end">{store.monthlySales?.qty || 0}</td>

                            <td className="text-end fw-bold text-success">₹{(store.availableCash || 0).toLocaleString()}</td>
                            <td className="text-center">
                                <button 
                                    className="btn btn-sm btn-link text-decoration-none"
                                    onClick={() => navigate('/store/stock-summary')} // Adjust link as needed, maybe pass store ID via query or context
                                >
                                    Closing Stock
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* Navigation Confirmation Modal */}
      {showNavModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title">Go to Store?</h5>
                        <button type="button" className="btn-close" onClick={() => setShowNavModal(false)}></button>
                    </div>
                    <div className="modal-body text-center py-4">
                        <div className="mb-3">
                            <FaStore size={40} className="text-primary opacity-75" />
                        </div>
                        <p className="mb-0">Are you sure you want to go to <strong>{selectedStoreForNav?.name}</strong>?</p>
                    </div>
                    <div className="modal-footer border-0 justify-content-center">
                        <button className="btn btn-light px-4" onClick={() => setShowNavModal(false)}>Cancel</button>
                        <button className="btn btn-primary px-4" onClick={confirmNavigation}>Yes, Go to Store</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {error && <ErrorModal message={error} isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} />}
    </div>
  );
}
