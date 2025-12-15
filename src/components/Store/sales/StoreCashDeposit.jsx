import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import { isStoreEmployee } from "../../../utils/roleUtils";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import Loading from "@/components/Loading";
import storeService from "../../../services/storeService";
import styles from "../../Dashboard/HomePage/HomePage.module.css";

export default function StoreCashDeposit() {
  const navigate = useNavigate();
  const { user, axiosAPI } = useAuth();
  const actualUser = user?.user || user || {};
  const inferredStoreId = actualUser?.storeId || actualUser?.store?.id || null;
  const isEmployee = isStoreEmployee(actualUser);

  const [storeId, setStoreId] = useState(inferredStoreId);
  const [storeCash, setStoreCash] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [amount, setAmount] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [depositTime, setDepositTime] = useState("");
  const [notes, setNotes] = useState("");
  const [depositSlip, setDepositSlip] = useState(null);
  const [depositSlipPreview, setDepositSlipPreview] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (!storeId) {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const user = userData.user || userData;
        let id = user?.storeId || user?.store?.id;
        
        if (!id) {
          const selectedStore = localStorage.getItem("selectedStore");
          if (selectedStore) {
            const store = JSON.parse(selectedStore);
            id = store.id;
          }
        }
        
        if (!id) {
          const currentStoreId = localStorage.getItem("currentStoreId");
          id = currentStoreId ? parseInt(currentStoreId) : null;
        }
        
        if (id) {
          setStoreId(id);
        } else {
          setError("Store information missing. Please re-login to continue.");
          setIsErrorModalOpen(true);
        }
      } catch (err) {
        console.error("Unable to parse stored user data", err);
        setError("Unable to determine store information. Please re-login.");
        setIsErrorModalOpen(true);
      }
    }
  }, [storeId]);

  // Fetch store cash balance
  const fetchStoreCash = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await axiosAPI.get(`/stores/${storeId}/cash-balance`);
      const responseData = res.data || res;
      
      // Handle response structure: { success: true, data: { availableBalance, storeName, ... } }
      if (responseData.success && responseData.data) {
        const balanceData = responseData.data;
        setStoreCash(parseFloat(balanceData.availableBalance || 0));
        setStoreName(balanceData.storeName || "");
      } else {
        // Fallback for different response structure
        const balanceData = responseData.data || responseData;
        setStoreCash(parseFloat(balanceData.availableBalance || balanceData.balance || balanceData.cashBalance || balanceData.cash || 0));
        setStoreName(balanceData.storeName || balanceData.name || "");
      }
    } catch (err) {
      console.error("Failed to fetch store cash balance", err);
      // Don't show error modal here as it might be too intrusive
      // Just log the error
    }
  }, [storeId, axiosAPI]);

  // Fetch cash deposits
  const fetchCashDeposits = useCallback(async () => {
    if (!storeId) return;
    setDepositsLoading(true);
    try {
      const res = await axiosAPI.get(`/stores/${storeId}/cash-deposits`);
      const depositsData = res.data?.data || res.data || res;
      const depositsList = Array.isArray(depositsData) ? depositsData : (depositsData.deposits || depositsData.data || []);
      setDeposits(depositsList);
    } catch (err) {
      console.error("Failed to fetch cash deposits", err);
      setDeposits([]);
    } finally {
      setDepositsLoading(false);
    }
  }, [storeId, axiosAPI]);

  useEffect(() => {
    if (storeId) {
      fetchStoreCash();
      fetchCashDeposits();
    }
  }, [storeId, fetchStoreCash, fetchCashDeposits]);

  // Set default date and time when form is opened
  useEffect(() => {
    if (showCreateForm) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      setDepositDate(dateStr);
      setDepositTime(timeStr);
    }
  }, [showCreateForm]);

  // Compress image function
  const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, file.type || 'image/jpeg', quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Format base64 data URL
  const formatBase64DataURL = (base64String) => {
    if (!base64String) return undefined;
    
    if (base64String.startsWith('data:')) {
      const base64Part = base64String.includes(',') ? base64String.split(',')[1] : base64String;
      const base64SizeMB = (base64Part.length * 3) / 4 / 1024 / 1024;
      
      if (base64SizeMB > 1.5) {
        return undefined;
      }
      
      return base64String;
    }
    
    const mimeType = 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleDepositSlipChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = file.type === 'application/pdf' ? 3 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showError(`File size should be less than ${maxSize / 1024 / 1024}MB`);
      e.target.value = '';
      return;
    }

    try {
      let processedFile = file;
      let previewUrl = null;

      if (file.type.startsWith('image/')) {
        const compressedBlob = await compressImage(file, 800, 600, 0.7);
        processedFile = new File([compressedBlob], file.name, { type: file.type });
        previewUrl = URL.createObjectURL(compressedBlob);
        
        if (compressedBlob.size > 1.5 * 1024 * 1024) {
          showError("Image is still too large after compression. Please use a smaller image.");
          e.target.value = '';
          return;
        }
      } else if (file.type === 'application/pdf') {
        if (file.size > 2 * 1024 * 1024) {
          showError("PDF size should be less than 2MB. Please compress the PDF or use a smaller file.");
          e.target.value = '';
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setDepositSlip(base64String);
        setDepositSlipPreview(previewUrl);
      };
      reader.onerror = () => {
        showError("Error reading file");
        e.target.value = '';
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error("Error processing file:", error);
      showError("Error processing file: " + error.message);
      e.target.value = '';
    }
  };

  const showError = (message) => {
    setError(message || "Something went wrong. Please try again.");
    setIsErrorModalOpen(true);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message || "Cash deposit recorded successfully.");
    setIsSuccessModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!storeId) {
      showError("Store information missing.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid cash amount.");
      return;
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount > storeCash) {
      showError(`Insufficient cash in store. Available: ₹${storeCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      return;
    }

    setLoading(true);
    try {
      // Combine date and time into ISO string
      let depositDateTime = null;
      if (depositDate && depositTime) {
        const dateTimeStr = `${depositDate}T${depositTime}:00`;
        depositDateTime = new Date(dateTimeStr).toISOString();
      }

      const payload = {
        storeId: storeId,
        amount: depositAmount,
        notes: notes.trim() || "",
        ...(depositDateTime && { depositDate: depositDateTime }),
      };

      if (depositSlip) {
        payload.depositSlipBase64 = formatBase64DataURL(depositSlip);
      }

      const res = await axiosAPI.post(`/stores/${storeId}/cash-deposits`, payload);
      const responseData = res.data || res;

      showSuccess(res.message || "Cash deposit recorded successfully.");
      setAmount("");
      setDepositDate("");
      setDepositTime("");
      setNotes("");
      setDepositSlip(null);
      setDepositSlipPreview(null);
      setShowCreateForm(false);
      await fetchStoreCash();
      await fetchCashDeposits();
    } catch (err) {
      console.error("Failed to record cash deposit", err);
      showError(err.response?.data?.message || err.message || "Failed to record cash deposit");
    } finally {
      setLoading(false);
    }
  };

  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setShowImageModal(true);
    }
  };

  const closeErrorModal = () => setIsErrorModalOpen(false);
  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const remainingCash = storeCash - (parseFloat(amount) || 0);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2
            style={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "28px",
              color: "var(--primary-color)",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            Cash Deposit
          </h2>
          <p className="path">Record cash deposit</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="homebtn" 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            style={{ fontFamily: "Poppins", background: showCreateForm ? "#f3f4f6" : undefined }}
          >
            {showCreateForm ? "Cancel" : "Create Deposit"}
          </button>
          <button className="homebtn" onClick={() => navigate("/store/sales")} style={{ fontFamily: "Poppins" }}>
            Back to Sales
          </button>
        </div>
      </div>

      {!storeId && (
        <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, fontFamily: "Poppins" }}>Store details are missing. Please re-login to continue.</p>
        </div>
      )}

      {storeId && (
        <>
          {/* Store Cash Balance Display */}
          <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: "Poppins", fontWeight: 600, fontSize: "20px", color: "var(--primary-color)" }}>
                  Store Cash Balance
                </h4>
                <p style={{ margin: "8px 0 0", fontFamily: "Poppins", color: "#6b7280" }}>
                  {storeName || "Current Store"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontFamily: "Poppins", fontSize: "24px", fontWeight: 700, color: "#059669" }}>
                  {formatCurrency(storeCash)}
                </p>
                {showCreateForm && amount && parseFloat(amount) > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <p style={{ margin: "4px 0", fontFamily: "Poppins", fontSize: "14px", color: "#6b7280" }}>
                      Deposit Amount: {formatCurrency(amount)}
                    </p>
                    <p style={{ margin: "4px 0", fontFamily: "Poppins", fontSize: "16px", fontWeight: 600, color: remainingCash >= 0 ? "#059669" : "#dc2626" }}>
                      Remaining: {formatCurrency(remainingCash)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Create Deposit Form */}
          {showCreateForm && (
            <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  margin: 0,
                  marginBottom: "20px",
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "var(--primary-color)",
                }}
              >
                Create Cash Deposit
              </h4>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label>Cash Amount (₹) *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={storeCash}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      placeholder="Enter amount"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #000",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "Poppins",
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    />
                    {amount && parseFloat(amount) > storeCash && (
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#dc2626", fontFamily: "Poppins" }}>
                        Amount exceeds available cash
                      </p>
                    )}
                  </div>
                  <div>
                    <label>Date *</label>
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #000",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "Poppins",
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    />
                  </div>
                  <div>
                    <label>Time *</label>
                    <input
                      type="time"
                      value={depositTime}
                      onChange={(e) => setDepositTime(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #000",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "Poppins",
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label>Deposit Slip (Image/PDF)</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDepositSlipChange}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #000",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "Poppins",
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    />
                    {depositSlipPreview && (
                      <div style={{ marginTop: "8px" }}>
                        <img
                          src={depositSlipPreview}
                          alt="Deposit slip preview"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "150px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label>Notes (Optional)</label>
                    <textarea
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes about this deposit"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #000",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "Poppins",
                        backgroundColor: "#fff",
                        color: "#000",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button className="homebtn" type="submit" disabled={loading || (amount && parseFloat(amount) > storeCash)}>
                    {loading ? "Submitting..." : "Submit Deposit"}
                  </button>
                  <button
                    className="homebtn"
                    type="button"
                    onClick={() => {
                      setAmount("");
                      const now = new Date();
                      const dateStr = now.toISOString().split('T')[0];
                      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
                      setDepositDate(dateStr);
                      setDepositTime(timeStr);
                      setNotes("");
                      setDepositSlip(null);
                      setDepositSlipPreview(null);
                    }}
                    disabled={loading}
                    style={{ background: "#f3f4f6", color: "#374151" }}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cash Deposits Table */}
          <div className={styles.orderStatusCard}>
            <h4
              style={{
                margin: 0,
                marginBottom: "20px",
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "20px",
                color: "var(--primary-color)",
              }}
            >
              Cash Deposit History
            </h4>
            {depositsLoading ? (
              <p style={{ fontFamily: "Poppins", textAlign: "center", padding: "20px" }}>Loading deposits...</p>
            ) : deposits.length === 0 ? (
              <p style={{ fontFamily: "Poppins", textAlign: "center", padding: "20px", color: "#6b7280" }}>
                No cash deposits found
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table table-bordered borderedtable table-sm" style={{ fontFamily: "Poppins" }}>
                  <thead className="table-light">
                    <tr>
                      <th>S.No</th>
                      <th>Date</th>
                      <th>Store Name</th>
                      <th>Cash Deposited (₹)</th>
                      <th>Deposited By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((deposit, index) => (
                      <tr key={deposit.id || index} style={{ background: index % 2 === 0 ? "rgba(59, 130, 246, 0.03)" : "transparent" }}>
                        <td>{index + 1}</td>
                        <td>{formatDate(deposit.createdAt || deposit.date || deposit.depositDate)}</td>
                        <td>{deposit.store?.name || deposit.storeName || storeName || "-"}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(deposit.amount)}</td>
                        <td>{deposit.depositedByEmployee?.name || deposit.createdByEmployee?.name || deposit.createdBy?.name || deposit.employee?.name || deposit.depositedBy || "-"}</td>
                        <td>
                          {deposit.depositSlip || deposit.depositSlipUrl || deposit.image ? (
                            <button
                              className="homebtn"
                              style={{ fontSize: "11px" }}
                              onClick={() => handleViewImage(deposit.depositSlip || deposit.depositSlipUrl || deposit.image)}
                              title="View Deposit Slip"
                            >
                              <i className="bi bi-eye"></i> View
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Image View Modal */}
      {showImageModal && selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
            padding: 0,
          }}
          onClick={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              background: "#000",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "20px",
                zIndex: 10001,
                background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent)",
              }}
            >
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "28px",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                }}
                title="Close"
              >
                ×
              </button>
            </div>
            <div
              style={{
                width: "100%",
                height: "100%",
                padding: 0,
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={selectedImage}
                alt="Deposit Slip"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.src = '';
                  e.target.alt = 'Failed to load image';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {loading && <Loading />}
      <ErrorModal isOpen={isErrorModalOpen} message={error} onClose={closeErrorModal} />
      <SuccessModal isOpen={isSuccessModalOpen} message={successMessage} onClose={closeSuccessModal} />
    </div>
  );
}
