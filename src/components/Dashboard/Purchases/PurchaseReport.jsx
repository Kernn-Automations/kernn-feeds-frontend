import React, { useEffect, useState } from "react";
import styles from "./Purchases.module.css";
import ReportViewModal from "./ReportViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";

function PurchaseReport({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  const [warehouses, setWarehouses] = useState();

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
        const res1 = await axiosAPI.get("/warehouse");
        console.log(res1);
        setWarehouses(res1.data.warehouses);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, []);

  // Backend

  const [purchases, setPurchases] = useState();

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [trigger, setTrigger] = useState(false);
  const [warehouse, setWarehouse] = useState();

  const onSubmit = () => {
    setTrigger(trigger ? false : true);
  };

  useEffect(() => {
    async function fetch() {
      try {
        setPurchases(null);
        setLoading(true);
        console.log(
          `/purchases?fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }`
        );
        const res = await axiosAPI.get(
          `/purchases?fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }`
        );
        console.log(res);
        setPurchases(res.data.purchaseOrders);
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

  const [tableData, setTableData] = useState([]);

  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = ["S.No", "Date", "PO ID", "Warehouse Name", "Net Amount"];
    if (purchases && purchases.length > 0) {
      purchases.map((st) =>
        arr.push({
          "S.No": x++,
          Date: st.date.slice(0, 10),
          "PO ID": st.ordernumer,
          "Warehouse Name": st.warehouse?.name || "na",
          "Net Amount": st.totalAmount,
        })
      );
      setTableData(arr);

      if (type === "PDF") handleExportPDF(columns, tableData, "Purchase-Order");
      else if (type === "XLS")
        handleExportExcel(columns, tableData, "Purchase-Order");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  // Function to export as Excel
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
  //   saveAs(excelFile, "incoming_stock_table_data.xlsx");
  // };
  // const tableData = [
  //   ["S.No", "Date", "Purchase ID", "Warehouse", "Net Amount"],
  //   ["1", "2025-02-28", "KM20", "Warehouse 1", "2000"],
  //   ["2", "2025-02-28", "KM20", "Warehouse 2", "2000"],
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
  //   saveAs(excelFile, "purchase_report_table_data.xlsx");
  // };

  // // Function to export as PDF
  // const exportToPDF = () => {
  //   const doc = new jsPDF();

  //   doc.setFont("helvetica", "bold"); // Set font style
  //   doc.setFontSize(16); // Set font size for title
  //   doc.text("Purchase Report", 14, 10); // Title text with position (X: 14, Y: 10)

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
  //   doc.save("purchase_report_table_data.pdf");
  // };

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/purchases")}>Purchase</span>{" "}
        <i class="bi bi-chevron-right"></i> Purchase order Report
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
            value={warehouse ?? ""}
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
        <div className={`col-3`}>
          <button className="submitbtn" onClick={onSubmit}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/purchases")}>
            Cancel
          </button>
        </div>
      </div>

      {purchases && (
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
                  <th>Purchase ID</th>
                  <th>Warehouse</th>
                  <th>Net Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={6}>NO DATA FOUND</td>
                  </tr>
                )}
                {purchases.length > 0 &&
                  purchases.map((order) => (
                    <tr
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{order.date}</td>
                      <td>{order.ordernumer}</td>
                      <td>{order.warehouse.name}</td>
                      <td>{order.totalAmount}</td>
                      <td>
                        <ReportViewModal
                          order={order}
                          warehouses={warehouses}
                        />
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
      {loading && <Loading />}
    </>
  );
}

export default PurchaseReport;
