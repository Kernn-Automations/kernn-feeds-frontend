import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import styles from "./Sales.module.css";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { useAuth } from "@/Auth";

function CancelledOrders() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [warehouse, setWarehouse] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [limit, setLimit] = useState(10);
  const [pageNo, setPageNo] = useState(1);

  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [reasonPopup, setReasonPopup] = useState({ open: false, text: "" });

  const { axiosAPI } = useAuth();

  useEffect(() => {
    // Fetch warehouses, customers etc.
      async function fetchFilters() {
    try {
      const res1 = await axiosAPI.get("/warehouse");
      const res2 = await axiosAPI.get("/customers");

      setWarehouses(res1.data.warehouses);
      setCustomers(res2.data.customers);
    } catch (err) {
      setError("Failed to fetch filters.");
      setIsModalOpen(true);
    }
  }

  fetchFilters();
  }, []);

  const onSubmit = async() => {
    
    // API call logic for cancelled orders
      setLoading(true);
        try {
            const queryParams = new URLSearchParams({
            ...(from && { from }),
            ...(to && { to }),
            ...(warehouse && { warehouse }),
            ...(customer && { customer }),
            limit,
            page: pageNo,
            }).toString();

            const response = await axiosAPI.get(`/cancelled-sales-orders?${queryParams}`);
            setOrders(response.data.orders || response.data); // depending on API structure
        } catch (err) {
            setError("Failed to fetch cancelled orders.");
            setIsModalOpen(true);
        } finally {
            setLoading(false);
        }
    
  };

  const GrandTotal = () => {
    return orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  };

  const onExport = (format) => {
    // Export logic (XLS / PDF)
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/sales")}>Sales</span>{" "}
        <i className="bi bi-chevron-right"></i> Cancelled Orders
      </p>

      <div className="row m-0 p-3">
        <div className="col-3 formcontent">
          <label>From :</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="col-3 formcontent">
          <label>To :</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="col-3 formcontent">
          <label>Warehouse :</label>
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value === "null" ? null : e.target.value)}
          >
            <option value="null">--select--</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-3 formcontent">
          <label>Customer :</label>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value === "null" ? null : e.target.value)}
          >
            <option value="null">--select--</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row m-0 p-3 justify-content-center">
        <div className="col-3 formcontent">
          <button className="submitbtn" onClick={onSubmit}>Submit</button>
          <button className="cancelbtn" onClick={() => navigate("/sales")}>Cancel</button>
        </div>
      </div>

      {orders && (
        <div className="row m-0 p-3 justify-content-around">
          <div className="col-lg-5">
            <button className={styles.xls} onClick={() => onExport("XLS")}>
              <p>Export to</p>
              <img src={xls} alt="xls" />
            </button>
            <button className={styles.xls} onClick={() => onExport("PDF")}>
              <p>Export to</p>
              <img src={pdf} alt="pdf" />
            </button>
          </div>
          <div className={`col-lg-3 ${styles.entity}`}>
            <label>Entity :</label>
            <select value={limit} onChange={(e) => setLimit(e.target.value)}>
              {[10, 20, 30, 40, 50].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-10">
            <table className="table table-hover table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Warehouse Name</th>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Amount</th>
                  <th>Cancelled Date</th>
                  <th>Cancelled Reason</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={9}>NO DATA FOUND</td>
                  </tr>
                )}
                {orders.map((order, index) => (
                  <tr key={order.id} className="animated-row">
                    <td>{index + 1}</td>
                    <td>{order.createdAt?.slice(0, 10)}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.warehouse?.name}</td>
                    <td>{order.customer?.customer_id}</td>
                    <td>{order.customer?.name}</td>
                    <td>{order.totalAmount}</td>
                    <td>{order.cancelledAt?.slice(0, 10)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          setReasonPopup({ open: true, text: order.cancelReason })
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length > 0 && (
              <p className="text-end fs-5 pe-3 py-2">
                Grand Total : {GrandTotal()}
              </p>
            )}

            <div className="row m-0 p-0 pt-3 justify-content-between">
              <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
                {pageNo > 1 && (
                  <button onClick={() => setPageNo(pageNo - 1)}>
                    <FaArrowLeftLong /> Previous
                  </button>
                )}
              </div>
              <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
                {orders.length === limit && (
                  <button onClick={() => setPageNo(pageNo + 1)}>
                    Next <FaArrowRightLong />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {reasonPopup.open && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "#00000066" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">Cancelled Reason</h5>
                <button type="button" className="btn-close" onClick={() => setReasonPopup({ open: false, text: "" })}></button>
              </div>
              <div className="modal-body">
                <p>{reasonPopup.text}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setReasonPopup({ open: false, text: "" })}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <LoadingAnimation />}
    </>
  );
}

export default CancelledOrders;
