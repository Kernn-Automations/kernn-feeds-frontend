import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Dashboard/HomePage/HomePage.module.css";
import Productbox from "../Dashboard/HomePage/Productbox";
import LowStockAlerts from "../Dashboard/HomePage/LowStockAlerts";
import storeHomeStyles from "./StoreHome.module.css";
import storeService from "../../services/storeService";
import ErrorModal from "@/components/ErrorModal";
import { 
  FaUsers, 
  FaShoppingCart, 
  FaTruck, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBoxes,
  FaRupeeSign,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaChartLine,
  FaMoneyCheckAlt,
  FaUniversity,
  FaWallet,
  FaStore
} from "react-icons/fa";

export default function StoreHome() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 24,
    totalSales: 86540,
    totalProducts: 128,
    lowStockProducts: 7,
    customers: { total: 156, active: 120, kycPending: 18, rejected: 5 },
    orderStatuses: {
      pendingPaymentApprovals: 3,
      waitingForDelivery: 5,
      waitingForDispatch: 2,
      confirmed: 8,
      dispatched: 6,
      delivered: 10
    },
    topSellingProducts: [
      { name: 'Product A', sales: 120 },
      { name: 'Product B', sales: 90 },
      { name: 'Product C', sales: 70 },
      { name: 'Product D', sales: 60 },
      { name: 'Product E', sales: 55 }
    ],
    lowStockAlerts: [
      { productName: 'Product A', currentStock: 5, threshold: 20 },
      { productName: 'Product B', currentStock: 3, threshold: 15 },
      { productName: 'Product C', currentStock: 2, threshold: 10 }
    ],
    topPerformingBOs: [
      { name: 'John Doe', sales: 45000 },
      { name: 'Priya Sharma', sales: 38000 },
      { name: 'Amit Singh', sales: 32000 }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Day-wise sales reports data - Initialize with dummy data
  const [dayWiseSales, setDayWiseSales] = useState(() => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 80000) + 15000,
        orders: Math.floor(Math.random() * 20) + 8
      });
    }
    return dates;
  });
  
  // Payment reports data - Initialize with dummy data
  const [paymentReports, setPaymentReports] = useState({
    cash: 185500,
    bank: 142300,
    total: 327800,
    recentPayments: [
      { method: 'Cash', amount: 8500, date: new Date().toISOString().split('T')[0] },
      { method: 'Bank', amount: 15000, date: new Date().toISOString().split('T')[0] },
      { method: 'Cash', amount: 6200, date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
      { method: 'Bank', amount: 18000, date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
      { method: 'Cash', amount: 9500, date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
      { method: 'Bank', amount: 12000, date: new Date(Date.now() - 172800000).toISOString().split('T')[0] }
    ]
  });
  
  // Store performance data - Initialize with dummy data
  const [storePerformance, setStorePerformance] = useState([
    { storeName: 'Mumbai Central Store', sales: 485000, orders: 195, performance: 96, location: 'Mumbai' },
    { storeName: 'Delhi Main Branch', sales: 420000, orders: 168, performance: 92, location: 'Delhi' },
    { storeName: 'Bangalore Hub', sales: 380000, orders: 152, performance: 88, location: 'Bangalore' },
    { storeName: 'Pune Outlet', sales: 345000, orders: 138, performance: 82, location: 'Pune' },
    { storeName: 'Chennai Store', sales: 320000, orders: 128, performance: 78, location: 'Chennai' },
    { storeName: 'Hyderabad Branch', sales: 295000, orders: 118, performance: 75, location: 'Hyderabad' }
  ]);

  useEffect(() => {
    // Get store ID from user context
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const user = userData.user || userData;
    const id = user.storeId || user.store?.id;
    setStoreId(id);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch day-wise sales reports
  useEffect(() => {
    if (storeId) {
      fetchDayWiseSales();
    }
  }, [storeId]);

  // Fetch payment reports
  useEffect(() => {
    if (storeId) {
      fetchPaymentReports();
    }
  }, [storeId]);

  // Fetch store performance
  useEffect(() => {
    if (storeId) {
      fetchStorePerformance();
    }
  }, [storeId]);

  const fetchDayWiseSales = async () => {
    try {
      setLoading(true);
      // Get last 7 days sales
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);
      
      const params = {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0]
      };
      
      const response = await storeService.getDayWiseSalesReport(storeId, params);
      
      if (response.success && response.data) {
        setDayWiseSales(response.data);
      } else {
        // Use existing dummy data if API not available
      }
    } catch (err) {
      console.error('Error fetching day-wise sales:', err);
      // Keep existing dummy data on error
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentReports = async () => {
    try {
      setLoading(true);
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);
      
      const params = {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0]
      };
      
      const response = await storeService.getPaymentReports(storeId, params);
      
      if (response.success && response.data) {
        const cash = response.data.cashPayments || 0;
        const bank = response.data.bankPayments || 0;
        setPaymentReports({
          cash,
          bank,
          total: cash + bank,
          recentPayments: response.data.recentPayments || []
        });
      } else {
        // Use existing dummy data if API not available
      }
    } catch (err) {
      console.error('Error fetching payment reports:', err);
      // Keep existing dummy data on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStorePerformance = async () => {
    try {
      setLoading(true);
      const response = await storeService.getStorePerformance(storeId);
      
      if (response.success && response.data) {
        setStorePerformance(response.data);
      } else {
        // Use existing dummy data if API not available
      }
    } catch (err) {
      console.error('Error fetching store performance:', err);
      // Keep existing dummy data on error
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get user and store information for welcome message
  const [username, setUsername] = useState("");
  const [storeName, setStoreName] = useState("");
  
  useEffect(() => {
    // Get username from user data
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const name = user?.name || user?.employee_name || user?.username || user?.fullName || "User";
      setUsername(name);
    } catch (e) {
      console.error("Error parsing user data:", e);
      setUsername("User");
    }

    // Get store name from selectedStore
    try {
      const selectedStore = localStorage.getItem("selectedStore");
      if (selectedStore) {
        const store = JSON.parse(selectedStore);
        setStoreName(store.name || "");
      } else {
        // Fallback to currentStoreName
        const currentStoreName = localStorage.getItem("currentStoreName");
        setStoreName(currentStoreName || "");
      }
    } catch (e) {
      console.error("Error parsing store data:", e);
      const currentStoreName = localStorage.getItem("currentStoreName");
      setStoreName(currentStoreName || "");
    }
  }, []);

  // Get greeting based on time
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      {error && <ErrorModal message={error} isOpen={isModalOpen} onClose={closeModal} />}
      <div className={`${storeHomeStyles['store-home-container']} ${isMobile ? storeHomeStyles.mobile : ''}`} style={{ padding: isMobile ? '12px' : '20px' }}>
        {/* Welcome Message Section */}
        <div className={styles.dashboardHeader} style={{ marginBottom: '24px' }}>
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h2 className={styles.wish}>
                Hello, {greeting} {username} !! 👋
              </h2>
              <p className={styles.subtitle}>
                Welcome back to {storeName} store ! Here's what's happening with your business today.
              </p>
            </div>
          </div>
          <div className={styles.dateTime}>
            <div className={styles.dateIcon}>
              <FaClock />
            </div>
            <div className={styles.currentDate}>
              {currentDate}
            </div>
          </div>
        </div>

        {/* Statistics Cards Row */}
        <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaShoppingCart />
          </div>
          <div className={styles.statContent}>
            <h3>{dashboardData.totalOrders?.toLocaleString() || 0}</h3>
            <p>Today Orders</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaRupeeSign />
          </div>
          <div className={styles.statContent}>
            <h3>₹{dashboardData.totalSales?.toLocaleString() || 0}</h3>
            <p>Today Sales</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBoxes />
          </div>
          <div className={styles.statContent}>
            <h3>{dashboardData.lowStockProducts?.toLocaleString() || 0}</h3>
            <p>Low Stock Alerts</p>
            <span className={styles.alertIndicator}>
              {dashboardData.lowStockProducts || 0} items need attention
            </span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{dashboardData.customers?.total?.toLocaleString() || 0}</h3>
            <p>Total Customers</p>
            <span className={styles.statusIndicator}>
              {dashboardData.customers?.active || 0} active
            </span>
          </div>
        </div>
        </div>

      {/* Main Dashboard Content */}
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardGrid}>
          {/* Row 1: Sales Activity + Pending Indents */}
          <div className={styles.firstRow}>
            {/* Sales Activity Card */}
            <div className={styles.orderStatusCard}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>Sales Activity</h4>
              <div>
                {[{ customer: 'Rajesh Kumar', amount: 2500, time: '2h ago' }, { customer: 'Priya Sharma', amount: 1800, time: '4h ago' }, { customer: 'Amit Singh', amount: 3200, time: '6h ago' }].map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: idx % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent', borderRadius: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontFamily: 'Poppins', fontSize: '14px' }}>{s.customer}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Poppins' }}>{s.time}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#059669', fontFamily: 'Poppins', fontSize: '16px' }}>₹{s.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Indents Card */}
            <div className={styles.orderStatusCard}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>Pending Indents</h4>
              {[{ code: 'IND000123', value: 15000, status: 'Awaiting Approval' }, { code: 'IND000124', value: 9800, status: 'Awaiting Approval' }, { code: 'IND000125', value: 21000, status: 'Waiting for Stock' }].map((ind, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent', borderRadius: '8px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontFamily: 'Poppins', fontSize: '14px' }}>{ind.code}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Poppins' }}>{ind.status}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--primary-color)', fontFamily: 'Poppins', fontSize: '16px' }}>₹{ind.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Low Stock Products + Quick Insights */}
          <div className={styles.secondRow}>
            {/* Low Stock Products Card */}
            <div className={styles.orderStatusCard}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>Low Stock Products</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ marginBottom: 0, fontFamily: 'Poppins' }}>
                  <thead>
                    <tr>
                      <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Product</th>
                      <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Current</th>
                      <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Threshold</th>
                      <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.lowStockAlerts.map((p, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                        <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{p.productName}</td>
                        <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{p.currentStock}</td>
                        <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{p.threshold}</td>
                        <td>
                          <span className="badge bg-warning" style={{ fontFamily: 'Poppins', fontSize: '11px' }}>Low</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Insights Card */}
            <div className={styles.orderStatusCard}>
              <h4 style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--primary-color)', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>Quick Insights</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(8,145,178,0.08)', borderRadius: 12, padding: 16, border: '1px solid rgba(8,145,178,0.1)' }}>
                  <div style={{ fontSize: 12, color: '#0e7490', fontFamily: 'Poppins', fontWeight: 500, marginBottom: '8px' }}>Pending Returns</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#0e7490', fontFamily: 'Poppins' }}>{dashboardData.orderStatuses?.pendingPaymentApprovals || 0}</div>
                </div>
                <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 12, padding: 16, border: '1px solid rgba(124,58,237,0.1)' }}>
                  <div style={{ fontSize: 12, color: '#6d28d9', fontFamily: 'Poppins', fontWeight: 500, marginBottom: '8px' }}>Active Customers</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#6d28d9', fontFamily: 'Poppins' }}>{dashboardData.customers?.active || 0}</div>
                </div>
                <div style={{ background: 'rgba(217,119,6,0.08)', borderRadius: 12, padding: 16, border: '1px solid rgba(217,119,6,0.1)' }}>
                  <div style={{ fontSize: 12, color: '#b45309', fontFamily: 'Poppins', fontWeight: 500, marginBottom: '8px' }}>Avg. Order Value</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#b45309', fontFamily: 'Poppins' }}>₹{Math.round((dashboardData.totalSales || 0) / Math.max(dashboardData.totalOrders || 1, 1)).toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(5,150,105,0.08)', borderRadius: 12, padding: 16, border: '1px solid rgba(5,150,105,0.1)' }}>
                  <div style={{ fontSize: 12, color: '#047857', fontFamily: 'Poppins', fontWeight: 500, marginBottom: '8px' }}>Delivered Today</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#047857', fontFamily: 'Poppins' }}>{dashboardData.orderStatuses?.delivered || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Day-wise Sales Reports + Payment Reports */}
          <div className={styles.firstRow}>
            {/* Day-wise Sales Reports Card */}
            <div className={styles.orderStatusCard}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>Day-wise Sales Reports</h4>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {dayWiseSales.length > 0 ? (
                  <table className="table" style={{ marginBottom: 0, fontFamily: 'Poppins' }}>
                    <thead>
                      <tr>
                        <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Date</th>
                        <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Orders</th>
                        <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayWiseSales.slice().reverse().map((day, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                          <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{formatDate(day.date)}</td>
                          <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{day.orders || 0}</td>
                          <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: '#059669' }}>₹{(day.sales || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontFamily: 'Poppins' }}>
                    No sales data available
                  </div>
                )}
              </div>
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '1px solid #e5e7eb', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Total (7 days)</span>
                <span style={{ fontFamily: 'Poppins', fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>
                  ₹{dayWiseSales.reduce((sum, day) => sum + (day.sales || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Reports Card */}
            <div className={styles.orderStatusCard}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>Payment Reports</h4>
              
              {/* Payment Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '20px' }}>
                <div style={{ 
                  background: 'rgba(5,150,105,0.08)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  border: '1px solid rgba(5,150,105,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaWallet style={{ color: '#047857', fontSize: '16px' }} />
                    <div style={{ fontSize: '12px', color: '#047857', fontFamily: 'Poppins', fontWeight: 500 }}>Cash</div>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#047857', fontFamily: 'Poppins' }}>
                    ₹{(paymentReports.cash || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(59, 130, 246,0.08)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  border: '1px solid rgba(59, 130, 246,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaUniversity style={{ color: '#3b82f6', fontSize: '16px' }} />
                    <div style={{ fontSize: '12px', color: '#3b82f6', fontFamily: 'Poppins', fontWeight: 500 }}>Bank</div>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6', fontFamily: 'Poppins' }}>
                    ₹{(paymentReports.bank || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Recent Payments */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', fontFamily: 'Poppins', marginBottom: '12px' }}>Recent Payments</div>
                {paymentReports.recentPayments && paymentReports.recentPayments.length > 0 ? (
                  <div>
                    {paymentReports.recentPayments.slice(0, 5).map((payment, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '10px', 
                        background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent', 
                        borderRadius: '8px', 
                        marginBottom: '6px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            background: payment.method === 'Cash' ? 'rgba(5,150,105,0.1)' : 'rgba(59, 130, 246,0.1)',
                            color: payment.method === 'Cash' ? '#047857' : '#3b82f6'
                          }}>
                            {payment.method}
                          </span>
                          <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Poppins' }}>{formatDate(payment.date)}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: '#111827', fontFamily: 'Poppins', fontSize: '14px' }}>
                          ₹{(payment.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#6b7280', fontFamily: 'Poppins', fontSize: '13px' }}>
                    No recent payments
                  </div>
                )}
              </div>

              {/* Total Payment */}
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '1px solid #e5e7eb', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Total Payments</span>
                <span style={{ fontFamily: 'Poppins', fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>
                  ₹{(paymentReports.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Store-wise Performance */}
          <div className={styles.firstRow}>
            <div className={styles.orderStatusCard} style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>Store-wise Performance</h4>
              <div style={{ overflowX: 'auto' }}>
                {storePerformance.length > 0 ? (
                  <table className="table" style={{ marginBottom: 0, fontFamily: 'Poppins' }}>
                    <thead>
                      <tr>
                        <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Store</th>
                        <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Sales</th>
                        <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Orders</th>
                        <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storePerformance.map((store, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                          <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>{store.storeName}</td>
                          <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                            ₹{(store.sales || 0).toLocaleString()}
                          </td>
                          <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{store.orders || 0}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                flex: 1, 
                                height: '8px', 
                                background: '#e5e7eb', 
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${store.performance || 0}%`, 
                                  height: '100%', 
                                  background: store.performance >= 90 ? '#10b981' : store.performance >= 70 ? '#f59e0b' : '#ef4444',
                                  borderRadius: '4px',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                              <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#6b7280', minWidth: '40px' }}>
                                {store.performance || 0}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontFamily: 'Poppins' }}>
                    No store performance data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}


