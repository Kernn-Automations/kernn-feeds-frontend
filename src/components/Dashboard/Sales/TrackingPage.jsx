import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import React, { useEffect, useState } from "react";
import styles from "./Sales.module.css"; // Import CSS module
import DropOffs from "./DropOffs";
import ProductsList from "./ProductsList";
import PaymentInfo from "./PaymentInfo";
import axios from "axios";
import SignUploadModal from "./SignUploadModal";
import VerifyOTP from "./VerifyOTP";
import DispatchForm from "./DispatchForm";

const TrackingPage = ({ orderId, setOrderId, navigate }) => {
  const [order, setOrder] = useState();
  const { axiosAPI } = useAuth();

  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get(`/sales-orders/order/${orderId}`);
        setOrder(res.data);
        console.log(res);
      } catch (e) {
        setError(e.response?.data?.message || "Something went wrong");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const handleDownload = async () => {
    if (!orderId) return;

    try {
      setDownloadLoading(true);

      const token = localStorage.getItem("access_token");
      const VITE_API = import.meta.env.VITE_API_URL;

      const response = await axios.get(
        `${VITE_API}/sales-orders/${orderId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SalesOrder_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // cleanup
    } catch (err) {
      console.error(err);
      setError("Failed to download PDF.");
      setIsModalOpen(true);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDispatch = async () => {
    try {
      setActionLoading(true);

      // ✅ Step 1: Check eligibility
      const eligibility = await axiosAPI.get(
        `/sales-orders/${orderId}/dispatch/eligibility`
      );
      if (!eligibility.data.eligible) {
        setError(eligibility.data.reason || "Not eligible for dispatch");
        setIsModalOpen(true);
        return;
      }

      // ✅ Step 2: Collect truck & driver info (simplified prompt for now)
      const truckNumber = prompt("Enter Truck Number:");
      const driverName = prompt("Enter Driver Name:");
      const driverMobile = prompt("Enter Driver Mobile:");

      if (!truckNumber || !driverName || !driverMobile) {
        setError("All driver/truck details are required.");
        setIsModalOpen(true);
        return;
      }

      // ✅ Step 3: Call dispatch API
      const res = await axiosAPI.put(`/sales-orders/${orderId}/dispatch`, {
        truckNumber,
        driverName,
        driverMobile,
      });

      // ✅ Step 4: Refresh page state
      setOrder({ ...order, orderStatus: res.data.orderStatus });
    } catch (err) {
      setError(err.response?.data?.message || "Dispatch failed");
      setIsModalOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setActionLoading(true);

      const res = await axiosAPI.post(`/sales-orders/${orderId}/deliver/otp`, {
        salesOrderId: orderId,
      });
      console.log(res);
      openDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
      setIsModalOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const findTracking = (status, paymentStatus) => {
    
    if (paymentStatus === "pending") return 2;
    else if (paymentStatus === "awaitingPaymentConfirmation" && status === "pending") return 3;
    else if (status === "Confirmed") return 4;
    else if (status === "Dispatched") return 5;
    else if (status === "Delivered") return 6;
    else return 1;
  };

  function formatToIST(dateString) {
    const date = new Date(dateString);

    const options = {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formatted = date.toLocaleString("en-IN", options);
    return `${formatted} IST`;
  }

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/sales")}>Sales</span>{" "}
        <i class="bi bi-chevron-right"></i> Tracking-Details
      </p>

      {order && (
        <div className={styles.trackingContainer}>
          <h2 className={styles.trackingTitle}>Sales Order Details</h2>

          <div className={styles.flexx}>
            <div className={styles.infoCard}>
              <div>
                <img
                  src={order.customer.photo}
                  alt="Customer"
                  className={styles.customerPhoto}
                />
              </div>
              <div>
                <h6>{order.customer.name}</h6>
                <p>ID : {order.customer?.customer_id}</p>
                <p>Mobile : {order.customer.mobile}</p>
                <p>WhatsApp : {order.customer.whatsapp}</p>
                <p>Email : {order.customer.email}</p>
                {/* <p>
                <strong>Address:</strong> {order.customer.address}
              </p> */}
              </div>
            </div>

            <div>
              <div className={styles.trackingHeader}>
                <button
                  className={styles.downloadBtn}
                  onClick={handleDownload}
                  disabled={downloadLoading}
                >
                  <i className="bi bi-download"></i>{" "}
                  {downloadLoading ? "Downloading..." : "Download PDF"}
                </button>
              </div>
              {downloadLoading && <Loading />}
              {order?.orderStatus === "Confirmed" && (
                <DispatchForm
                  actionLoading={actionLoading}
                  orderId={orderId}
                  setActionLoading={setActionLoading}
                  setShowDispatchModal={setShowDispatchModal}
                  showDispatchModal={showDispatchModal}
                  order={order}
                  setOrder={setOrder}
                  setError={setError}
                  setIsModalOpen={setIsModalOpen}
                />
              )}

              {order?.orderStatus === "Dispatched" && (
                <>
                  <button
                    className={styles.otpBtn}
                    onClick={handleSendOtp}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Sending OTP..." : "Send Delivery OTP"}
                  </button>
                  <VerifyOTP
                    actionLoading={actionLoading}
                    enteredOtp={enteredOtp}
                    handleSendOtp={handleSendOtp}
                    order={order}
                    orderId={orderId}
                    setActionLoading={setActionLoading}
                    setEnteredOtp={setEnteredOtp}
                    isDialogOpen={isDialogOpen}
                    setIsDialogOpen={setIsDialogOpen}
                    closeDialog={closeDialog}
                  />
                </>
              )}
              {/* {showOtpModal && (
                <div
                  className="modal d-block"
                  tabIndex="-1"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    
                  </div>
                </div>
              )} */}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className="w-100">
              <h6 className={styles.title}>Order Tracking</h6>
              <div className={styles.container}>
                <div
                  className={`${styles.timeline} ${
                    findTracking(order.orderStatus, order.paymentRequest?.status) > 0
                      ? styles.linecomplete
                      : findTracking(order.orderStatus, order.paymentRequest?.status) === 0
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus, order.paymentRequest?.status) > 0
                          ? styles.completed
                          : findTracking(order.orderStatus, order.paymentRequest?.status) === 0
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus, order.paymentRequest?.status) > 0
                            ? styles.completedText
                            : findTracking(order.orderStatus, order.paymentRequest?.status) === 0
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus, order.paymentRequest?.status) > 0
                          ? "Payment Details Subbmitted"
                          : "Awaiting For Payment Details"}
                      </p>
                      {/* {order.orderStatus && (
                      <p className={styles.date}>{order.orderStatus}</p>
                    )} */}
                    </div>
                  </div>
                </div>
                {/* 2 */}
                <div
                  className={`${styles.timeline} ${
                    findTracking(order.orderStatus, order.paymentRequest?.status) > 1
                      ? styles.linecomplete
                      : findTracking(order.orderStatus, order.paymentRequest?.status) === 1
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus, order.paymentRequest?.status) > 1
                          ? styles.completed
                          : findTracking(order.orderStatus, order.paymentRequest?.status) === 1
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus, order.paymentRequest?.status) > 1
                            ? styles.completedText
                            : findTracking(order.orderStatus, order.paymentRequest?.status) === 1
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus, order.paymentRequest?.status) > 1
                          ? "Payment Processed"
                          : "Awaiting Payment Processing"}
                      </p>
                      {/* {order.orderStatus && (
                      <p className={styles.date}>{order.orderStatus}</p>
                    )} */}
                    </div>
                  </div>
                </div>
                {/* 3 */}
                <div
                  className={`${styles.timeline} ${
                    findTracking(order.orderStatus, order.paymentRequest?.status) > 2
                      ? styles.linecomplete
                      : findTracking(order.orderStatus, order.paymentRequest?.status) === 2
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus, order.paymentRequest?.status) > 2
                          ? styles.completed
                          : findTracking(order.orderStatus, order.paymentRequest?.status) === 2
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus, order.paymentRequest?.status) > 2
                            ? styles.completedText
                            : findTracking(order.orderStatus, order.paymentRequest?.status) === 2
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus, order.paymentRequest?.status) > 2
                          ? "Payment Approved"
                          : "Awaiting Payment Approval"}
                      </p>
                      {findTracking(order.orderStatus, order.paymentRequest?.status) > 2 &&
                        order.paymentRequest?.updatedAt && (
                          <p className={styles.date}>
                            {formatToIST(order.paymentRequest?.updatedAt)}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
                {/* 4 */}
                <div
                  className={`${styles.timeline} ${
                    findTracking(order.orderStatus, order.paymentRequest?.status) > 3
                      ? styles.linecomplete
                      : findTracking(order.orderStatus, order.paymentRequest?.status) === 3
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus, order.paymentRequest?.status) > 3
                          ? styles.completed
                          : findTracking(order.orderStatus, order.paymentRequest?.status) === 3
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus, order.paymentRequest?.status) > 3
                            ? styles.completedText
                            : findTracking(order.orderStatus, order.paymentRequest?.status) === 3
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus, order.paymentRequest?.status) > 3
                          ? "Order Confirmed"
                          : "Awaiting Order Confirmation"}
                      </p>
                      {findTracking(order.orderStatus, order.paymentRequest?.status) > 3 &&
                        order.updatedAt && (
                          <p className={styles.date}>
                            {formatToIST(order?.updatedAt)}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
                {/* 5 */}
                <div
                  className={`${`${styles.timeline} ${
                    findTracking(order.orderStatus, order.paymentRequest?.status) > 4
                      ? styles.linecomplete
                      : findTracking(order.orderStatus, order.paymentRequest?.status) === 4
                      ? styles.linecurrent
                      : styles.linepending
                  }`} ${
                    findTracking(order.orderStatus, order.paymentRequest?.status) > 4
                      ? styles.linecomplete
                      : findTracking(order.orderStatus, order.paymentRequest?.status) === 4
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus, order.paymentRequest?.status) > 4
                          ? styles.completed
                          : findTracking(order.orderStatus, order.paymentRequest?.status) === 4
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus, order.paymentRequest?.status) > 4
                            ? styles.completedText
                            : findTracking(order.orderStatus, order.paymentRequest?.status) === 4
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus, order.paymentRequest?.status) > 4
                          ? "Order Dispatched"
                          : "Awaiting Order Dispatch"}
                      </p>
                      {order.dispatchDate && (
                        <p className={styles.date}>
                          {formatToIST(order.dispatchDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* 6 */}
                <div
                  className={`${styles.timelinelast} ${
                    findTracking(order.orderStatus, order.paymentRequest?.status) > 5
                      ? styles.linecomplete
                      : findTracking(order.orderStatus, order.paymentRequest?.status) === 5
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus, order.paymentRequest?.status) > 5
                          ? styles.completed
                          : findTracking(order.orderStatus, order.paymentRequest?.status) === 5
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus, order.paymentRequest?.status) > 5
                            ? styles.completedText
                            : findTracking(order.orderStatus, order.paymentRequest?.status) === 5
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus, order.paymentRequest?.status) > 5
                          ? "Order Delivered"
                          : "Awaiting Order to Deliver"}
                      </p>
                      {order.deliveredDate && (
                        <p className={styles.date}>
                          {formatToIST(order.deliveredDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/*  */}
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.wseDetails}>
              <h6>Sales Executive</h6>
              <p>
                <span>Name : </span>
                {order.salesExecutive?.name}
              </p>
              <p>
                <span>Mobile : </span>
                {order.salesExecutive?.mobile}
              </p>
            </div>
            <div className={styles.wseDetails}>
              <h6>Warehouse </h6>
              <p>
                <span>Name : </span>
                {order.warehouse?.name}
              </p>
              <p>
                <span>Address : </span>
                {order.warehouse?.fullAddress}
              </p>
            </div>
          </div>
          <div className={styles.infoGrid}>
            <h6 className={styles.title}>Drop-off Points </h6>
            <div className={styles.infoCard}>
              <DropOffs dropoffs={order.dropOffs} />
            </div>
          </div>

          <div className={styles.infoGrid}>
            <h6 className={styles.title}>Order Items </h6>
            <div className={styles.infoCard}>
              <ProductsList items={order.items} />
            </div>
          </div>

          <div className={styles.infoGrid}>
            <h6 className={styles.title}>Payment Details </h6>
            <div className={styles.infoCard}>
              <PaymentInfo info={order.paymentRequest} />
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
      {loading && <Loading />}
      {showDispatchModal && <></>}
    </>
  );
};

export default TrackingPage;
