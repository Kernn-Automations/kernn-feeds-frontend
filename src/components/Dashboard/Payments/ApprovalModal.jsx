import React, { useState, useEffect } from "react";
import styles from "./Payments.module.css";
import img from "./../../../images/dummy-img.jpeg"; // Assuming this is a local dummy image
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import ImageZoomModal from "./ImageZoomModal"; // New component for image zoom

function ApprovalModal({ report, changeTrigger }) {
  const { axiosAPI } = useAuth();

  const [error, setError] = useState(null);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [isImageZoomModalOpen, setIsImageZoomModalOpen] = useState(false);
  const [currentZoomImageUrl, setCurrentZoomImageUrl] = useState(null);

  useEffect(() => {
    if (report && report.paymentRequests) {
      const map = report.paymentRequests.reduce((acc, pr) => {
        acc[pr.paymentRequestId] = pr.status;
        return acc;
      }, {});
      setPaymentStatuses(map);
    }
  }, [report]);

  const handleAction = async (paymentRequestId, action) => {
    setError(null);
    setLoadingIds((prev) => new Set(prev).add(paymentRequestId));
    try {
      await axiosAPI.post(`/payment-requests/${paymentRequestId}`, { action });
      setPaymentStatuses((prev) => ({
        ...prev,
        [paymentRequestId]: action === "approve" ? "Approved" : "Rejected",
      }));
      changeTrigger(); // Notify parent to refresh list as needed
    } catch (e) {
      setError(e.response?.data?.message || "Error updating payment status");
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(paymentRequestId);
        return newSet;
      });
    }
  };

  const openImageZoomModal = (imageUrl) => {
    setCurrentZoomImageUrl(imageUrl);
    setIsImageZoomModalOpen(true);
  };

  const closeImageZoomModal = () => {
    setIsImageZoomModalOpen(false);
    setCurrentZoomImageUrl(null);
  };

  if (!report) return null;

  return (
    <>
      <h3 className={`px-3 mdl-title`}>
        Approvals - Sales Order: {report.orderNumber}
      </h3>

      <div className="row m-0 p-0">
        <div className={`col-6 ${styles.longformmdl}`}>
          <label>Customer Name:</label>
          <input type="text" value={report.customer?.name} readOnly />
        </div>
        <div className={`col-6 ${styles.longformmdl}`}>
          <label>Warehouse:</label>
          <input type="text" value={report.warehouse?.name} readOnly />
        </div>
        <div className={`col-6 ${styles.longformmdl}`}>
          <label>Sales Executive:</label>
          <input type="text" value={report.salesExecutive?.name} readOnly />
        </div>
      </div>

      <h4>Payment Requests</h4>
      <div className={styles.paymentsContainer}>
        {report.paymentRequests.map((pr) => (
          <div key={pr.paymentRequestId} className={styles.paymentCard}>
            <div>
              <b>Payment Mode:</b> {pr.paymentMode}
            </div>
            <div>
              <b>Transaction Ref:</b> {pr.transactionReference || "N/A"}
            </div>
            <div>
              <b>Amount:</b> {pr.netAmount}
            </div>
            <div>
              <img
                src={pr.paymentProof || img}
                alt="Payment Proof"
                className={styles.paymentProofThumbnail} // Use a new class for styling
                onClick={() => openImageZoomModal(pr.paymentProof || img)}
              />
            </div>
            <div className={styles.statusRow}>
              <span>Status: {paymentStatuses[pr.paymentRequestId]}</span>
              <div className={styles.actionButtons}>
                <button
                  disabled={
                    loadingIds.has(pr.paymentRequestId) ||
                    paymentStatuses[pr.paymentRequestId] === "Approved"
                  }
                  onClick={() => handleAction(pr.paymentRequestId, "approve")}
                  className={styles.approveBtn}
                  title="Approve"
                >
                  ✔️
                </button>
                <button
                  disabled={
                    loadingIds.has(pr.paymentRequestId) ||
                    paymentStatuses[pr.paymentRequestId] === "Rejected"
                  }
                  onClick={() => handleAction(pr.paymentRequestId, "reject")}
                  className={styles.rejectBtn}
                  title="Reject"
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <ErrorModal
          isOpen={!!error}
          message={error}
          onClose={() => setError(null)}
          // Added a higher z-index if your ErrorModal also uses a portal/fixed position
          // You might need to adjust based on your ErrorModal's internal styling.
          style={{ zIndex: 10001 }}
        />
      )}

      {isImageZoomModalOpen && (
        <ImageZoomModal
          imageUrl={currentZoomImageUrl}
          onClose={closeImageZoomModal}
        />
      )}

      {loadingIds.size > 0 && <Loading />}
    </>
  );
}

export default ApprovalModal;