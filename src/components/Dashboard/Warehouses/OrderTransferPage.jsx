import React, { useEffect, useState } from "react";
import { useAuth } from "@/Auth";
import styles from "./OrderTransferPage.module.css";
import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";

function OrderTransferPage({navigate}) {
  const { axiosAPI } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [targetWarehouseId, setTargetWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    axiosAPI.get("/warehouse").then((res) => {
      setWarehouses(res.data.warehouses || []);
    });
  }, []);

  useEffect(() => {
    if (!selectedWarehouseId) return;
    axiosAPI
      .get(`/sales-orders/confirmed?warehouseId=${selectedWarehouseId}`)
      .then((res) => {
        setSalesOrders(res.data.salesOrders || []);
        setSelectedOrderId("");
        setOrderDetails(null);
      });
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (!selectedOrderId) return;
    axiosAPI.get(`/sales-orders/order/${selectedOrderId}`).then((res) => {
        console.log(res);
      setOrderDetails(res.data);
    });
  }, [selectedOrderId]);

    const handleSubmit = async () => {
    if (!selectedOrderId || !targetWarehouseId) return;
    setLoading(true);
    try {
        await axiosAPI.post(`/warehouse/transfer/order`, {
        orderId: selectedOrderId,
        newWarehouseId: targetWarehouseId,
        });
        setModalMessage("Order transferred successfully!");
        setSuccessOpen(true);
    } catch (err) {
        console.error(err);
        setModalMessage("Error transferring order.");
        setErrorOpen(true);
    } finally {
        setLoading(false);
    }
    };

    const handleSuccessClose = () => {
        setSuccessOpen(false);
        navigate("/warehouses");
    };

  return (
    <div className={`${styles.page} container py-4`}>
        <p className="path">
        <span onClick={() => navigate("/warehouses")} style={{ cursor: "pointer", color: "#007bff" }}>Warehouse</span>{" "}
        <i className="bi bi-chevron-right"></i> Stock Transfer
      </p>
      <h3 className="mb-4 fw-bold text-primary">Transfer Sales Order</h3>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Source Warehouse</label>
          <select
            className="form-select"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
          >
            <option value="">-- Select Warehouse --</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {salesOrders.length > 0 && (
          <div className="col-md-6">
            <label className="form-label">Sales Order</label>
            <select
              className="form-select"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
            >
              <option value="">-- Select Order --</option>
              {salesOrders.map((o) => (
                <option key={o.id} value={o.id}>{o.orderNumber}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {orderDetails && (
        <div className="card border shadow-sm mb-4">
          <div className="card-header bg-light fw-semibold">Order Summary</div>
          <div className="card-body">
            <p><strong>Order Number:</strong> {orderDetails.orderNumber}</p>
            <p><strong>Customer:</strong> {orderDetails.customer?.name}</p>
            <div><strong>Products:</strong></div>
            <ul className="mb-0">
              {orderDetails.items?.map((item) => (
                <li key={item.id}>
                  {item.productName} – {item.quantity} {item.unit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedOrderId && (
        <div className="mb-3">
          <label className="form-label">Transfer To Warehouse</label>
          <select
            className="form-select"
            value={targetWarehouseId}
            onChange={(e) => setTargetWarehouseId(e.target.value)}
          >
            <option value="">-- Select Target Warehouse --</option>
            {warehouses
              .filter((w) => w.id !== selectedWarehouseId)
              .map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
          </select>
        </div>
      )}

      <button
        className="btn btn-success"
        disabled={!selectedOrderId || !targetWarehouseId || loading}
        onClick={handleSubmit}
      >
        {loading ? "Transferring..." : "Submit Transfer"}
      </button>
       {/* Modals */}
      <SuccessModal isOpen={successOpen} message={modalMessage} onClose={handleSuccessClose} />
      <ErrorModal isOpen={errorOpen} message={modalMessage} onClose={() => setErrorOpen(false)} />
    </div>
  );
}

export default OrderTransferPage;
