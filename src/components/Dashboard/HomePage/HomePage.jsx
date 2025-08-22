import React, { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import Productbox from "./Productbox";
import Customers from "./Customers";
import ProductBarchart from "./ProductBarchart";
import PaymentApprovals from "./PaymentApprovals";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext";
import axios from "axios";
import PageSkeleton from "@/components/SkeletonLoaders/PageSkeleton";
import LowStockAlerts from "./LowStockAlerts";
import { 
  FaChartLine, 
  FaUsers, 
  FaShoppingCart, 
  FaTruck, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBoxes,
  FaWarehouse,
  FaUserCheck,
  FaUserClock,
  FaUserTimes
} from "react-icons/fa";

function HomePage() {
  const hour = new Date().getHours();
  let wish;
  const user = JSON.parse(localStorage.getItem("user"));

  if (hour < 12) {
    wish = "Good Morning";
  } else if (hour < 18) {
    wish = "Good Afternoon";
  } else {
    wish = "Good Evening";
  }

  // Backend
  const { axiosAPI } = useAuth();
  const { selectedDivision, showAllDivisions } = useDivision();
  
  // Add logging for division context
  useEffect(() => {
    console.log('HomePage - Division context updated:', {
      selectedDivision,
      showAllDivisions,
      selectedDivisionId: selectedDivision?.id,
      timestamp: new Date().toISOString()
    });
  }, [selectedDivision, showAllDivisions]);
  
  // Listen for division change events to refresh data
  useEffect(() => {
    const handleRefreshData = (event) => {
      console.log('HomePage - Received refreshData event:', event.detail);
      // The existing useEffect will automatically refetch data when selectedDivision changes
    };

    window.addEventListener('refreshData', handleRefreshData);
    return () => {
      window.removeEventListener('refreshData', handleRefreshData);
    };
  }, []);

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [successful, setSuccessful] = useState();

  const formData = new FormData();

  const [products, setProducts] = useState();
  const [paymentsApprovals, setPaymentsApprovals] = useState();
  const [topPerformingBOs, setTopPerformingBOs] = useState();
  const [kycApprovals, setKycApprovals] = useState();
  const [lowStock, setLowStock] = useState();
  const [orderStatuses, setOrderStatuses] = useState();
  
  // New state for enhanced dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 1250000,
    totalOrders: 1250,
    totalCustomers: 450,
    totalProducts: 89,
    monthlyGrowth: 12.5,
    pendingDeliveries: 45,
    lowStockCount: 8,
    qualityIssues: 3
  });

  const VITE_API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        
        // ✅ Get division ID for filtering
        const divisionId = selectedDivision?.id;
        
        // ✅ Wait for division to be available
        if (!divisionId) {
          setLoading(false);
          return;
        }
        
        // ✅ Build URL with division parameters
        let url = "/dashboard/home";
        console.log('HomePage - Building URL with:', {
          divisionId,
          divisionIdType: typeof divisionId,
          showAllDivisions,
          isDivisionIdAll: divisionId === "all",
          isDivisionIdAllStrict: divisionId === "all",
          isDivisionIdAllLoose: divisionId == "all"
        });
        
        if (showAllDivisions || divisionId === "all") {
          url += "?showAllDivisions=true";
          console.log('HomePage - Using showAllDivisions=true for URL');
        } else if (divisionId) {
          url += `?divisionId=${divisionId}`;
          console.log('HomePage - Using divisionId for URL:', divisionId);
        }
        
        console.log('HomePage - Final URL built:', url);
        
        const res = await axiosAPI.get(url);

        // Map the new backend response structure
        setKycApprovals(res.data.kycApprovals);
        setPaymentsApprovals(res.data.orderStatuses?.pendingPaymentApprovals);
        setTopPerformingBOs(res.data.topPerformingBOs);
        setProducts(res.data.topSellingProducts);
        setLowStock(res.data.lowStockAlerts);
        setOrderStatuses(res.data.orderStatuses);
        
        // Set dashboard statistics
        if (res.data.dashboardStats) {
          setDashboardStats(res.data.dashboardStats);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load Dashboard.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    
    // ✅ Only fetch if division is selected
    if (selectedDivision?.id) {
      fetchInitial();
    } else {
      // ✅ Show loading state while waiting for division
      setLoading(true);
    }
  }, [selectedDivision, showAllDivisions]); // ✅ Add dependencies

  // ✅ Monitor division changes and fetch data when division is selected
  useEffect(() => {
    const divisionId = selectedDivision?.id;
    if (divisionId && !loading) {
      // Trigger data fetch when division changes
      const fetchData = async () => {
        try {
          setLoading(true);
          
          let url = "/dashboard/home";
          if (showAllDivisions || divisionId === "all") {
            url += "?showAllDivisions=true";
            console.log('HomePage - Refetch using showAllDivisions=true for URL');
          } else if (divisionId) {
            url += `?divisionId=${divisionId}`;
            console.log('HomePage - Refetch using divisionId for URL:', divisionId);
          }
          
          console.log('HomePage - Refetch final URL built:', url);
          
          const res = await axiosAPI.get(url);

          setKycApprovals(res.data.kycApprovals);
          setPaymentsApprovals(res.data.orderStatuses?.pendingPaymentApprovals);
          setTopPerformingBOs(res.data.topPerformingBOs);
          setProducts(res.data.topSellingProducts);
          setLowStock(res.data.lowStockAlerts);
          setOrderStatuses(res.data.orderStatuses);
          
          // Set dashboard statistics
          if (res.data.dashboardStats) {
            setDashboardStats(res.data.dashboardStats);
          }
        } catch (err) {
          console.error("Dashboard refetch error:", err);
          setError(err?.response?.data?.message || "Failed to reload Dashboard.");
          setIsModalOpen(true);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [selectedDivision?.id]); // ✅ Monitor division ID changes

  // Mock data for demonstration - replace with actual API calls
  const mockChartData = {
    salesTrend: [12, 19, 3, 5, 2, 3, 15, 8, 12, 15, 18, 22],
    productPerformance: [
      { name: 'Curd', value: 120, color: '#3B82F6' },
      { name: 'Butter', value: 280, color: '#F59E0B' },
      { name: 'Milk Powder', value: 150, color: '#10B981' },
      { name: 'Ghee', value: 80, color: '#8B5CF6' },
      { name: 'Butter Milk', value: 200, color: '#06B6D4' }
    ],
    procurementQuality: {
      fat: 3.8,
      snf: 8.5,
      protein: 3.2,
      lactose: 4.8
    }
  };

  return (
    <>
      <div className={styles.dashboardHeader}>
        <div className={styles.welcomeSection}>
          {/* <div className={styles.welcomeIcon}>
            <FaChartLine />
          </div> */}
          <div className={styles.welcomeText}>
            <h2 className={styles.wish}>
              Hello, {wish} {user?.name} !! 👋
            </h2>
            <p className={styles.subtitle}>
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
        </div>
        <div className={styles.dateTime}>
          <div className={styles.dateIcon}>
            <FaClock />
          </div>
          <div className={styles.currentDate}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
      
      {/* ✅ Show loading when waiting for division */}
      {!selectedDivision?.id && (
        <div className={styles.divisionAlert}>
          <div className="alert alert-info">
            <strong>Please select a division to view dashboard data</strong>
            <br />
            <small>Waiting for division selection...</small>
          </div>
        </div>
      )}
      
      {/* Statistics Cards Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaShoppingCart />
          </div>
          <div className={styles.statContent}>
            <h3>{dashboardStats.totalOrders}</h3>
            <p>Total Orders</p>
            <span className={styles.statusIndicator}>
              {orderStatuses?.pending || 0} confirmed
            </span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{dashboardStats.totalCustomers}</h3>
            <p>Total Customers</p>
            <span className={styles.statusIndicator}>
              {kycApprovals?.length || 0} KYC pending
            </span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBoxes />
          </div>
          <div className={styles.statContent}>
            <h3>{dashboardStats.totalProducts}</h3>
            <p>Total Products</p>
            <span className={styles.alertIndicator}>
              {dashboardStats.lowStockCount} low stock
            </span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCheckCircle />
          </div>
          <div className={styles.statContent}>
            <h3>{orderStatuses?.delivered || 0}</h3>
            <p>Total Delivered</p>
            <span className={styles.statusIndicator}>
              {orderStatuses?.delivered || 0} orders completed
            </span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardGrid}>
          {/* Row 1: Product Card + Order Status Overview with Customers */}
          <div className={styles.firstRow}>
            <Productbox products={products} />
            <div className={styles.orderStatusCard}>
              <h4>Order Status Overview</h4>
              <div className={styles.orderStatusGrid}>
                <div className={styles.statusItem}>
                  <div className={styles.statusIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                    <FaClock />
                  </div>
                  <div className={styles.statusInfo}>
                    <h5>{orderStatuses?.pending || 0}</h5>
                    <p>Confirmed</p>
                  </div>
                </div>
                <div className={styles.statusItem}>
                  <div className={styles.statusIcon} style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                    <FaTruck />
                  </div>
                  <div className={styles.statusInfo}>
                    <h5>{orderStatuses?.dispatched || 0}</h5>
                    <p>Dispatched</p>
                  </div>
                </div>
                <div className={styles.statusItem}>
                  <div className={styles.statusIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                    <FaCheckCircle />
                  </div>
                  <div className={styles.statusInfo}>
                    <h5>{orderStatuses?.delivered || 0}</h5>
                    <p>Delivered</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.customersSection}>
                <h4>Customers</h4>
                <div className={styles.customersGrid}>
                  <div className={styles.customerMetric}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                      <FaUsers style={{ color: "#3b82f6" }} />
                    </div>
                    <div className={styles.metricContent}>
                      <h6>{dashboardStats?.totalCustomers || 0}</h6>
                      <p>Total Customers</p>
                    </div>
                  </div>
                  <div className={styles.customerMetric}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                      <FaUserCheck style={{ color: "#22c55e" }} />
                    </div>
                    <div className={styles.metricContent}>
                      <h6>{dashboardStats?.activeCustomers || 0}</h6>
                      <p>Active Customers</p>
                    </div>
                  </div>
                  <div className={styles.customerMetric}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
                      <FaUserClock style={{ color: "#f59e0b" }} />
                    </div>
                    <div className={styles.metricContent}>
                      <h6>{kycApprovals?.length || 0}</h6>
                      <p>KYC Pending</p>
                    </div>
                  </div>
                  <div className={styles.customerMetric}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                      <FaUserTimes style={{ color: "#ef4444" }} />
                    </div>
                    <div className={styles.metricContent}>
                      <h6>{dashboardStats?.kycRejected || 0}</h6>
                      <p>KYC Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Low Stock Alerts + Top Performers */}
          <div className={styles.secondRow}>
            <LowStockAlerts lowStockNotifications={lowStock} />
            <div className={styles.performanceCard}>
              <div className={styles.performanceHeader}>
                <h4>Top Performers</h4>
                <div style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  fontFamily: 'Poppins' 
                }}>
                  {topPerformingBOs?.length || 0}
                </div>
              </div>
              <div className={styles.performerList}>
                {topPerformingBOs?.slice(0, 5).map((bo, index) => (
                  <div key={index} className={styles.performerItem}>
                    <div className={styles.rankBadge}>{index + 1}</div>
                    <div className={styles.performerInfo}>
                      <h6>{bo.name}</h6>
                      <p>₹{bo.sales?.toLocaleString()}</p>
                    </div>
                    <div className={styles.performanceBar}>
                      <div 
                        className={styles.barFill} 
                        style={{ width: `${(bo.sales / (topPerformingBOs[0]?.sales || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Empty (removed Performance Overview) */}
          <div className={styles.thirdRow}>
            {/* Performance Overview card removed */}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      
        
        {/* <div className={styles.systemAlerts}>
          <h4>System Alerts</h4>
          <div className={styles.alertsList}>
            <div className={styles.alertItem}>
              <FaExclamationTriangle className={styles.alertIcon} />
              <span>Low stock alert for Butter</span>
            </div>
            <div className={styles.alertItem}>
              <FaExclamationTriangle className={styles.alertIcon} />
              <span>Payment overdue for Supplier A</span>
            </div>
            <div className={styles.alertItem}>
              <FaExclamationTriangle className={styles.alertIcon} />
              <span>Quality check required for new batch</span>
            </div>
          </div>
        </div> */}
      

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <PageSkeleton />}
    </>
  );
}

export default HomePage;
