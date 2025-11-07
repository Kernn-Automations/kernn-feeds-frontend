import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Dashboard/Purchases/Purchases.module.css";
import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

export default function ViewAllIndents() {
  const navigate = useNavigate();
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const mockIndentsData = {
    recentIndents: [
      { 
        id: 1,
        code: "IND000123", 
        value: 15000, 
        status: "Awaiting Approval", 
        date: "15-01-2024", 
        items: 5,
        storeName: "Store A",
        priority: "High",
        notes: "Urgent requirement for upcoming sale",
        products: [
          { name: "Product A", quantity: 10, unit: "kg", price: 500 },
          { name: "Product B", quantity: 5, unit: "pcs", price: 200 },
          { name: "Product C", quantity: 20, unit: "kg", price: 300 }
        ]
      },
      { 
        id: 2,
        code: "IND000124", 
        value: 9800, 
        status: "Awaiting Approval", 
        date: "14-01-2024", 
        items: 3,
        storeName: "Store B",
        priority: "Normal",
        notes: "Regular stock replenishment",
        products: [
          { name: "Product D", quantity: 15, unit: "pcs", price: 400 },
          { name: "Product E", quantity: 8, unit: "kg", price: 350 }
        ]
      },
      { 
        id: 3,
        code: "IND000125", 
        value: 21000, 
        status: "Waiting for Stock", 
        date: "13-01-2024", 
        items: 8,
        storeName: "Store C",
        priority: "Urgent",
        notes: "Bulk order for festival season",
        products: [
          { name: "Product F", quantity: 25, unit: "kg", price: 600 },
          { name: "Product G", quantity: 12, unit: "pcs", price: 450 },
          { name: "Product H", quantity: 30, unit: "kg", price: 550 }
        ]
      },
      { 
        id: 4,
        code: "IND000122", 
        value: 18500, 
        status: "Approved", 
        date: "12-01-2024", 
        items: 6,
        storeName: "Store A",
        priority: "Normal",
        notes: "Approved and ready for processing",
        products: [
          { name: "Product I", quantity: 18, unit: "pcs", price: 500 },
          { name: "Product J", quantity: 10, unit: "kg", price: 400 }
        ]
      },
      { 
        id: 5,
        code: "IND000121", 
        value: 12200, 
        status: "Rejected", 
        date: "11-01-2024", 
        items: 4,
        storeName: "Store B",
        priority: "Low",
        notes: "Rejected due to insufficient stock",
        products: [
          { name: "Product K", quantity: 8, unit: "kg", price: 600 }
        ]
      },
      { 
        id: 6,
        code: "IND000120", 
        value: 15200, 
        status: "Approved", 
        date: "10-01-2024", 
        items: 7,
        storeName: "Store C",
        priority: "High",
        notes: "",
        products: [
          { name: "Product L", quantity: 12, unit: "pcs", price: 450 },
          { name: "Product M", quantity: 15, unit: "kg", price: 500 }
        ]
      },
      { 
        id: 7,
        code: "IND000119", 
        value: 9800, 
        status: "Approved", 
        date: "09-01-2024", 
        items: 3,
        storeName: "Store A",
        priority: "Normal",
        notes: "",
        products: [
          { name: "Product N", quantity: 10, unit: "kg", price: 400 }
        ]
      },
      { 
        id: 8,
        code: "IND000118", 
        value: 21000, 
        status: "Waiting for Stock", 
        date: "08-01-2024", 
        items: 8,
        storeName: "Store B",
        priority: "Urgent",
        notes: "Waiting for warehouse stock",
        products: [
          { name: "Product O", quantity: 20, unit: "pcs", price: 600 },
          { name: "Product P", quantity: 15, unit: "kg", price: 500 }
        ]
      },
      { 
        id: 9,
        code: "IND000117", 
        value: 18500, 
        status: "Approved", 
        date: "07-01-2024", 
        items: 6,
        storeName: "Store C",
        priority: "Normal",
        notes: "",
        products: [
          { name: "Product Q", quantity: 12, unit: "kg", price: 550 },
          { name: "Product R", quantity: 8, unit: "pcs", price: 450 }
        ]
      },
      { 
        id: 10,
        code: "IND000116", 
        value: 12200, 
        status: "Rejected", 
        date: "06-01-2024", 
        items: 4,
        storeName: "Store A",
        priority: "Low",
        notes: "Rejected - invalid request",
        products: [
          { name: "Product S", quantity: 10, unit: "kg", price: 600 }
        ]
      }
    ]
  };

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(mockIndentsData.recentIndents.length / limit));
    setPageNo(1); // Reset page number when limit changes
  }, [limit]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pageNo - 1) * limit;
    const endIndex = startIndex + limit;
    return mockIndentsData.recentIndents.slice(startIndex, endIndex);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "Awaiting Approval": { class: "bg-warning", icon: <FaClock /> },
      "Waiting for Stock": { class: "bg-info", icon: <FaClock /> },
      "Approved": { class: "bg-success", icon: <FaCheckCircle /> },
      "Rejected": { class: "bg-danger", icon: <FaTimesCircle /> }
    };
    return statusMap[status] || { class: "bg-secondary", icon: <FaFileAlt /> };
  };

  const handleViewClick = (indent) => {
    setSelectedIndent(indent);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIndent(null);
  };

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    if (selectedIndent) {
      // For now, just close and show alert
      alert(`Edit functionality for ${selectedIndent.code} will be implemented`);
      handleCloseModal();
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/store/indents")}>Indents</span>{" "}
        <i className="bi bi-chevron-right"></i> View Indents
      </p>

      <div className="row m-0 p-3">
        <div className="col-12">
          <div className="row m-0 mb-3 justify-content-end">
            <div className={`${styles.entity}`} style={{ marginRight: 0 }}>
              <label htmlFor="">Entity :</label>
              <select
                name=""
                id=""
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <table className={`table table-bordered borderedtable`}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Indent Code</th>
                <th>Items</th>
                <th>Value</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData().length === 0 ? (
                <tr>
                  <td colSpan={7}>NO DATA FOUND</td>
                </tr>
              ) : (
                getPaginatedData().map((indent, index) => {
                  const statusInfo = getStatusBadge(indent.status);
                  const actualIndex = (pageNo - 1) * limit + index + 1;
                  return (
                    <tr
                      key={index}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{actualIndex}</td>
                      <td>{indent.date}</td>
                      <td>{indent.code}</td>
                      <td>{indent.items} items</td>
                      <td>₹{indent.value.toLocaleString()}</td>
                      <td>
                        <span 
                          className={`badge ${statusInfo.class}`}
                          style={{ 
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {statusInfo.icon}
                          {indent.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewClick(indent)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="row m-0 p-0 pt-3 justify-content-between">
            <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
              {pageNo > 1 && (
                <button onClick={() => setPageNo(pageNo - 1)}>
                  <span>
                    <FaArrowLeftLong />
                  </span>{" "}
                  Previous
                </button>
              )}
            </div>
            <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
              {pageNo < totalPages && (
                <button onClick={() => setPageNo(pageNo + 1)}>
                  Next{" "}
                  <span>
                    <FaArrowRightLong />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indent Details Modal */}
      {showModal && selectedIndent && (
        <div
          className="modal fade show"
          style={{ 
            display: 'block', 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 150000
          }}
          tabIndex="-1"
          role="dialog"
          onClick={handleCloseModal}
          onKeyDown={(e) => { if (e.key === 'Escape') handleCloseModal(); }}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered" 
            role="document" 
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 150001 }}
          >
            <div className="modal-content" style={{ 
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
              zIndex: 150002
            }}>
              <div className="modal-header" style={{ 
                borderBottom: '1px solid #dee2e6',
                backgroundColor: '#f8f9fa',
                borderRadius: '0.5rem 0.5rem 0 0',
                padding: '1rem 1.5rem'
              }}>
                <h5 className="modal-title" style={{ margin: 0, fontWeight: '600', fontFamily: 'Poppins' }}>
                  Indent Details - {selectedIndent.code}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  aria-label="Close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                {/* Indent Information */}
                <div style={{ marginBottom: '2rem' }}>
                  <h6 style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-color)' }}>
                    Indent Information
                  </h6>
                  <div className="row" style={{ fontFamily: 'Poppins' }}>
                    <div className="col-6" style={{ marginBottom: '0.75rem' }}>
                      <strong>Indent Code:</strong> {selectedIndent.code}
                    </div>
                    <div className="col-6" style={{ marginBottom: '0.75rem' }}>
                      <strong>Date:</strong> {selectedIndent.date}
                    </div>
                    <div className="col-6" style={{ marginBottom: '0.75rem' }}>
                      <strong>Store:</strong> {selectedIndent.storeName || 'N/A'}
                    </div>
                    <div className="col-6" style={{ marginBottom: '0.75rem' }}>
                      <strong>Priority:</strong> 
                      <span className={`badge ${selectedIndent.priority === 'Urgent' ? 'bg-danger' : selectedIndent.priority === 'High' ? 'bg-warning' : 'bg-info'}`} style={{ marginLeft: '8px' }}>
                        {selectedIndent.priority}
                      </span>
                    </div>
                    <div className="col-6" style={{ marginBottom: '0.75rem' }}>
                      <strong>Status:</strong> 
                      <span className={`badge ${getStatusBadge(selectedIndent.status).class}`} style={{ marginLeft: '8px' }}>
                        {getStatusBadge(selectedIndent.status).icon}
                        {selectedIndent.status}
                      </span>
                    </div>
                    <div className="col-6" style={{ marginBottom: '0.75rem' }}>
                      <strong>Total Value:</strong> ₹{selectedIndent.value.toLocaleString()}
                    </div>
                    {selectedIndent.notes && (
                      <div className="col-12" style={{ marginTop: '0.5rem' }}>
                        <strong>Notes:</strong>
                        <p style={{ marginTop: '0.25rem', color: '#6b7280' }}>{selectedIndent.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h6 style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-color)' }}>
                    Items ({selectedIndent.products?.length || selectedIndent.items || 0})
                  </h6>
                  <div style={{ overflowX: 'auto' }}>
                    <table className={`table table-bordered borderedtable`} style={{ fontFamily: 'Poppins' }}>
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedIndent.products && selectedIndent.products.length > 0 ? (
                          selectedIndent.products.map((product, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{product.name}</td>
                              <td>{product.quantity}</td>
                              <td>{product.unit}</td>
                              <td>₹{product.price.toLocaleString()}</td>
                              <td>₹{(product.quantity * product.price).toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>No items found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ 
                borderTop: '1px solid #dee2e6',
                padding: '1rem 1.5rem',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  style={{ fontFamily: 'Poppins' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEdit}
                  style={{ fontFamily: 'Poppins' }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

