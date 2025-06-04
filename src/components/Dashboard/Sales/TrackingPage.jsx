import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import React, { useEffect, useState } from "react";
import styles from "./Sales.module.css"; // Import CSS module
import DropOffs from "./DropOffs";
import ProductsList from "./ProductsList";
import PaymentInfo from "./PaymentInfo";

const TrackingPage = ({ orderId, setOrderId, navigate }) => {
  const [order, setOrder] = useState();
  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

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

  const findTracking = (status) => {
    if (status === "Pending") return 2;
    else if (status === "awaitingPaymentConfirmation") return 3;
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

          <div className={styles.infoCard}>
            <div className="w-100">
              <h6 className={styles.title}>Order Tracking</h6>
              <div className={styles.container}>
                <div
                  className={`${styles.timeline} ${
                    findTracking(order.orderStatus) > 0
                      ? styles.linecomplete
                      : findTracking(order.orderStatus) === 0
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus) > 0
                          ? styles.completed
                          : findTracking(order.orderStatus) === 0
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus) > 0
                            ? styles.completedText
                            : findTracking(order.orderStatus) === 0
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus) > 0
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
                    findTracking(order.orderStatus) > 1
                      ? styles.linecomplete
                      : findTracking(order.orderStatus) === 1
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus) > 1
                          ? styles.completed
                          : findTracking(order.orderStatus) === 1
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus) > 1
                            ? styles.completedText
                            : findTracking(order.orderStatus) === 1
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus) > 1
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
                    findTracking(order.orderStatus) > 2
                      ? styles.linecomplete
                      : findTracking(order.orderStatus) === 2
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus) > 2
                          ? styles.completed
                          : findTracking(order.orderStatus) === 2
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus) > 2
                            ? styles.completedText
                            : findTracking(order.orderStatus) === 2
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus) > 2
                          ? "Payment Approved"
                          : "Awaiting Payment Approval"}
                      </p>
                      {order.paymentRequest?.updatedAt && (
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
                    findTracking(order.orderStatus) > 3
                      ? styles.linecomplete
                      : findTracking(order.orderStatus) === 3
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus) > 3
                          ? styles.completed
                          : findTracking(order.orderStatus) === 3
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus) > 3
                            ? styles.completedText
                            : findTracking(order.orderStatus) === 3
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus) > 3
                          ? "Order Confirmed"
                          : "Awaiting Order Confirmation"}
                      </p>
                      {order.paymentRequest?.updatedAt && (
                        <p className={styles.date}>
                          {formatToIST(order.paymentRequest?.updatedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* 5 */}
                <div
                  className={`${`${styles.timeline} ${
                    findTracking(order.orderStatus) > 4
                      ? styles.linecomplete
                      : findTracking(order.orderStatus) === 4
                      ? styles.linecurrent
                      : styles.linepending
                  }`} ${
                    findTracking(order.orderStatus) > 4
                      ? styles.linecomplete
                      : findTracking(order.orderStatus) === 4
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus) > 4
                          ? styles.completed
                          : findTracking(order.orderStatus) === 4
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus) > 4
                            ? styles.completedText
                            : findTracking(order.orderStatus) === 4
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus) > 4
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
                    findTracking(order.orderStatus) > 5
                      ? styles.linecomplete
                      : findTracking(order.orderStatus) === 5
                      ? styles.linecurrent
                      : styles.linepending
                  }`}
                >
                  <div className={styles.step}>
                    <div
                      className={`${styles.circle} ${
                        findTracking(order.orderStatus) > 5
                          ? styles.completed
                          : findTracking(order.orderStatus) === 5
                          ? styles.current
                          : styles.pending
                      }`}
                    ></div>
                    <div className={styles.stepText}>
                      <p
                        className={`${
                          findTracking(order.orderStatus) > 5
                            ? styles.completedText
                            : findTracking(order.orderStatus) === 5
                            ? styles.currentText
                            : styles.pendingText
                        }`}
                      >
                        {findTracking(order.orderStatus) > 5
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
    </>
  );
};

export default TrackingPage;
