import React, { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import { FaTag, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function StoreDiscounts() {
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "percentage",
    value: 0,
    minPurchase: 0,
    applicableTo: "all",
    validFrom: "",
    validUntil: "",
    status: "active"
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mockDiscountsData = {
    activeRules: 3,
    totalDiscounts: 12500,
    customersBenefited: 45,
    expiringSoon: 1,
    rules: [
      { 
        id: "DISC001", 
        name: "Seasonal Discount", 
        type: "percentage", 
        value: 5, 
        minPurchase: 1000, 
        applicableTo: "All Products",
        validFrom: "2024-01-01",
        validUntil: "2024-12-31",
        status: "active",
        usage: 120
      },
      { 
        id: "DISC002", 
        name: "Bulk Purchase", 
        type: "percentage", 
        value: 3, 
        minPurchase: 5000, 
        applicableTo: "Selected Products",
        validFrom: "2024-01-15",
        validUntil: "2024-06-30",
        status: "active",
        usage: 85
      },
      { 
        id: "DISC003", 
        name: "New Customer", 
        type: "fixed", 
        value: 100, 
        minPurchase: 500, 
        applicableTo: "All Products",
        validFrom: "2024-02-01",
        validUntil: "2024-03-31",
        status: "expiring",
        usage: 42
      }
    ]
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "active": { class: "bg-success", icon: <FaCheckCircle /> },
      "expiring": { class: "bg-warning", icon: <FaTimesCircle /> },
      "inactive": { class: "bg-secondary", icon: <FaTimesCircle /> }
    };
    return statusMap[status] || { class: "bg-secondary", icon: <FaTimesCircle /> };
  };

  return (
    <div style={{ padding: isMobile ? '12px 8px' : '20px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontFamily: 'Poppins', 
          fontWeight: 700, 
          fontSize: isMobile ? '22px' : '28px', 
          color: 'var(--primary-color)',
          margin: 0,
          marginBottom: '8px'
        }}>Discount Management</h2>
        <p style={{ 
          fontFamily: 'Poppins', 
          fontSize: isMobile ? '12px' : '14px', 
          color: '#666',
          margin: 0
        }}>Create and manage discount rules for your store</p>
      </div>

      {/* Action Buttons */}
      <div className="row m-0 p-2" style={{ marginBottom: '24px' }}>
        <div
          className="col"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            ...(isMobile && {
              flexDirection: 'row',
              gap: '6px',
              paddingLeft: '8px',
              paddingRight: '8px',
              marginLeft: '0',
              width: '100%'
            }),
            ...(!isMobile && {
              gap: '10px'
            })
          }}
        >
          <button 
            className="homebtn"
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1',
              ...(isMobile ? {
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: '6px',
                flex: '0 0 calc(33.333% - 4px)',
                maxWidth: 'calc(33.333% - 4px)',
                width: 'calc(33.333% - 4px)',
                minHeight: '32px',
                boxSizing: 'border-box',
                whiteSpace: 'normal',
                margin: 0
              } : {
                padding: '12px 24px',
                fontSize: '14px',
                borderRadius: '8px',
                whiteSpace: 'nowrap'
              })
            }}
          >
            {showForm ? 'Cancel' : 'Create Discount Rule'}
          </button>
          <button 
            className="homebtn" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1',
              ...(isMobile ? {
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: '6px',
                flex: '0 0 calc(33.333% - 4px)',
                maxWidth: 'calc(33.333% - 4px)',
                width: 'calc(33.333% - 4px)',
                minHeight: '32px',
                boxSizing: 'border-box',
                whiteSpace: 'normal',
                margin: 0
              } : {
                padding: '12px 24px',
                fontSize: '14px',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                height: '36px'
              })
            }}
          >
            View All Rules
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Flex wrap="wrap" justify="space-between" px={2} style={{ marginBottom: '24px' }}>
        <ReusableCard title="Active Rules" value={mockDiscountsData.activeRules.toString()} color="green.500" />
        <ReusableCard title="Total Discounts" value={`₹${mockDiscountsData.totalDiscounts.toLocaleString()}`} color="blue.500" />
        <ReusableCard title="Customers Benefited" value={mockDiscountsData.customersBenefited.toString()} color="purple.500" />
        <ReusableCard title="Expiring Soon" value={mockDiscountsData.expiringSoon.toString()} color="yellow.500" />
      </Flex>

      {/* Create Rule Form */}
      {showForm && (
        <div className={styles.orderStatusCard} style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
            Create Discount Rule
          </h4>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Rule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontFamily: 'Poppins',
                  fontSize: '14px'
                }}
                placeholder="e.g., Seasonal Discount"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                  placeholder={formData.type === "percentage" ? "5" : "100"}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Minimum Purchase (₹)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Applicable To
                </label>
                <select
                  value={formData.applicableTo}
                  onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Products</option>
                  <option value="selected">Selected Products</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Valid From
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                alert("Discount rule created! (This is a mock action)");
                setShowForm(false);
                setFormData({ name: "", type: "percentage", value: 0, minPurchase: 0, applicableTo: "all", validFrom: "", validUntil: "", status: "active" });
              }}
              style={{ 
                fontFamily: 'Poppins',
                padding: '12px 24px',
                borderRadius: '8px',
                marginTop: '8px'
              }}
            >
              Create Discount Rule
            </button>
          </div>
        </div>
      )}

      {/* Discount Rules Table */}
      <div className={styles.orderStatusCard}>
        <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
          Active Discount Rules
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ marginBottom: 0, fontFamily: 'Poppins' }}>
            <thead>
              <tr>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Rule ID</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Name</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Discount</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Min Purchase</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Applicable To</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Usage</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Status</th>
                <th style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockDiscountsData.rules.map((rule, i) => {
                const statusInfo = getStatusBadge(rule.status);
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>{rule.id}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600 }}>{rule.name}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>
                      {rule.type === "percentage" ? `${rule.value}%` : `₹${rule.value}`}
                    </td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>₹{rule.minPurchase.toLocaleString()}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{rule.applicableTo}</td>
                    <td style={{ fontFamily: 'Poppins', fontSize: '13px' }}>{rule.usage} times</td>
                    <td>
                      <span className={`badge ${statusInfo.class}`} style={{ fontFamily: 'Poppins', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {statusInfo.icon}
                        {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '4px 8px' }}
                        >
                          <FaEdit style={{ fontSize: '12px' }} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontFamily: 'Poppins', fontSize: '11px', padding: '4px 8px' }}
                        >
                          <FaTrash style={{ fontSize: '12px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
