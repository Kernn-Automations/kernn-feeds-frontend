import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Dashboard/HomePage/HomePage.module.css";
import Productbox from "../Dashboard/HomePage/Productbox";
import LowStockAlerts from "../Dashboard/HomePage/LowStockAlerts";
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
  FaUserTimes
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

  useEffect(() => {
    // Hook for future API wiring; using mock data above for now
  }, []);

  return (
    <div style={{ padding: '20px' }}>
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
        </div>
      </div>
    </div>
  );
}


