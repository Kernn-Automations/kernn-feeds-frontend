import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Auth";
import storeService from "../../../services/storeService";
import { isAdmin } from "../../../utils/roleUtils";
import Loading from "../../Loading";
import ErrorModal from "../../ErrorModal";
import CustomSearchDropdown from "../../../utils/CustomSearchDropDown";
import styles from "./StoreSalesOrders.module.css";
import homeStyles from "../../Dashboard/HomePage/HomePage.module.css";
import inventoryStyles from "../../Dashboard/Inventory/Inventory.module.css";
import xls from "../../../images/xls-png.png";
import pdf from "../../../images/pdf-png.png";

function StoreSalesReports({ onBack }) {
  const { axiosAPI } = useAuth();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [responseData, setResponseData] = useState(null); // Store full response for summary totals
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    customerId: null,
    modeOfPayment: ""
  });

  useEffect(() => {
    // Get store ID from multiple sources (same as StoreSalesOrders)
    try {
      let id = null;
      
      // Try from selectedStore in localStorage
      const selectedStore = localStorage.getItem("selectedStore");
      if (selectedStore) {
        try {
          const store = JSON.parse(selectedStore);
          id = store.id;
        } catch (e) {
          console.error("Error parsing selectedStore:", e);
        }
      }
      
      // Fallback to currentStoreId
      if (!id) {
        const currentStoreId = localStorage.getItem("currentStoreId");
        id = currentStoreId ? parseInt(currentStoreId) : null;
      }
      
      // Fallback to user object
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

  // Fetch customers when storeId is available
  useEffect(() => {
    if (storeId) {
      fetchCustomers();
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchSalesData();
    }
  }, [storeId, filters]);

  const fetchCustomers = async () => {
    if (!storeId) return;
    
    try {
      const response = await storeService.getStoreCustomers(storeId, { limit: 1000 });
      const customersData = response.data || response.customers || [];
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  const fetchSalesData = async () => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = {};
      
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.modeOfPayment) params.modeOfPayment = filters.modeOfPayment;
      params.limit = 1000; // Get all records for report
      
      // Check if user is admin to use admin endpoint
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const isAdminUser = isAdmin(user);
      
      // Use the new sales reports endpoints
      const response = isAdminUser 
        ? await storeService.getStoreSalesReportsAdmin(storeId, params)
        : await storeService.getStoreSalesReports(storeId, params);
      
      // Handle backend response format
      // New backend structure: response.data is an array with simplified fields
      const salesData = response.data || response.sales || response || [];
      
      console.log('Sales Reports - Backend response:', response);
      console.log('Sales Reports - Sales data array:', salesData);
      
      // Transform data to match table format
      // Backend now returns: { date, productName, customerName, villageName, phoneNumber, qty, amount, modeOfPayment }
      // May also have nested customer object: { customer: { villageName, mobile, farmerName } }
      const mappedData = [];
      
      if (Array.isArray(salesData)) {
        salesData.forEach((item, index) => {
          console.log(`Sales Reports - Processing item ${index}:`, item);
          console.log(`Sales Reports - Item ${index} villageName:`, item.villageName, 'customer:', item.customer);
          // Map payment method to uppercase display format
          let paymentMethod = "";
          const method = (item.modeOfPayment || "").toUpperCase();
          if (method === "CASH") {
            paymentMethod = "CASH";
          } else if (method === "BANK") {
            paymentMethod = "BANK";
          } else if (method === "PHONE PAY" || method === "PHONEPAY" || method === "UPI") {
            paymentMethod = "PHONE PAY";
          } else if (method && method !== "") {
            paymentMethod = method;
          } else {
            paymentMethod = "NEED TO COLLECT";
          }
          
          // Handle village name - check multiple possible field names and formats
          let villageName = "";
          if (item.villageName) {
            villageName = item.villageName.trim();
            if (villageName === "" || villageName === "-" || villageName.toLowerCase() === "null") {
              villageName = "";
            }
          } else if (item.customer?.villageName) {
            villageName = item.customer.villageName.trim();
            if (villageName === "" || villageName === "-" || villageName.toLowerCase() === "null") {
              villageName = "";
            }
          }
          
          // Handle phone number - check multiple possible field names and formats
          let phoneNumber = "";
          if (item.phoneNumber) {
            phoneNumber = item.phoneNumber.trim();
            if (phoneNumber === "" || phoneNumber === "-" || phoneNumber.toLowerCase() === "null") {
              phoneNumber = "";
            }
          } else if (item.customer?.mobile) {
            phoneNumber = item.customer.mobile.trim();
            if (phoneNumber === "" || phoneNumber === "-" || phoneNumber.toLowerCase() === "null") {
              phoneNumber = "";
            }
          }
          
          mappedData.push({
            date: item.date || "",
            productName: item.productName || "N/A",
            stockIssuedTo: item.customerName || item.customer?.farmerName || item.customer?.name || "Customer",
            villageName: villageName,
            phoneNumber: phoneNumber,
            quantity: parseFloat(item.qty || item.quantity || 0),
            amount: parseFloat(item.amount || 0),
            modeOfPayment: paymentMethod,
            createdBy: item.employeeName || item.createdByEmployee?.name || item.createdByUser?.name || "-"
          });
        });
      }
      
      setSalesData(mappedData);
      setResponseData(response); // Store full response for summary totals
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(err.response?.data?.message || err.message || "Failed to fetch sales data.");
      setIsModalOpen(true);
      setSalesData([]);
      setResponseData(null);
    } finally {
      setLoading(false);
    }
  };

  // Format date to DD-Mon-YY format
  // Handles both "DD-MM-YYYY" format from backend and ISO date strings
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Check if date is in "DD-MM-YYYY" format (from backend)
    const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateString.match(ddmmyyyyPattern);
    
    if (match) {
      // Already in DD-MM-YYYY format, convert to DD-Mon-YY
      const [, day, month, year] = match;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(month, 10) - 1;
      const monthName = months[monthIndex] || month;
      const yearShort = year.slice(-2);
      return `${day}-${monthName}-${yearShort}`;
    }
    
    // Try parsing as ISO date or other format
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as-is if can't parse
      }
      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = String(date.getFullYear()).slice(-2);
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString; // Return as-is if parsing fails
    }
  };

  // Format amount with Indian number format
  const formatAmount = (amount) => {
    if (!amount) return "0";
    return parseFloat(amount).toLocaleString('en-IN');
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    fetchSalesData();
  };

  const handleCancel = () => {
    setFilters({ fromDate: "", toDate: "", customerId: null, modeOfPayment: "" });
  };

  const closeModal = () => setIsModalOpen(false);

  // Export functionality
  const handleExport = async (type) => {
    if (!storeId) {
      setError("Store information missing. Please re-login to continue.");
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {};
      
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.modeOfPayment) params.modeOfPayment = filters.modeOfPayment;

      // Check if user is admin
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const isAdminUser = isAdmin(user);

      // Build endpoint based on user role
      const endpoint = isAdminUser
        ? `/stores/admin/${storeId}/reports/sales/export/${type === "PDF" ? "pdf" : "excel"}`
        : `/stores/${storeId}/reports/sales/export/${type === "PDF" ? "pdf" : "excel"}`;

      console.log('Export endpoint:', endpoint);
      console.log('Export params:', params);

      // Build query string for params
      const queryParams = new URLSearchParams(params).toString();
      const fullEndpoint = `${endpoint}${queryParams ? `?${queryParams}` : ''}`;

      // Use getpdf method which is configured for blob responses (works for both PDF and Excel)
      const response = await axiosAPI.getpdf(fullEndpoint);
      
      // Check if we got a valid response
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Check if it's a proper blob
      if (!(response.data instanceof Blob)) {
        console.error('Response is not a blob:', response.data);
        throw new Error('Invalid response format - expected blob');
      }

      // Check if blob has content
      if (response.data.size === 0) {
        throw new Error('Received empty file from server');
      }

      // Create download link
      const downloadUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `store-sales-report-${dateStr}.${type === "PDF" ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log(`${type} download initiated successfully`);
    } catch (err) {
      console.error(`Error exporting ${type}:`, err);
      setError(err.response?.data?.message || err.message || `Failed to export ${type}. Please try again.`);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className="path">
            <span onClick={() => navigate("/store/sales")}>Sales</span>{" "}
            <i className="bi bi-chevron-right"></i> Reports
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
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
            />
          </div>
          <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 formcontent">
            <label>To :</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
            />
          </div>
          
          <CustomSearchDropdown
            label="Customer"
            onSelect={(value) => handleFilterChange("customerId", value)}
            options={customers.map((customer) => ({
              value: customer.id,
              label: customer.farmerName || customer.name || customer.customerName || `Customer ${customer.id}`
            }))}
          />

          <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 formcontent">
            <label>Mode of Payment :</label>
            <select
              value={filters.modeOfPayment}
              onChange={(e) => handleFilterChange("modeOfPayment", e.target.value)}
            >
              <option value="">All</option>
              <option value="CASH">CASH</option>
              <option value="BANK">BANK</option>
              <option value="PHONE PAY">PHONE PAY</option>
              <option value="UPI">UPI</option>
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

        {/* Export buttons - only show when there's data */}
        {salesData.length > 0 && (
          <div className="row m-0 p-3 justify-content-around">
            <div className="col-lg-5">
              <button 
                className={inventoryStyles.xls} 
                onClick={() => handleExport("XLS")}
                disabled={loading}
              >
                <p>Export to </p>
                <img src={xls} alt="" />
              </button>
              <button 
                className={inventoryStyles.xls} 
                onClick={() => handleExport("PDF")}
                disabled={loading}
              >
                <p>Export to </p>
                <img src={pdf} alt="" />
              </button>
            </div>
          </div>
        )}

        <div className={`${styles.tableContainer} table-responsive`}>
          <table className="table table-hover table-bordered borderedtable">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Product Name</th>
                <th>Stock Issued To</th>
                <th>Village Name</th>
                <th>Phone Number</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Mode Of Payment</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center" style={{ padding: '20px' }}>
                    Loading...
                  </td>
                </tr>
              ) : salesData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center" style={{ padding: '20px' }}>
                    No sales data found
                  </td>
                </tr>
              ) : (
                salesData.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDate(row.date)}</td>
                    <td>{row.productName}</td>
                    <td>{row.stockIssuedTo}</td>
                    <td>{row.villageName || "-"}</td>
                    <td>{row.phoneNumber || "-"}</td>
                    <td style={{ textAlign: 'right' }}>{row.quantity}</td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{formatAmount(row.amount)}
                    </td>
                    <td>{row.modeOfPayment || "-"}</td>
                    <td>{row.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {salesData.length > 0 && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontFamily: 'Poppins'
          }}>
            <div>
              <strong>Total Records: </strong>
              {responseData?.totals?.totalRecords || responseData?.pagination?.total || salesData.length}
            </div>
            <div>
              <strong>Total Quantity: </strong>
              {responseData?.totals?.totalQuantity || salesData.reduce((sum, row) => sum + (parseFloat(row.quantity) || 0), 0)}
            </div>
            <div>
              <strong>Total Amount: </strong>
              ₹{formatAmount(responseData?.totals?.totalAmount || responseData?.totals?.totalValue || salesData.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0))}
            </div>
          </div>
        )}
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

export default StoreSalesReports;
