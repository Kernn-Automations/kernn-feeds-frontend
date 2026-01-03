import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import storeService from "../../../services/storeService";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import inventoryStyles from "../../Dashboard/Inventory/Inventory.module.css";
import { handleExportPDF, handleExportExcel } from "@/utils/PDFndXLSGenerator";
import xls from "../../../images/xls-png.png";
import pdf from "../../../images/pdf-png.png";

function StoreStockSummary() {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [tempFrom, setTempFrom] = useState(new Date().toISOString().slice(0, 10));
  const [tempTo, setTempTo] = useState(new Date().toISOString().slice(0, 10));
  const [dateRange, setDateRange] = useState("custom");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("summary"); // "summary", "stats", "audit", "opening-closing"
  const [auditTrail, setAuditTrail] = useState([]);
  const [openingClosing, setOpeningClosing] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [productSalesDetails, setProductSalesDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [summaryTotals, setSummaryTotals] = useState(null);

  const handleRowClick = async (rowId, productId) => {
    const isExpanded = expandedRowId === rowId;
    setExpandedRowId(isExpanded ? null : rowId);

    if (!isExpanded && productId) {
      if (productSalesDetails[rowId]) return; // Already fetched

      setLoadingDetails(prev => ({ ...prev, [rowId]: true }));
      try {
        const params = {
          storeId,
          productId,
          fromDate: from,
          toDate: to
        };
        const res = await storeService.getStoreStockProductSales(params);
        if (res.success && res.data && res.data.salesDetails) {
          setProductSalesDetails(prev => ({ ...prev, [rowId]: res.data.salesDetails }));
        }
      } catch (err) {
        console.error("Error fetching product sales details:", err);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [rowId]: false }));
      }
    }
  };


  
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    // Get store ID from multiple sources
    try {
      let id = null;
      
      const selectedStore = localStorage.getItem("selectedStore");
      if (selectedStore) {
        try {
          const store = JSON.parse(selectedStore);
          id = store.id;
        } catch (e) {
          console.error("Error parsing selectedStore:", e);
        }
      }
      
      if (!id) {
        const currentStoreId = localStorage.getItem("currentStoreId");
        id = currentStoreId ? parseInt(currentStoreId) : null;
      }
      
      if (!id) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const user = userData.user || userData;
        id = user?.storeId || user?.store?.id;
      }
      
      if (id) {
        setStoreId(id);
      } else {
        setError("Store information missing. Please re-login to continue.");
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Unable to parse stored user data", err);
      setError("Unable to determine store information. Please re-login.");
      setIsModalOpen(true);
    }
  }, []);

  const fetchStock = async () => {
    if (!from || !to || !storeId) {
      if (!storeId) {
        setError("Store information missing. Please re-login to continue.");
      } else {
        setError("Please select both From and To dates.");
      }
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = {
        fromDate: from,
        toDate: to,
        storeId: storeId,
        page,
        limit
      };
      
      const res = await storeService.getStoreStockSummary(params);
      const summaryData = res.data || res.summary || res || [];
      const paginationData = res.pagination || {};
      
      // Extract totals if available (assuming response structure { data: [], pagination: {}, totals: {} })
      setSummaryTotals(res.totals || res.aggregate || null);
      
      // Map API response to match table structure
      const mappedData = Array.isArray(summaryData) ? summaryData.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || item.productName || '-',
        productSKU: item.product?.SKU || item.product?.sku || '-',
        date: item.date,
        stockIn: item.stockIn || 0,
        inwardStock: item.inwardStock || 0,
        opening: item.openingStock || 0,
        closing: item.closingStock || 0,
        outwardStock: item.outwardStock || 0,
        stockOut: item.stockOut || 0,
        inwardPrice: item.inwardStockPrice || 0,
        outwardPrice: item.outwardStockPrice || 0,
        stockInPrice: item.stockInPrice || 0,
        stockOutPrice: item.stockOutPrice || 0,
        unit: item.unit || item.product?.unit || 'kg',
        productType: item.productType || item.product?.productType || 'packed',
        store: item.store,
        product: item.product,
        division: item.division
      })) : [];
      
      setStockData(mappedData);
      setTotal(paginationData.total || mappedData.length);
      setTotalPages(paginationData.totalPages || Math.ceil((paginationData.total || mappedData.length) / limit) || 1);
    } catch (err) {
      console.error('StoreStockSummary - Error:', err);
      setError(err.response?.data?.message || err.message || "Failed to fetch stock data.");
      setIsModalOpen(true);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!from || !to || !storeId) return;
    
    setLoading(true);
    try {
      const params = {
        fromDate: from,
        toDate: to,
        storeId: storeId
      };
      
      const res = await storeService.getStoreStockSummaryStats(params);
      const statsData = res.data || res;
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || err.message || "Failed to fetch statistics.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    if (!from || !to || !storeId) return;
    
    setLoading(true);
    try {
      const params = {
        fromDate: from,
        toDate: to,
        storeId: storeId,
        page,
        limit
      };
      
      const res = await storeService.getStoreStockAuditTrail(params);
      const auditData = res.data || res.auditTrail || res || [];
      const paginationData = res.pagination || {};
      
      const mappedAudit = Array.isArray(auditData) ? auditData.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || '-',
        productSKU: item.product?.SKU || item.product?.sku || '-',
        transactionType: item.transactionType,
        quantity: item.quantity || 0,
        unit: item.unit || 'kg',
        productType: item.productType || 'packed',
        recordedAt: item.recordedAt,
        referenceType: item.referenceType,
        referenceId: item.referenceId,
        remarks: item.remarks,
        totalPrice: item.totalPrice || 0,
        store: item.store,
        product: item.product
      })) : [];
      
      setAuditTrail(mappedAudit);
      setTotal(paginationData.total || mappedAudit.length);
      setTotalPages(paginationData.totalPages || Math.ceil((paginationData.total || mappedAudit.length) / limit) || 1);
    } catch (err) {
      console.error('Error fetching audit trail:', err);
      setError(err.response?.data?.message || err.message || "Failed to fetch audit trail.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpeningClosing = async () => {
    if (!from || !to || !storeId) return;
    
    setLoading(true);
    try {
      const params = {
        fromDate: from,
        toDate: to,
        storeId: storeId
      };
      
      const res = await storeService.getStoreStockOpeningClosing(params);
      const data = res.data || res;
      setOpeningClosing(data);
    } catch (err) {
      console.error('Error fetching opening/closing stock:', err);
      setError(err.response?.data?.message || err.message || "Failed to fetch opening/closing stock.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Removed automatic fetching on date change - now only fetches on Submit button click
  useEffect(() => {
    if (storeId && page > 1) {
      // Only auto-fetch for pagination changes
      if (activeTab === "summary") {
        fetchStock();
      } else if (activeTab === "audit") {
        fetchAuditTrail();
      }
    }
  }, [storeId, page, limit]);

  const handlePageChange = (direction) => {
    if (direction === "next" && page < totalPages) {
      setPage(prev => prev + 1);
    } else if (direction === "prev" && page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when switching tabs
  };

  const onSubmit = () => {
    setFrom(tempFrom);
    setTo(tempTo);
    setPage(1); // Reset to first page
    
    // Fetch data based on active tab
    setTimeout(() => {
      if (activeTab === "summary") {
        fetchStock();
        fetchStats(); // Also fetch stats to get totals for the footer
      }
      else if (activeTab === "stats") fetchStats();
      else if (activeTab === "audit") fetchAuditTrail();
      else if (activeTab === "opening-closing") fetchOpeningClosing();
    }, 100);
  };

  const onCancel = () => {
    const today = new Date().toISOString().slice(0, 10);
    setTempFrom(today);
    setTempTo(today);
    setFrom(today);
    setTo(today);
    setDateRange("custom");
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    const toDate = today.toISOString().slice(0, 10);
    let fromDate = toDate;

    switch (range) {
      case "today":
        fromDate = toDate;
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = yesterday.toISOString().slice(0, 10);
        setTempTo(fromDate);
        break;
      case "last7days":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        fromDate = last7.toISOString().slice(0, 10);
        break;
      case "last30days":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        fromDate = last30.toISOString().slice(0, 10);
        break;
      case "thisMonth":
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDate = thisMonthStart.toISOString().slice(0, 10);
        break;
      case "lastMonth":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        fromDate = lastMonthStart.toISOString().slice(0, 10);
        setTempTo(lastMonthEnd.toISOString().slice(0, 10));
        break;
      case "custom":
        // Don't change dates for custom
        return;
      default:
        fromDate = toDate;
    }

    setTempFrom(fromDate);
    if (range !== "yesterday" && range !== "lastMonth") {
      setTempTo(toDate);
    }
  };

  // Export function
  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = [
      "S.No",
      "Product",
      "SKU",
      "Date",
      "Opening Stock",
      "Inward Stock",
      "Inward Value",
      "Outward Stock",
      "Outward Value",
      "Stock In",
      "Stock In Price",
      "Stock Out",
      "Stock Out Price",
      "Closing Stock",
      "Unit"
    ];
    const dataToExport = stockData && stockData.length > 0 ? stockData : [];
    if (dataToExport && dataToExport.length > 0) {
      dataToExport.forEach((item) => {
        arr.push({
          "S.No": x++,
          "Product": item.productName || '-',
          "SKU": item.productSKU || '-',
          "Date": item.date || '-',
          "Opening Stock": Number(item.opening || 0).toFixed(2),
          "Inward Stock": Number(item.inwardStock || 0).toFixed(2),
          "Inward Value": Number(item.inwardPrice || 0).toFixed(2),
          "Outward Stock": Number(item.outwardStock || 0).toFixed(2),
          "Outward Value": Number(item.outwardPrice || 0).toFixed(2),
          "Stock In": Number(item.stockIn || 0).toFixed(2),
          "Stock In Price": Number(item.stockInPrice || 0).toFixed(2),
          "Stock Out": Number(item.stockOut || 0).toFixed(2),
          "Stock Out Price": Number(item.stockOutPrice || 0).toFixed(2),
          "Closing Stock": Number(item.closing || 0).toFixed(2),
          "Unit": item.unit || 'kg'
        });
      });

      if (type === "PDF") handleExportPDF(columns, arr, "Stock_Summary");
      else if (type === "XLS")
        handleExportExcel(columns, arr, "StockSummary");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  const renderSummaryTable = (dataArray) => (
    <div style={{ overflowX: 'auto' }}>
      <table className="table table-bordered borderedtable table-sm mt-2" style={{ fontFamily: 'Poppins' }}>
        <thead className="table-light">
          <tr>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>SKU</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Date</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Opening Stock</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Inward</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Inward Value</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Outward</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Outward Value</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Stock In</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Stock In Value</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Stock Out</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Stock Out Value</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Closing Stock</th>
            <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Unit</th>
          </tr>
        </thead>
        <tbody>
          {dataArray.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center" style={{ padding: '20px', fontFamily: 'Poppins' }}>
                No stock data found
              </td>
            </tr>
          ) : (
            dataArray.map((item, index) => {
              const actualIndex = (page - 1) * limit + index + 1;
              return (
                <React.Fragment key={item.id || index}>
                  <tr 
                    onClick={() => handleRowClick(item.id || index, item.productId)}
                    style={{ 
                      background: index % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: expandedRowId === (item.id || index) ? '4px solid var(--primary-color)' : 'none',
                      transition: 'all 0.2s' 
                    }}
                  >
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`bi bi-chevron-${expandedRowId === (item.id || index) ? 'down' : 'right'}`} style={{ fontSize: '10px' }}></i>
                        {item.productName || '-'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666' }}>{item.productSKU || '-'}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{item.date || '-'}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>
                      {Number(item.opening || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#059669' }}>
                      {Number(item.inwardStock || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                      ₹{Number(item.inwardPrice || 0).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#ef4444' }}>
                      {Number(item.outwardStock || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                      ₹{Number(item.outwardPrice || 0).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#3b82f6' }}>
                      {Number(item.stockIn || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#3b82f6', fontWeight: 600 }}>
                      ₹{Number(item.stockInPrice || 0).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#f59e0b' }}>
                      {Number(item.stockOut || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', color: '#f59e0b', fontWeight: 600 }}>
                      ₹{Number(item.stockOutPrice || 0).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>
                      {Number(item.closing || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{item.unit || 'kg'}</td>
                  </tr>
                  {expandedRowId === (item.id || index) && (
                    <tr key={`detail-${item.id || index}`}>
                      <td colSpan={14} style={{ padding: '0', backgroundColor: '#f9fafb' }}>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                          <h6 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
                            Sales Details for {item.productName} ({from} to {to})
                          </h6>
                          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            {loadingDetails[item.id || index] ? (
                              <div className="text-center p-3">Loading details...</div>
                            ) : (
                              <table className="table table-sm mb-0" style={{ fontFamily: 'Poppins' }}>
                                <thead style={{ backgroundColor: '#f3f4f6' }}>
                                  <tr>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#000', padding: '8px 16px' }}>Date</th>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#000', padding: '8px 16px' }}>Order ID</th>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#000', padding: '8px 16px' }}>Customer</th>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#000', padding: '8px 16px' }}>Quantity</th>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#000', padding: '8px 16px' }}>Price</th>
                                    <th style={{ fontSize: '12px', fontWeight: 600, color: '#000', padding: '8px 16px' }}>Total Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productSalesDetails[item.id || index] && productSalesDetails[item.id || index].length > 0 ? (
                                    productSalesDetails[item.id || index].map((sale, i) => (
                                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ fontSize: '13px', color: '#111827', padding: '8px 16px' }}>{sale.date}</td>
                                        <td style={{ fontSize: '13px', color: '#111827', padding: '8px 16px' }}>{sale.orderId}</td>
                                        <td style={{ fontSize: '13px', color: '#111827', padding: '8px 16px' }}>{sale.customer}</td>
                                        <td style={{ fontSize: '13px', color: '#111827', padding: '8px 16px' }}>
                                          {sale.quantity} <span style={{ color: '#6b7280', fontSize: '12px' }}>{sale.unit || item.unit}</span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#111827', padding: '8px 16px' }}>₹{sale.price}</td>
                                        <td style={{ fontSize: '13px', color: '#111827', fontWeight: 600, padding: '8px 16px' }}>₹{(sale.totalAmount || sale.total || 0).toLocaleString()}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={6} className="text-center p-3">No sales found for this period</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
        {stockData.length > 0 && (
          <tfoot className="table-light" style={{ borderTop: '2px solid #e5e7eb', fontFamily: 'Poppins', fontSize: '13px' }}>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>Total (Visible Rows):</td>
              <td style={{ fontWeight: 600, color: '#374151', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Opening</div>
                {stockData.reduce((sum, item) => sum + (Number(item.opening) || 0), 0).toFixed(2)}
              </td>
              <td style={{ fontWeight: 600, color: '#059669', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Inward</div>
                {stockData.reduce((sum, item) => sum + (Number(item.inwardStock) || 0), 0).toFixed(2)}
              </td>
              <td style={{ fontWeight: 600, color: '#059669', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Inward Val</div>
                ₹{stockData.reduce((sum, item) => sum + (Number(item.inwardPrice) || 0), 0).toLocaleString()}
              </td>
              <td style={{ fontWeight: 600, color: '#ef4444', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Outward</div>
                {stockData.reduce((sum, item) => sum + (Number(item.outwardStock) || 0), 0).toFixed(2)}
              </td>
              <td style={{ fontWeight: 600, color: '#ef4444', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Outward Val</div>
                ₹{stockData.reduce((sum, item) => sum + (Number(item.outwardPrice) || 0), 0).toLocaleString()}
              </td>
              <td style={{ fontWeight: 600, color: '#3b82f6', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Stock In</div>
                {stockData.reduce((sum, item) => sum + (Number(item.stockIn) || 0), 0).toFixed(2)}
              </td>
              <td style={{ fontWeight: 600, color: '#3b82f6', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Stock In Val</div>
                ₹{stockData.reduce((sum, item) => sum + (Number(item.stockInPrice) || 0), 0).toLocaleString()}
              </td>
              <td style={{ fontWeight: 600, color: '#f59e0b', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Stock Out</div>
                {stockData.reduce((sum, item) => sum + (Number(item.stockOut) || 0), 0).toFixed(2)}
              </td>
              <td style={{ fontWeight: 600, color: '#f59e0b', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Stock Out Val</div>
                ₹{stockData.reduce((sum, item) => sum + (Number(item.stockOutPrice) || 0), 0).toLocaleString()}
              </td>
              <td style={{ fontWeight: 600, color: 'var(--primary-color)', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Closing</div>
                {stockData.reduce((sum, item) => sum + (Number(item.closing) || 0), 0).toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: 'Poppins', color: '#666', fontSize: '14px' }}>
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} records
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePageChange("prev")}
              disabled={page === 1 || loading}
              style={{ fontFamily: 'Poppins', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FaArrowLeftLong />
              Previous
            </button>
            <span style={{ fontFamily: 'Poppins', padding: '0 12px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePageChange("next")}
              disabled={page >= totalPages || loading}
              style={{ fontFamily: 'Poppins', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Next
              <FaArrowRightLong />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontFamily: 'Poppins', 
          fontWeight: 700, 
          fontSize: '28px', 
          color: 'var(--primary-color)',
          margin: 0,
          marginBottom: '8px'
        }}>Stock Summary</h2>
        <p className="path">
          <span onClick={() => navigate("/store/inventory")}>Inventory</span>{" "}
          <i className="bi bi-chevron-right"></i> Stock Summary
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.orderStatusCard} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
          <button
            onClick={() => handleTabChange("summary")}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === "summary" ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === "summary" ? 'var(--primary-color)' : '#666',
              fontFamily: 'Poppins',
              fontWeight: activeTab === "summary" ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Stock Summary
          </button>
          <button
            onClick={() => handleTabChange("stats")}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === "stats" ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === "stats" ? 'var(--primary-color)' : '#666',
              fontFamily: 'Poppins',
              fontWeight: activeTab === "stats" ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Statistics
          </button>
          <button
            onClick={() => handleTabChange("audit")}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === "audit" ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === "audit" ? 'var(--primary-color)' : '#666',
              fontFamily: 'Poppins',
              fontWeight: activeTab === "audit" ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Audit Trail
          </button>
          <button
            onClick={() => handleTabChange("opening-closing")}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === "opening-closing" ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === "opening-closing" ? 'var(--primary-color)' : '#666',
              fontFamily: 'Poppins',
              fontWeight: activeTab === "opening-closing" ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Opening/Closing
          </button>
        </div>


        {/* Filters based on active tab */}
        <div className="row m-0 p-3">
          <div className="col-2 formcontent">
            <label htmlFor="">Date Range :</label>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              <option value="custom">Custom</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
          </div>
          <div className="col-2 formcontent">
            <label htmlFor="">From :</label>
            <input
              type="date"
              value={tempFrom}
              onChange={(e) => {
                setTempFrom(e.target.value);
                setDateRange("custom");
              }}
            />
          </div>
          <div className="col-2 formcontent">
            <label htmlFor="">To :</label>
            <input
              type="date"
              value={tempTo}
              onChange={(e) => {
                setTempTo(e.target.value);
                setDateRange("custom");
              }}
            />
          </div>
          <div className="col-6 formcontent" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              className="submitbtn"
              onClick={onSubmit}
              disabled={loading}
              style={{ margin: 0 }}
            >
              {loading ? 'Loading...' : 'Submit'}
            </button>
            <button 
              className="cancelbtn"
              onClick={onCancel}
              style={{ margin: 0 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && <Loading />}
      
      {/* Stock Summary Tab */}
      {!loading && activeTab === "summary" && stockData.length > 0 && (
        <div className={styles.orderStatusCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
              Stock Summary
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onExport("XLS")}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Poppins',
                  fontSize: '13px'
                }}
              >
                <img src={xls} alt="XLS" style={{ width: '20px', height: '20px' }} />
                Export XLS
              </button>
              <button
                onClick={() => onExport("PDF")}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Poppins',
                  fontSize: '13px'
                }}
              >
                <img src={pdf} alt="PDF" style={{ width: '20px', height: '20px' }} />
                Export PDF
              </button>
            </div>
          </div>
          {renderSummaryTable(stockData)}
        </div>
      )}

      {/* Statistics Tab */}
      {!loading && activeTab === "stats" && stats && (
        <div className={styles.orderStatusCard}>
          <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
            Overall Statistics
          </h4>
          {stats.summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Inward Stock</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 700, color: '#059669' }}>
                  {Number(stats.summary.totalInwardStock || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Outward Stock</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>
                  {Number(stats.summary.totalOutwardStock || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Closing Stock</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {Number(stats.summary.totalClosingStock || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Products</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 700, color: '#92400e' }}>
                  {stats.summary.totalProducts || 0}
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Stores</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 700, color: '#4338ca' }}>
                  {stats.summary.totalStores || 0}
                </div>
              </div>
            </div>
          )}
          {stats.stockByStore && stats.stockByStore.length > 0 && (
            <div>
              <h5 style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '16px' }}>Stock by Store</h5>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-bordered borderedtable" style={{ fontFamily: 'Poppins' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Store Name</th>
                      <th>Store Code</th>
                      <th>Inward Stock</th>
                      <th>Inward Value</th>
                      <th>Outward Stock</th>
                      <th>Outward Value</th>
                      <th>Closing Stock</th>
                      <th>Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.stockByStore.map((store, index) => (
                      <tr key={store.storeId || index}>
                        <td>{store.storeName}</td>
                        <td>{store.storeCode}</td>
                        <td style={{ color: '#059669' }}>{Number(store.inwardStock || 0).toFixed(2)}</td>
                        <td style={{ color: '#059669', fontWeight: 500 }}>₹{Number(store.inwardStockPrice || 0).toLocaleString()}</td>
                        <td style={{ color: '#ef4444' }}>{Number(store.outwardStock || 0).toFixed(2)}</td>
                        <td style={{ color: '#ef4444', fontWeight: 500 }}>₹{Number(store.outwardStockPrice || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>{Number(store.closingStock || 0).toFixed(2)}</td>
                        <td>{store.products || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                  {stats.stockByStore.length > 0 && (
                    <tfoot className="table-light" style={{ borderTop: '2px solid #e5e7eb', fontFamily: 'Poppins', fontSize: '13px' }}>
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>Total (Visible):</td>
                        <td style={{ fontWeight: 600, color: '#059669', padding: '12px' }}>
                          {stats.stockByStore.reduce((sum, s) => sum + (Number(s.inwardStock) || 0), 0).toFixed(2)}
                        </td>
                        <td style={{ fontWeight: 600, color: '#059669', padding: '12px' }}>
                          ₹{stats.stockByStore.reduce((sum, s) => sum + (Number(s.inwardStockPrice) || 0), 0).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600, color: '#ef4444', padding: '12px' }}>
                          {stats.stockByStore.reduce((sum, s) => sum + (Number(s.outwardStock) || 0), 0).toFixed(2)}
                        </td>
                        <td style={{ fontWeight: 600, color: '#ef4444', padding: '12px' }}>
                          ₹{stats.stockByStore.reduce((sum, s) => sum + (Number(s.outwardStockPrice) || 0), 0).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600, padding: '12px' }}>
                          {stats.stockByStore.reduce((sum, s) => sum + (Number(s.closingStock) || 0), 0).toFixed(2)}
                        </td>
                        <td style={{ fontWeight: 600, padding: '12px' }}>
                          {stats.stockByStore.reduce((sum, s) => sum + (Number(s.products) || 0), 0)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Tab */}
      {!loading && activeTab === "audit" && (
        <div className={styles.orderStatusCard}>
          <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
            Stock Movement History
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-bordered borderedtable" style={{ fontFamily: 'Poppins' }}>
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Transaction Type</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Total Price</th>
                  <th>Recorded At</th>
                  <th>Reference</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center" style={{ padding: '20px' }}>
                      No audit trail data found
                    </td>
                  </tr>
                ) : (
                  auditTrail.map((item, index) => {
                    const actualIndex = (page - 1) * limit + index + 1;
                    return (
                      <tr key={item.id || index} style={{ background: index % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                        <td>{item.productName}</td>
                        <td style={{ fontSize: '12px', color: '#666' }}>{item.productSKU}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: item.transactionType === 'inward' ? '#dcfce7' : '#fee2e2',
                            color: item.transactionType === 'inward' ? '#166534' : '#991b1b'
                          }}>
                            {item.transactionType?.toUpperCase() || '-'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{Number(item.quantity || 0).toFixed(2)}</td>
                        <td>{item.unit}</td>
                        <td style={{ fontWeight: 600 }}>₹{Number(item.totalPrice || 0).toLocaleString()}</td>
                        <td>{item.recordedAt ? new Date(item.recordedAt).toLocaleString() : '-'}</td>
                        <td>{item.referenceType ? `${item.referenceType}: ${item.referenceId}` : '-'}</td>
                        <td style={{ fontSize: '12px', color: '#666' }}>{item.remarks || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {auditTrail.length > 0 && (
                <tfoot className="table-light" style={{ borderTop: '2px solid #e5e7eb', fontFamily: 'Poppins', fontSize: '13px' }}>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>Totals:</td>
                    <td style={{ fontWeight: 600, padding: '12px' }}>
                      <div style={{ color: '#166534' }}>In: {auditTrail.filter(i => i.transactionType === 'inward').reduce((sum, i) => sum + (Number(i.quantity) || 0), 0).toFixed(2)}</div>
                      <div style={{ color: '#991b1b' }}>Out: {auditTrail.filter(i => i.transactionType !== 'inward').reduce((sum, i) => sum + (Number(i.quantity) || 0), 0).toFixed(2)}</div>
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontFamily: 'Poppins', color: '#666', fontSize: '14px' }}>
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} records
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handlePageChange("prev")}
                  disabled={page === 1 || loading}
                  style={{ fontFamily: 'Poppins', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FaArrowLeftLong />
                  Previous
                </button>
                <span style={{ fontFamily: 'Poppins', padding: '0 12px' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handlePageChange("next")}
                  disabled={page >= totalPages || loading}
                  style={{ fontFamily: 'Poppins', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Next
                  <FaArrowRightLong />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Opening/Closing Tab */}
      {!loading && activeTab === "opening-closing" && openingClosing && (
        <div className={styles.orderStatusCard}>
          <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
            Opening and Closing Stock ({from} to {to})
          </h4>
          {openingClosing.totals && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666' }}>Opening Stock</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '18px', fontWeight: 700 }}>{Number(openingClosing.totals.openingStock || 0).toFixed(2)}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666' }}>Inward Stock</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '18px', fontWeight: 700, color: '#059669' }}>{Number(openingClosing.totals.inwardStock || 0).toFixed(2)}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666' }}>Outward Stock</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '18px', fontWeight: 700, color: '#ef4444' }}>{Number(openingClosing.totals.outwardStock || 0).toFixed(2)}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#666' }}>Closing Stock</div>
                <div style={{ fontFamily: 'Poppins', fontSize: '18px', fontWeight: 700, color: 'var(--primary-color)' }}>{Number(openingClosing.totals.closingStock || 0).toFixed(2)}</div>
              </div>
            </div>
          )}
          {openingClosing.summaries && openingClosing.summaries.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-bordered borderedtable" style={{ fontFamily: 'Poppins' }}>
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Opening Stock</th>
                    <th>Opening Price</th>
                    <th>Inward Stock</th>
                    <th>Inward Price</th>
                    <th>Outward Stock</th>
                    <th>Outward Price</th>
                    <th>Stock In</th>
                    <th>Stock In Price</th>
                    <th>Stock Out</th>
                    <th>Stock Out Price</th>
                    <th>Closing Stock</th>
                    <th>Closing Price</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {openingClosing.summaries.map((item, index) => (
                    <tr key={item.id || index} style={{ background: index % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                      <td style={{ fontWeight: 600 }}>{item.product?.name || '-'}</td>
                      <td style={{ fontSize: '12px', color: '#666' }}>{item.product?.SKU || item.product?.sku || '-'}</td>
                      <td>{Number(item.openingStock || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: '#3b82f6' }}>₹{Number(item.openingStockPrice || 0).toLocaleString()}</td>
                      <td style={{ color: '#059669' }}>{Number(item.inwardStock || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: '#059669' }}>₹{Number(item.inwardStockPrice || 0).toLocaleString()}</td>
                      <td style={{ color: '#ef4444' }}>{Number(item.outwardStock || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: '#ef4444' }}>₹{Number(item.outwardStockPrice || 0).toLocaleString()}</td>
                      <td style={{ color: '#10b981' }}>{Number(item.stockIn || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>₹{Number(item.stockInPrice || 0).toLocaleString()}</td>
                      <td style={{ color: '#f59e0b' }}>{Number(item.stockOut || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: '#f59e0b' }}>₹{Number(item.stockOutPrice || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{Number(item.closingStock || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>₹{Number(item.closingStockPrice || 0).toLocaleString()}</td>
                      <td>{item.product?.unit || item.unit || 'kg'}</td>
                    </tr>
                  ))}
                </tbody>
                {openingClosing.summaries.length > 0 && (
                  <tfoot className="table-light" style={{ borderTop: '2px solid #e5e7eb', fontFamily: 'Poppins', fontSize: '13px' }}>
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'right', fontWeight: 600, padding: '12px 16px' }}>Total (Visible):</td>
                      <td style={{ fontWeight: 600, padding: '12px' }}>
                        {openingClosing.summaries.reduce((sum, item) => sum + (Number(item.openingStock) || 0), 0).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 600, color: '#3b82f6', padding: '12px' }}>
                        ₹{openingClosing.summaries.reduce((sum, item) => sum + (Number(item.openingStockPrice) || 0), 0).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: '#059669', padding: '12px' }}>
                        {openingClosing.summaries.reduce((sum, item) => sum + (Number(item.inwardStock) || 0), 0).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 600, color: '#059669', padding: '12px' }}>
                        ₹{openingClosing.summaries.reduce((sum, item) => sum + (Number(item.inwardStockPrice) || 0), 0).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: '#ef4444', padding: '12px' }}>
                        {openingClosing.summaries.reduce((sum, item) => sum + (Number(item.outwardStock) || 0), 0).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 600, color: '#ef4444', padding: '12px' }}>
                        ₹{openingClosing.summaries.reduce((sum, item) => sum + (Number(item.outwardStockPrice) || 0), 0).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: '#10b981', padding: '12px' }}>
                        {openingClosing.summaries.reduce((sum, item) => sum + (Number(item.stockIn) || 0), 0).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 600, color: '#10b981', padding: '12px' }}>
                        ₹{openingClosing.summaries.reduce((sum, item) => sum + (Number(item.stockInPrice) || 0), 0).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: '#f59e0b', padding: '12px' }}>
                        {openingClosing.summaries.reduce((sum, item) => sum + (Number(item.stockOut) || 0), 0).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 600, color: '#f59e0b', padding: '12px' }}>
                        ₹{openingClosing.summaries.reduce((sum, item) => sum + (Number(item.stockOutPrice) || 0), 0).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary-color)', padding: '12px' }}>
                        {openingClosing.summaries.reduce((sum, item) => sum + (Number(item.closingStock) || 0), 0).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary-color)', padding: '12px' }}>
                        ₹{openingClosing.summaries.reduce((sum, item) => sum + (Number(item.closingStockPrice) || 0), 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === "summary" && stockData.length === 0 && from && to && (
        <div className={styles.orderStatusCard}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h4 style={{ fontFamily: 'Poppins', color: '#666', marginBottom: '12px' }}>No stock data found</h4>
            <p style={{ fontFamily: 'Poppins', color: '#999', margin: 0 }}>
              No stock data available for the selected date range.
            </p>
          </div>
        </div>
      )}

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

export default StoreStockSummary;
