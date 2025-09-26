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
    <>
      {/* Quick Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '12px', color: '#374151' }}>Quick Actions</h4>
        <button 
          className="btn btn-success" 
          onClick={() => navigate("/store/sales?mode=create")}>
          Create Sale
        </button>
      </div>

      {/* Statistics Cards Row (distinct store style) */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {[{
          title: 'Today Orders', value: dashboardData.totalOrders, color: '#2563eb', bg: 'rgba(37,99,235,0.1)', icon: <FaShoppingCart />
        }, {
          title: 'Today Sales', value: `₹${dashboardData.totalSales.toLocaleString()}`, color: '#059669', bg: 'rgba(5,150,105,0.1)', icon: <FaRupeeSign />
        }, {
          title: 'Low Stock', value: dashboardData.lowStockProducts, color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: <FaBoxes />
        }, {
          title: 'Customers', value: dashboardData.customers.total, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', icon: <FaUsers />
        }].map((kpi, i) => (
          <div key={i} style={{
            flex: '1 1 220px',
            minWidth: 220,
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{kpi.title}</div>
              <div style={{ background: kpi.bg, color: kpi.color, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kpi.icon}</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: '#111827' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Two-column main panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Sales Activity timeline */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h5 style={{ margin: 0, color: '#111827' }}>Sales Activity</h5>
            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/store/sales')}>Open Sales</button>
          </div>
          <div>
            {[{ customer: 'Rajesh Kumar', amount: 2500, time: '2h ago' }, { customer: 'Priya Sharma', amount: 1800, time: '4h ago' }, { customer: 'Amit Singh', amount: 3200, time: '6h ago' }].map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < 2 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{s.customer}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{s.time}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#059669' }}>₹{s.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Indents */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h5 style={{ margin: 0, color: '#111827' }}>Pending Indents</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/store/indents')}>Open Indents</button>
          </div>
          {[{ code: 'IND000123', value: 15000, status: 'Awaiting Approval' }, { code: 'IND000124', value: 9800, status: 'Awaiting Approval' }, { code: 'IND000125', value: 21000, status: 'Waiting for Stock' }].map((ind, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>{ind.code}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{ind.status}</div>
              </div>
              <div style={{ fontWeight: 600 }}>₹{ind.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Second row: Low stock table + Quick insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Low Stock Table */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0, color: '#111827' }}>Low Stock Products</h5>
            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/store/inventory')}>Open Inventory</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.lowStockAlerts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.productName}</td>
                    <td>{p.currentStock}</td>
                    <td>{p.threshold}</td>
                    <td>
                      <span className="badge bg-warning">Low</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h5 style={{ marginBottom: 12, color: '#111827' }}>Quick Insights</h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(8,145,178,0.08)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#0e7490' }}>Pending Returns</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{dashboardData.orderStatuses?.pendingPaymentApprovals || 0}</div>
            </div>
            <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#6d28d9' }}>Active Customers</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{dashboardData.customers?.active || 0}</div>
            </div>
            <div style={{ background: 'rgba(217,119,6,0.08)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#b45309' }}>Avg. Order Value</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>₹{Math.round((dashboardData.totalSales || 0) / Math.max(dashboardData.totalOrders || 1, 1)).toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(5,150,105,0.08)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#047857' }}>Delivered Today</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{dashboardData.orderStatuses?.delivered || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


