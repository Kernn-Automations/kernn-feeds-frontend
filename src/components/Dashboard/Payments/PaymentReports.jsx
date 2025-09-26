import React, { useEffect, useState } from "react";
import styles from "./Payments.module.css";
import ReportsViewModal from "./ReportsViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { useAuth } from "@/Auth";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";

function PaymentReports({ navigate }) {
  const { axiosAPI } = useAuth();

  const [salesOrders, setSalesOrders] = useState([]);
  const [filteredSalesOrders, setFilteredSalesOrders] = useState([]);

  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [ses, setSes] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };
  
  const closeReportsModal = () => {
    setIsReportsModalOpen(false);
    setSelectedSalesOrder(null);
  };

  const [trigger, setTrigger] = useState(false);

  const onSubmit = () => {
    setTrigger(!trigger);
  };

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [warehouse, setWarehouse] = useState("");
  const [customer, setCustomer] = useState("");
  const [se, setSe] = useState("");

  // Fetch initial data (warehouses, customers, SES)
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const res1 = await axiosAPI.get("/warehouse");
        const res2 = await axiosAPI.get("/customers");
        const res3 = await axiosAPI.get("/employees/role/Business Officer");

        setWarehouses(res1.data.warehouses || []);
        setCustomers(res2.data.customers || []);
        setSes(res3.data.employees || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch initial data.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // Fetch payment reports based on filters
  useEffect(() => {
    setSalesOrders([]);
    setFilteredSalesOrders([]);
    async function fetchReports() {
      try {
        setLoading(true);
        let query = `/payment-requests?status=Approved&fromDate=${from}&toDate=${to}`;
        if (warehouse && warehouse !== "all") {
          query += `&warehouseId=${warehouse}`;
        }
        if (customer) {
          query += `&customerTd=${customer}`;
        }
        if (se) {
          query += `&salesExecutiveId=${se}`;
        }
        const res = await axiosAPI.get(query);
        setSalesOrders(res.data.salesOrders || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch payment reports.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [trigger, from, to, warehouse, customer, se]);

  // Apply filters to sales orders
  useEffect(() => {
    const filtered = salesOrders.filter((order) => {
      let isMatch = true;
      if (warehouse && warehouse !== "all") {
        isMatch = isMatch && order.warehouse?.id === warehouse;
      }
      if (customer) {
        isMatch = isMatch && order.customer?.id === customer;
      }
      if (se) {
        isMatch = isMatch && order.salesExecutive?.id === se;
      }
      const orderDate = new Date(order.paymentRequests[0]?.transactionDate);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      isMatch = isMatch && orderDate >= fromDate && orderDate <= toDate;
      return isMatch;
    });
    setFilteredSalesOrders(filtered);
  }, [salesOrders, warehouse, customer, se, from, to]);

  // Helper to calculate total amount for a sales order
  const calculateTotalAmount = (paymentRequests) => {
    if (!paymentRequests) return "0.00";
    return paymentRequests
      .reduce((sum, pr) => sum + (pr.netAmount || 0), 0)
      .toFixed(2);
  };

  // Function to open the modal and set the selected order
  const openReportsModal = (salesOrder) => {
    setSelectedSalesOrder(salesOrder);
    setIsReportsModalOpen(true);
  };

  const onExport = (type) => {
    if (!filteredSalesOrders || filteredSalesOrders.length === 0) {
      setError("Table is empty.");
      setIsModalOpen(true);
      return;
    }
    const columns = [
      "S.No",
      "Order Number",
      "Customer Name",
      "SE Name",
      "Warehouse",
      "Total Amount",
    ];
    const data = filteredSalesOrders.map((order, index) => [
      index + 1,
      order.orderNumber,
      order.customer?.name,
      order.salesExecutive?.name,
      order.warehouse?.name,
      calculateTotalAmount(order.paymentRequests),
    ]);
    if (type === "PDF") {
      handleExportPDF(columns, data, "Payment-Reports");
    } else if (type === "XLS") {
      handleExportExcel(columns, data, "Payment-Reports");
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/payments")}>Payments</span>{" "}
        <i className="bi bi-chevron-right"></i> Payment-Reports
      </p>
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
            onChange={(e) => setWarehouse(e.target.value)}
          >
            <option value="">--select--</option>
            <option value="all">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Sales Executive :</label>
          <select
            name=""
            id=""
            value={se}
            onChange={(e) => setSe(e.target.value)}
          >
            <option value="">--select--</option>
            {ses.map((se) => (
              <option key={se.id} value={se.id}>
                {se.name}
              </option>
            ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Customer :</label>
          <select
            name=""
            id=""
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          >
            <option value="">--select--</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row m-0 p-2 justify-content-center">
        <div className={`col-3 formcontent`}>
          <button className="submitbtn" onClick={onSubmit}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
      {loading && <Loading />}
      {!loading && filteredSalesOrders && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-10">
            <button className={styles.xls} onClick={() => onExport("XLS")}>
              <p>Export to </p>
              <img src={xls} alt="Export to Excel" />
            </button>
            <button className={styles.xls} onClick={() => onExport("PDF")}>
              <p>Export to </p>
              <img src={pdf} alt="Export to PDF" />
            </button>
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Order Number</th>
                  <th>Customer Name</th>
                  <th>SE Name</th>
                  <th>Warehouse</th>
                  <th>Total Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalesOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7}>NO DATA FOUND</td>
                  </tr>
                ) : (
                  filteredSalesOrders.map((order, i) => (
                    <tr key={order.salesOrderId} className="animated-row">
                      <td>{i + 1}</td>
                      <td>{order.orderNumber}</td>
                      <td>{order.customer?.name}</td>
                      <td>{order.salesExecutive?.name}</td>
                      <td>{order.warehouse?.name}</td>
                      <td>{calculateTotalAmount(order.paymentRequests)}</td>
                      <td>
                        {/* Here, we call the function to open the modal directly */}
                        <button
                          onClick={() => openReportsModal(order)}
                          className={`btn ${styles.viewBtn}`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER A SINGLE MODAL INSTANCE HERE, CONTROLLED BY STATE */}
      {isReportsModalOpen && selectedSalesOrder && (
        <ReportsViewModal
          report={selectedSalesOrder}
          onClose={closeReportsModal}
          isOpen={isReportsModalOpen}
        />
      )}

      {isModalOpen && error && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default PaymentReports;