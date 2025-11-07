import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import { FaBoxes, FaExclamationTriangle, FaArrowDown, FaChartLine } from "react-icons/fa";

export default function StoreInventory() {
  const navigate = useNavigate();

  const mockInventoryData = {
    lowStockItems: 7,
    incomingTransfers: 3,
    damagedThisWeek: 2,
    totalProducts: 128,
    totalStockValue: 245000,
    recentMovements: [
      { product: "Product A", type: "Incoming", quantity: 50, date: "2h ago" },
      { product: "Product B", type: "Outgoing", quantity: 25, date: "4h ago" },
      { product: "Product C", type: "Incoming", quantity: 100, date: "6h ago" }
    ],
    lowStockProducts: [
      { name: "Product A", current: 5, threshold: 20, unit: "kg" },
      { name: "Product B", current: 8, threshold: 15, unit: "kg" },
      { name: "Product C", current: 12, threshold: 25, unit: "kg" }
    ]
  };

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
        }}>Inventory Management</h2>
      </div>

      {/* Action Buttons */}
      <div className="row m-0 p-2" style={{ marginBottom: '24px' }}>
        <div className="col" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="homebtn"
            onClick={() => navigate('/store/current-stock')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1' }}
          >
            Current Stock
          </button>
          <button 
            className="homebtn"
            onClick={() => navigate('/store/stock-summary')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1' }}
          >
            Stock Summary
          </button>
          <button 
            className="homebtn"
            onClick={() => navigate('/store/damaged-stock')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1' }}
          >
            Damaged Stock
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Flex wrap="wrap" justify="space-between" px={2} style={{ marginBottom: '24px' }}>
        <ReusableCard title="Low Stock Items" value={mockInventoryData.lowStockItems.toString()} color="red.500" />
        <ReusableCard title="Incoming Transfers" value={mockInventoryData.incomingTransfers.toString()} color="blue.500" />
        <ReusableCard title="Damaged This Week" value={mockInventoryData.damagedThisWeek.toString()} color="yellow.500" />
        <ReusableCard title="Total Stock Value" value={`₹${mockInventoryData.totalStockValue.toLocaleString()}`} color="green.500" />
      </Flex>

      {/* Main Content Grid */}
      <div className={styles.dashboardGrid}>
        <div className={styles.firstRow}>
          {/* Low Stock Products Card */}
          <div className={styles.orderStatusCard}>
            <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
              Low Stock Alerts
            </h4>
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
                  {mockInventoryData.lowStockProducts.map((p, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{p.name}</td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{p.current} {p.unit}</td>
                      <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{p.threshold} {p.unit}</td>
                      <td>
                        <span className="badge bg-warning" style={{ fontFamily: 'Poppins', fontSize: '11px' }}>Low</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Stock Movements */}
          <div className={styles.orderStatusCard}>
            <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
              Recent Stock Movements
            </h4>
            <div>
              {mockInventoryData.recentMovements.map((movement, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  background: idx % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent', 
                  borderRadius: '8px', 
                  marginBottom: '8px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: movement.type === 'Incoming' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: movement.type === 'Incoming' ? '#059669' : '#ef4444'
                    }}>
                      <FaArrowDown style={{ transform: movement.type === 'Incoming' ? 'rotate(180deg)' : 'none' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontFamily: 'Poppins', fontSize: '14px' }}>
                        {movement.product}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Poppins' }}>
                        {movement.type} • {movement.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: 700, 
                    color: movement.type === 'Incoming' ? '#059669' : '#ef4444', 
                    fontFamily: 'Poppins', 
                    fontSize: '16px' 
                  }}>
                    {movement.type === 'Incoming' ? '+' : '-'}{movement.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


