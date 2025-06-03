import React, { useEffect, useState } from "react";
import styles from "./Sales.module.css";
import OrdersViewModal from "./OrdersViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";

import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import orderAni from "../../../images/animations/confirmed.gif";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";

function Orders({ navigate, warehouses, customers, setOrderId }) {
  const [onsubmit, setonsubmit] = useState(false);

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [warehouse, setWarehouse] = useState();
  const [customer, setCustomer] = useState();
  const [trigger, setTrigger] = useState(false);

  let index = 1;

  // backend -----------------
  const [orders, setOrders] = useState();

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    async function fetch() {
      try {
        setOrders(null);
        setLoading(true);
        console.log(
          `/sales-orders?fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerId=${customer}` : ""}&page=${pageNo}`
        );
        const res = await axiosAPI.get(
          `/sales-orders?fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerId=${customer}` : ""}&page=${pageNo}`
        );
        console.log(res);
        setOrders(res.data.salesOrders);
        setTotalPages(res.data.totalPages);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger, pageNo]);

  const onSubmit = () => {
    // console.log(from, to, warehouse, customer);
    setTrigger(trigger ? false : true);
  };

  // pdf code -----------------------------------

  const [tableData, setTableData] = useState([]);

  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = [
      "S.No",
      "Date",
      "Order ID",
      "Warehouse Name",
      "Customer ID",
      "TNX Amount",
      "Payment Mode",
    ];
    if (orders && orders.length > 0) {
      orders.map((order) =>
        arr.push({
          "S.No": x++,
          Date: order.createdAt.slice(0, 10),
          "Order ID": order.orderNumber,
          "Warehouse Name": order.warehouse?.name,
          "Customer ID": order.customer?.customer_id,
          "TNX Amount": order.totalAmount,
          "Payment Mode": "UPI",
        })
      );
      setTableData(arr);

      if (type === "PDF") handleExportPDF(columns, tableData, "Orders");
      else if (type === "XLS") handleExportExcel(columns, tableData, "Orders");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* <p className="path">
        <span onClick={() => navigate("/sales")}>Sales</span>{" "}
        <i class="bi bi-chevron-right"></i> Orders
      </p> */}

      <div className="row m-0 p-3">
        <div className={`col-3 formcontent`}>
          <label htmlFor="">From :</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">To :</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">WareHouse :</label>
          <select
            name=""
            id=""
            value={warehouse}
            onChange={(e) =>
              setWarehouse(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
          </select>
        </div>
        {/* <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select name="" id="">
            <option value="">--select--</option>
            {products && products.map((product) => <option value={product.id}>{product.name}</option>)}
          </select>
        </div> */}
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Customer :</label>
          <select
            name=""
            id=""
            value={customer}
            onChange={(e) =>
              setCustomer(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {customers &&
              customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 justify-content-center">
        <div className={`col-3 formcontent`}>
          <button className="submitbtn" onClick={onSubmit}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/sales")}>
            Cancel
          </button>
        </div>
      </div>

      {orders && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-8">
            <button className={styles.xls} onClick={() => onExport("XLS")}>
              <p>Export to </p>
              <img src={xls} alt="" />
            </button>
            <button className={styles.xls} onClick={() => onExport("PDF")}>
              <p>Export to </p>
              <img src={pdf} alt="" />
            </button>
          </div>
          <div className="col-lg-10">
            <table className={`table table-hover table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Warehouse Name</th>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>TNX Amount</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8}>NO DATA FOUND</td>
                  </tr>
                )}
                {orders.length > 0 &&
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => {
                        setOrderId(order.id);
                        navigate("/sales/tracking");
                      }}
                    >
                      <td>{index++}</td>
                      <td>{order.createdAt.slice(0, 10)}</td>
                      <td>{order.orderNumber}</td>
                      <td>{order.warehouse?.name}</td>
                      <td>{order.customer?.customer_id}</td>
                      <td>{order.customer?.name}</td>
                      <td>{order.totalAmount}</td>
                      <td>UPI</td>
                      <td className={styles.imageCol}>
                        {order.orderStatus === "awaitingPaymentConfirmation" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#F3C623"
                            >
                              <path d="m619.05-287.55 53.21-52.73-153.98-154.68v-192.67h-72.56v221.97l173.33 178.11ZM480.02-73.3q-83.95 0-158.12-32.01-74.18-32-129.38-87.2-55.2-55.19-87.21-129.36Q73.3-396.04 73.3-479.98q0-83.95 32.04-158.14 32.04-74.19 87.19-129.35 55.16-55.15 129.33-87.27 74.18-32.12 158.14-32.12 83.96 0 158.14 32.12 74.17 32.12 129.33 87.27 55.15 55.16 87.27 129.33 32.12 74.18 32.12 158.14 0 83.96-32.12 158.14-32.12 74.17-87.27 129.33-55.16 55.15-129.33 87.19Q563.97-73.3 480.02-73.3Z" />
                            </svg>
                          </p>
                        ) : order.orderStatus === "Confirmed" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#0065F8"
                            >
                              <path d="M189.06-73.3q-31.5 0-53.63-22.13-22.13-22.13-22.13-53.63v-470.98q-17.57-8.91-28.78-26.25-11.22-17.34-11.22-39.29v-125.36q0-31.56 22.13-53.74 22.13-22.18 53.63-22.18h661.88q31.56 0 53.74 22.18 22.18 22.18 22.18 53.74v125.36q0 21.95-11.3 39.27-11.29 17.33-28.7 26.27v470.98q0 31.5-22.18 53.63Q802.5-73.3 770.94-73.3H189.06Zm-40-612.28h662.12v-125.36H149.06v125.36Zm207.51 277.03h247.1v-71.93h-247.1v71.93Z" />
                            </svg>
                          </p>
                        ) : order.orderStatus === "Dispatched" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#F3C623"
                            >
                              <path d="M231.01-154.53q-49.89 0-85.36-34.37-35.46-34.37-36.1-84.3H33.86v-457.18q0-31 22.38-53.38 22.38-22.38 53.38-22.38h572.66v161.56h108.09l135.77 181.02v190.36h-77.27q-.8 49.93-36.18 84.3-35.39 34.37-85.28 34.37t-85.35-34.37q-35.47-34.37-36.1-84.3H352.22q-.79 49.58-36.06 84.12-35.26 34.55-85.15 34.55Zm-.08-69.85q21.66 0 36.83-15.17 15.17-15.17 15.17-36.83 0-21.67-15.17-36.84-15.17-15.16-36.83-15.16-21.67 0-36.84 15.16-15.16 15.17-15.16 36.84 0 21.66 15.16 36.83 15.17 15.17 36.84 15.17Zm496.4 0q21.67 0 36.84-15.17 15.16-15.17 15.16-36.83 0-21.67-15.16-36.84-15.17-15.16-36.84-15.16-21.66 0-36.83 15.16-15.17 15.17-15.17 36.84 0 21.66 15.17 36.83 15.17 15.17 36.83 15.17ZM682.28-430h174.21l-104-138.67h-70.21V-430Z" />
                            </svg>
                          </p>
                        ) : order.orderStatus === "Delivered" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#5CB338"
                            >
                              <path d="m342.62-51.47-77.51-132.04-151.86-32.06 16.48-150.28L31.23-480l98.5-113.49-16.48-150.44 151.86-31.89 77.51-132.71L480-846.75l137.54-61.78 78.02 132.71 151.19 31.89-16.48 150.44L928.77-480l-98.5 114.15 16.48 150.28-151.19 32.06-78.02 132.04L480-113.25 342.62-51.47Zm94.71-290.38 228.82-227.48-51.06-48.74-177.76 176.58-91.76-94.23-51.72 51.05 143.48 142.82Z" />
                            </svg>
                          </p>
                        ) : (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#EA7300"
                            >
                              <path d="M314.39-149.06h331.22v-122.27q0-69.05-48.28-117-48.29-47.95-117.33-47.95-69.04 0-117.33 47.95-48.28 47.95-48.28 117v122.27ZM153.3-73.3v-75.76h85.34v-122.22q0-66.92 35.01-123.18 35.01-56.26 94.34-85.54-59.33-29.94-94.34-86.2-35.01-56.26-35.01-123.19v-121.55H153.3v-75.92h653.56v75.92h-85.34v121.55q0 66.93-34.97 123.19-34.97 56.26-94.38 86.2 59.41 29.28 94.38 85.54 34.97 56.26 34.97 123.18v122.22h85.34v75.76H153.3Z" />
                            </svg>
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
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
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <LoadingAnimation gif={orderAni} />}
    </>
  );
}

export default Orders;
