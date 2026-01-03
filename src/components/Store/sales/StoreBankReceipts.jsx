import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import { isStoreEmployee } from "../../../utils/roleUtils";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import Loading from "@/components/Loading";
import storeService from "../../../services/storeService";
import styles from "../../Dashboard/HomePage/HomePage.module.css";

export default function StoreBankReceipts() {
  const navigate = useNavigate();
  const { user, axiosAPI } = useAuth();
  const actualUser = user?.user || user || {};
  const inferredStoreId = actualUser?.storeId || actualUser?.store?.id || null;
  const isEmployee = isStoreEmployee(actualUser);

  const [storeId, setStoreId] = useState(inferredStoreId);
  const [bankBalance, setBankBalance] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [depositTime, setDepositTime] = useState("");
  const [notes, setNotes] = useState("");
  const [depositSlip, setDepositSlip] = useState(null);
  const [depositSlipPreview, setDepositSlipPreview] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
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
          // setError("Store information missing. Please re-login to continue.");
          // setIsErrorModalOpen(true);
        }
      } catch (err) {
        console.error("Unable to parse stored user data", err);
        setError("Unable to determine store information. Please re-login.");
        setIsErrorModalOpen(true);
      }
    }
  }, [storeId]);

  // Fetch store bank balance
  // Logic: "bank balance should fetch whoose payments were bank"
  const fetchStoreBankBalance = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await axiosAPI.get(`/stores/${storeId}/bank-balance`);
      const responseData = res.data || res;
      
      if (responseData.success) {
        setBankBalance(responseData.data?.balance || 0);
        if (responseData.data?.storeName) {
            setStoreName(responseData.data.storeName);
        }
      } 
    } catch (err) {
      console.error("Failed to fetch store bank balance", err);
    }
  }, [storeId, axiosAPI]);

  // Fetch bank receipts
  const fetchBankReceipts = useCallback(async () => {
    if (!storeId) return;
    setReceiptsLoading(true);
    try {
      const res = await axiosAPI.get(`/stores/${storeId}/bank-receipts`);
      const receiptsData = res.data?.data || res.data || res;
      // The API might return an array directly or an object with a data property or receipts property
      const receiptsList = Array.isArray(receiptsData) ? receiptsData : (receiptsData.receipts || receiptsData.data || []);
      setReceipts(receiptsList);
    } catch (err) {
      console.error("Failed to fetch bank receipts", err);
      // setReceipts([]);
    } finally {
        setReceiptsLoading(false);
    }
  }, [storeId, axiosAPI]);

  useEffect(() => {
    if (storeId) {
      fetchStoreBankBalance();
      fetchBankReceipts();
    }
  }, [storeId, fetchStoreBankBalance, fetchBankReceipts]);

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
    setSuccessMessage(message || "Bank receipt recorded successfully.");
    setIsSuccessModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!storeId) {
      showError("Store information missing.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showError("Please enter a valid amount.");
      return;
    }
    
    if (!utrNumber) {
        showError("Please enter UTR Number.");
        return;
    }

    const receiptAmount = parseFloat(amount);

    setLoading(true);
    try {
      // Combine date and time into ISO string
      let receiptDateTime = null;
      if (depositDate && depositTime) {
        const dateTimeStr = `${depositDate}T${depositTime}:00`;
        receiptDateTime = new Date(dateTimeStr).toISOString();
      }

      const payload = {
        storeId: storeId,
        amount: receiptAmount,
        utrNumber: utrNumber.trim(),
        notes: notes.trim() || "",
        ...(receiptDateTime && { receiptDate: receiptDateTime }),
      };

      if (depositSlip) {
        payload.depositSlipBase64 = formatBase64DataURL(depositSlip);
      }

      const res = await axiosAPI.post(`/stores/${storeId}/bank-receipts`, payload);
      // const responseData = res.data || res;

      showSuccess(res.message || "Bank receipt recorded successfully.");
      setAmount("");
      setUtrNumber("");
      setDepositDate("");
      setDepositTime("");
      setNotes("");
      setDepositSlip(null);
      setDepositSlipPreview(null);
      setShowCreateForm(false);
      
      // Update data
      await fetchStoreBankBalance();
      await fetchBankReceipts();
    } catch (err) {
      console.error("Failed to record bank receipt", err);
      showError(err.response?.data?.message || err.message || "Failed to record bank receipt");
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
            Bank Receipts
          </h2>
          <p className="path">Record bank receipt</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="homebtn" 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            style={{ fontFamily: "Poppins", background: showCreateForm ? "#f3f4f6" : undefined }}
          >
            {showCreateForm ? "Cancel" : "Create Receipt"}
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
          {/* Store Bank Balance Display */}
          <div className={styles.orderStatusCard} style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: "Poppins", fontWeight: 600, fontSize: "20px", color: "var(--primary-color)" }}>
                  Store Bank Balance
                </h4>
                <p style={{ margin: "8px 0 0", fontFamily: "Poppins", color: "#6b7280" }}>
                  {storeName || "Current Store"} (Estimated from Bank Payments)
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontFamily: "Poppins", fontSize: "24px", fontWeight: 700, color: "#059669" }}>
                  {formatCurrency(bankBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Create Receipt Form */}
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
                Create Bank Receipt
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
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
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
                  </div>
                  <div>
                     <label>UTR Number *</label>
                     <input
                       type="text"
                       value={utrNumber}
                       onChange={(e) => setUtrNumber(e.target.value)}
                       required
                       placeholder="Enter UTR Number"
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
                    <label>Receipt/Slip (Image/PDF)</label>
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
                          alt="Receipt slip preview"
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
                      placeholder="Add any additional notes"
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
                  <button className="homebtn" type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Receipt"}
                  </button>
                  <button
                    className="homebtn"
                    type="button"
                    onClick={() => {
                      setAmount("");
                      setUtrNumber("");
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

          {/* Bank Receipts Table */}
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
              Bank Receipt History
            </h4>
            {receiptsLoading ? (
              <p style={{ fontFamily: "Poppins", textAlign: "center", padding: "20px" }}>Loading receipts...</p>
            ) : receipts.length === 0 ? (
              <p style={{ fontFamily: "Poppins", textAlign: "center", padding: "20px", color: "#6b7280" }}>
                No bank receipts found
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table table-bordered borderedtable table-sm" style={{ fontFamily: "Poppins" }}>
                  <thead className="table-light">
                    <tr>
                      <th>S.No</th>
                      <th>Date</th>
                      <th>Store Name</th>
                      <th>Amount (₹)</th>
                      <th>UTR Number</th>
                      <th>Created By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt, index) => (
                      <tr key={receipt.id || index} style={{ background: index % 2 === 0 ? "rgba(59, 130, 246, 0.03)" : "transparent" }}>
                        <td>{index + 1}</td>
                        <td>{formatDate(receipt.createdAt || receipt.date || receipt.receiptDate)}</td>
                        <td>{receipt.store?.name || receipt.storeName || storeName || "-"}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(receipt.amount)}</td>
                        <td style={{ fontWeight: 600 }}>{receipt.utrNumber || "-"}</td>
                        <td>{receipt.createdByEmployee?.name || receipt.createdBy?.name || receipt.employee?.name || receipt.createdBy || "-"}</td>
                        <td>
                          {receipt.depositSlip || receipt.depositSlipUrl || receipt.image ? (
                            <button
                              className="homebtn"
                              style={{ fontSize: "11px" }}
                              onClick={() => handleViewImage(receipt.depositSlip || receipt.depositSlipUrl || receipt.image)}
                              title="View Receipt Slip"
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

      {/* Image View Modal (Reused) */}
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
                alt="Receipt Slip"
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
