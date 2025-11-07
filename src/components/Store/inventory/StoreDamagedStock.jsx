import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";
import { FaExclamationTriangle } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";

function StoreDamagedStock() {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [damagedReports, setDamagedReports] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    quantity: 0,
    damageReason: "",
    description: ""
  });

  const [products, setProducts] = useState([
    { id: "dummy1", name: "Product A", code: "PROD001" },
    { id: "dummy2", name: "Product B", code: "PROD002" }
  ]);

  useEffect(() => {
    fetchProducts();
    fetchDamagedReports();
  }, []);

  const fetchProducts = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const storeId = user.storeId || user.store?.id;

      // Dummy products
      const dummyProducts = [
        { id: "dummy1", name: "Product A", code: "PROD001" },
        { id: "dummy2", name: "Product B", code: "PROD002" }
      ];

      if (!storeId) {
        setError("Store ID not found.");
        setProducts(dummyProducts); // Set dummy products even if storeId is missing
        return;
      }

      const res = await axiosAPI.get(`/stores/${storeId}/inventory`);
      if (res.data && res.data.inventory) {
        const productsList = res.data.inventory.map(item => ({
          id: item.product?.id || item.productId,
          name: item.product?.name || item.name,
          code: item.product?.SKU || item.SKU || item.productCode
        }));
        // Combine dummy products with fetched products
        setProducts([...dummyProducts, ...productsList]);
      } else {
        // If no products from API, use dummy products
        setProducts(dummyProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // On error, still show dummy products
      setProducts([
        { id: "dummy1", name: "Product A", code: "PROD001" },
        { id: "dummy2", name: "Product B", code: "PROD002" }
      ]);
    }
  };

  const fetchDamagedReports = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const storeId = user.storeId || user.store?.id;

      if (!storeId) {
        setLoading(false);
        return;
      }

      const res = await axiosAPI.get(`/stores/${storeId}/damaged-goods`);
      if (res.data && res.data.damagedGoods) {
        setDamagedReports(res.data.damagedGoods);
      }
    } catch (err) {
      console.error('Error fetching damaged reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      productId: productId,
      productName: product ? product.name : ""
    });
  };

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Image file:', imageFile);

    // Validation
    if (!formData.productId || formData.productId === '') {
      setError('Please select a product');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    if (!formData.damageReason || formData.damageReason.trim() === '') {
      setError('Please select a damage reason');
      return;
    }
    if (!formData.description || formData.description.trim() === '') {
      setError('Please enter a reason');
      return;
    }
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const user = userData.user || userData;
      const storeId = user.storeId || user.store?.id;

      if (!storeId) {
        setError("Store ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('storeId', storeId);
      formDataToSend.append('productId', formData.productId);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('damageReason', formData.damageReason);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('imageFile', imageFile); // Field name MUST be 'imageFile'

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log('Field:', key, 'Value:', value);
      }

      // Use formData method from axiosAPI
      const response = await axiosAPI.formData(
        `/stores/${storeId}/damaged-goods`,
        formDataToSend
      );

      console.log('Success:', response.data);
      
      // Reset form and refresh reports
      setFormData({
        productId: "",
        productName: "",
        quantity: 0,
        damageReason: "",
        description: ""
      });
      setImageFile(null);
      setShowForm(false);
      fetchDamagedReports();
      
      alert("Damaged goods reported successfully!");
    } catch (err) {
      console.error('Error:', err.response?.data);
      setError(err?.response?.data?.message || err?.message || "Failed to report damaged goods");
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const closeViewModal = () => {
    setShowDetailsModal(false);
    setSelectedReport(null);
  };

  const closeErrorModal = () => {
    setError(null);
  };

  const mockStats = {
    thisWeek: damagedReports.filter(r => {
      const reportDate = new Date(r.reportedAt || r.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reportDate >= weekAgo;
    }).length,
    thisMonth: damagedReports.filter(r => {
      const reportDate = new Date(r.reportedAt || r.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return reportDate >= monthAgo;
    }).length,
    totalValue: damagedReports.reduce((sum, r) => sum + (r.estimatedValue || 0), 0),
    pendingReports: damagedReports.filter(r => r.status === 'pending').length
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
        }}>Damaged Stock</h2>
        {/* Breadcrumb Navigation */}
        <p className="path">
          <span onClick={() => navigate("/store/inventory")}>Inventory</span>{" "}
          <i class="bi bi-chevron-right"></i> Damaged Stock
        </p>
      </div>

      {/* Action Buttons */}
      <div className="row m-0 p-2" style={{ marginBottom: '24px' }}>
        <div className="col" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="homebtn"
            onClick={() => setShowForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1' }}
          >
            Report Damaged Stock
          </button>
        </div>
      </div>

      {/* Report Form Modal */}
      <style>{`
        .store-damaged-modal .modal-content {
          background-color: var(--primary-light) !important;
          border: none !important;
          border-radius: 8px !important;
        }
        .store-damaged-modal .modal-header {
          background-color: var(--primary-light) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
          border-top-left-radius: 8px !important;
          border-top-right-radius: 8px !important;
        }
        .store-damaged-modal .modal-body {
          background-color: var(--primary-light) !important;
          border-bottom-left-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }
        .store-damaged-modal .inputcolumn-mdl {
          width: 460px !important;
          display: flex !important;
          align-items: center !important;
          margin-bottom: 10px !important;
        }
        .store-damaged-modal .inputcolumn-mdl label {
          width: 180px !important;
          text-align: right !important;
          padding-right: 20px !important;
          margin-bottom: 0 !important;
          flex-shrink: 0 !important;
        }
        .store-damaged-modal .inputcolumn-mdl input,
        .store-damaged-modal .inputcolumn-mdl select {
          width: 240px !important;
          flex: 0 0 240px !important;
          height: 24px !important;
        }
        .store-damaged-modal .inputcolumn-mdl textarea {
          width: 240px !important;
          flex: 0 0 240px !important;
          height: 80px !important;
          margin-left: 0 !important;
        }
        .store-damaged-modal .inputcolumn-mdl input[type="file"] {
          width: 240px !important;
          flex: 0 0 240px !important;
        }
      `}</style>
      <Modal 
        show={showForm} 
        onHide={() => {
          setShowForm(false);
          setError(null);
          // Reset form on close
          setFormData({
            productId: "",
            productName: "",
            quantity: 0,
            damageReason: "",
            description: ""
          });
          setImageFile(null);
        }} 
        size="md" 
        centered
        dialogClassName="store-damaged-modal"
        contentClassName="mdl"
      >
        <Modal.Header closeButton style={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: 'var(--primary-light)',
          padding: '20px'
        }}>
          <Modal.Title className="mdl-title" style={{ 
            fontFamily: 'Poppins',
            color: 'black',
            fontSize: '24px',
            fontWeight: 500,
            paddingTop: '10px',
            marginBottom: '20px'
          }}>
            Report Damaged Stock
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ 
          padding: '20px',
          backgroundColor: 'var(--primary-light)'
        }}>
          {error && (
            <div style={{ 
              padding: '10px', 
              marginBottom: '15px', 
              backgroundColor: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: '4px',
              color: '#c33'
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} id="damaged-stock-form">
            <div className="row justify-content-center">
              <div className="col-6 inputcolumn-mdl">
                <label>Product: <span style={{color: 'red'}}>*</span></label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-6 inputcolumn-mdl">
                <label>Quantity: <span style={{color: 'red'}}>*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-6 inputcolumn-mdl">
                <label>Damage Reason: <span style={{color: 'red'}}>*</span></label>
                <select
                  value={formData.damageReason}
                  onChange={(e) => setFormData({ ...formData, damageReason: e.target.value })}
                  required
                >
                  <option value="">Select reason</option>
                  <option value="Expired">Expired</option>
                  <option value="Damaged Package">Damaged Package</option>
                  <option value="Spillage">Spillage</option>
                  <option value="Contamination">Contamination</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-6 inputcolumn-mdl">
                <label>Reason: <span style={{color: 'red'}}>*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the reason for damage..."
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* Image File Input */}
            <div className="row justify-content-center">
              <div className="col-6 inputcolumn-mdl">
                <label>Image File (Required): <span style={{color: 'red'}}>*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  style={{ display: 'block', marginTop: '5px' }}
                />
                {imageFile && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    ✅ Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="row justify-content-center p-3">
              <div className="col-5" style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
                <button 
                  type="submit" 
                  className="submitbtn" 
                  disabled={loading}
                  onClick={(e) => {
                    console.log('Submit button clicked');
                    // Let the form's onSubmit handle it, but ensure it works
                    const form = document.getElementById('damaged-stock-form');
                    if (form && !form.checkValidity()) {
                      form.reportValidity();
                      e.preventDefault();
                      return false;
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
                <button 
                  type="button" 
                  className="cancelbtn"
                  disabled={loading}
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                    // Reset form on cancel
                    setFormData({
                      productId: "",
                      productName: "",
                      quantity: 0,
                      damageReason: "",
                      description: ""
                    });
                    setImageFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Recent Reports Table */}
      <div className={styles.orderStatusCard}>
        <h4 style={{ margin: 0, marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
          Damage Reports
        </h4>
        <div className="table-responsive">
          <table className="table table-bordered borderedtable" style={{ fontFamily: 'Poppins' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Report ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {damagedReports.length > 0 ? (
                damagedReports.map((report, i) => (
                  <tr key={i}>
                    <td>{report.reportedAt || report.createdAt 
                      ? new Date(report.reportedAt || report.createdAt).toLocaleDateString()
                      : 'N/A'}</td>
                    <td>{report.id || `DMG${i + 1}`}</td>
                    <td>{report.productName || 'N/A'}</td>
                    <td>{report.quantity} {report.unit}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openViewModal(report)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No Damaged Goods Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Damage Report Details</h5>
                <button type="button" className="btn-close" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-2">
                  <div className="col-4 text-muted">Product</div>
                  <div className="col-8">{selectedReport.productName || 'N/A'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Reason</div>
                  <div className="col-8">{selectedReport.damageReason || selectedReport.reason || 'N/A'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Value</div>
                  <div className="col-8">₹{selectedReport.estimatedValue?.toLocaleString() || '0'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Images</div>
                  <div className="col-8">
                    {(() => {
                      const images = Array.isArray(selectedReport.images)
                        ? selectedReport.images
                        : (selectedReport.image ? [selectedReport.image] : (selectedReport.imageUrl ? [selectedReport.imageUrl] : []));
                      return images.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {images.map((src, idx) => (
                            <img key={idx} src={src} alt={`damage-${idx}`} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No image</span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeViewModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {error && <ErrorModal message={error} onClose={closeErrorModal} />}
    </div>
  );
}

export default StoreDamagedStock;

