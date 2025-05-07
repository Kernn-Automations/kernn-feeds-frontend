import React, { useEffect, useState } from "react";
import styles from "./Sales.module.css";
import DispachViewModal from "./DispachViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import dispatchAni from "../../../images/animations/dispatch_secondary.gif";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";

function Dispaches({ navigate, warehouses, customers }) {
  const [onsubmit, setonsubmit] = useState(false);

  // const tableData = [
  //   [
  //     "S.No",
  //     "Date",
  //     "Order ID",
  //     "Warehouse ID",
  //     "Customer ID",
  //     "Dispatch Date",
  //     "Truck No.",
  //   ],
  //   ["1", "2025-02-28", "KM20", "4420", "2323", "2025-02-28", "AP-12-DF-2022"],
  //   ["2", "2025-02-28", "KM20", "4423", "2324", "2025-02-28", "AP-12-DF-2023"],
  // ];

  // // Function to export as Excel
  // const exportToExcel = () => {
  //   const worksheet = XLSX.utils.aoa_to_sheet(tableData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });
  //   const excelFile = new Blob([excelBuffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   saveAs(excelFile, "dispatches_table_data.xlsx");
  // };

  // // Function to export as PDF
  // const exportToPDF = () => {
  //   const doc = new jsPDF();

  //   doc.setFont("helvetica", "bold"); // Set font style
  //   doc.setFontSize(16); // Set font size for title
  //   doc.text("Dispatches", 14, 10); // Title text with position (X: 14, Y: 10)

  //   autoTable(doc, {
  //     headStyles: {
  //       fillColor: [169, 36, 39], // Convert HEX #a92427 to RGB (169, 36, 39)
  //       textColor: [255, 255, 255], // White text
  //       fontStyle: "bold",
  //       fontSize: 10,
  //     },
  //     bodyStyles: {
  //       textColor: [0, 0, 0], // Black text
  //       fontSize: 10, // Reduce body font size
  //     },
  //     // Use autoTable(doc, {}) instead of doc.autoTable({})
  //     head: [tableData[0]], // Table Header
  //     body: tableData.slice(1), // Table Data
  //   });
  //   doc.save("dispatches_table_data.pdf");
  // };

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
      "Dispatch Date",
      "Truck No.",
    ];
    if (orders && orders.length > 0) {
      orders.map((order) =>
        arr.push({
          "S.No": x++,
          Date: order.createdAt.slice(0, 10),
          "Order ID": order.orderNumber,
          "Warehouse Name": order.warehouse.name,
          "Customer ID": order.customer.customer_id,
          "Dispatch Date": order.dispatchDate && order.dispatchDate.slice(0, 10),
          "Truck No.": order.truckNumber,
        })
      );
      setTableData(arr);

      if (type === "PDF") handleExportPDF(columns, tableData, "Deliveries");
      else if (type === "XLS") handleExportExcel(columns, tableData, "Deliveries");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  let index = 1;

  // backend --------------------------
  const [orders, setOrders] = useState();

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [warehouse, setWarehouse] = useState();
  const [customer, setCustomer] = useState();
  const [trigger, setTrigger] = useState(false);

  const onSubmit = () => {
    console.log(from, to, warehouse, customer);
    setTrigger(trigger ? false : true);
  };

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        setOrders(null);
        setLoading(true);
        console.log(
          `/sales-orders?status=Confirmed&fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerId=${customer}` : ""}`
        );
        const res = await axiosAPI.get(
          `/sales-orders?status=Dispatched&fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerId=${customer}` : ""}`
        );
        console.log(res);
        setOrders(res.data.salesOrders);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger]);

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/sales")}>Sales</span>{" "}
        <i class="bi bi-chevron-right"></i> Dispatches
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
            onChange={(e) => setWarehouse(e.target.value === "null" ? null : e.target.value)}
          >
            <option value="null">--select--</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option value={warehouse.id}>{warehouse.name}</option>
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
            onChange={(e) => setCustomer(e.target.value === "null" ? null : e.target.value)}
          >
            <option value="null">--select--</option>
            {customers &&
              customers.map((customer) => (
                <option value={customer.id}>{customer.name}</option>
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
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Warehouse Name</th>
                  <th>Customer ID</th>
                  <th>Dispatch Date</th>
                  <th>Truck No.</th>
                  <th>Action</th>
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
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{order.createdAt.slice(0, 10)}</td>
                      <td>{order.orderNumber}</td>
                      <td>{order.warehouse.name}</td>
                      <td>{order.customer.customer_id}</td>
                      <td>
                        {order.dispatchDate && order.dispatchDate.slice(0, 10)}
                      </td>
                      <td>{order.truckNumber}</td>
                      <td>
                        <DispachViewModal order={order} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <LoadingAnimation gif={dispatchAni} />}
    </>
  );
}

export default Dispaches;
