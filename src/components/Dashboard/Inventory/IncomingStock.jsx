import React, { useState } from "react";
import styles from "./Inventory.module.css";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function IncomingStock({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  const tableData = [
    [
      "S.No",
      "Date",
      "PO ID",
      "Warehouse ID",
      "Product ID",
      "Quantity",
      "Amount",
    ],
    ["1", "2025-02-28", "KM20", "3423", "#4545", "3", "2000"],
    ["2", "2025-02-28", "KM20", "3423", "#4545", "3", "2000"],
  ];

  // Function to export as Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const excelFile = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(excelFile, "incoming_stock_table_data.xlsx");
  };

  // Function to export as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold"); // Set font style
    doc.setFontSize(16); // Set font size for title
    doc.text("Incoming Stock", 14, 10); // Title text with position (X: 14, Y: 10)

    autoTable(doc, {
      headStyles: {
        fillColor: [169, 36, 39], // Convert HEX #a92427 to RGB (169, 36, 39)
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
      },
      // Use autoTable(doc, {}) instead of doc.autoTable({})
      head: [tableData[0]], // Table Header
      body: tableData.slice(1), // Table Data
    });
    doc.save("incoming_stock_table_data.pdf");
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i> Incoming Stock
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 formcontent`}>
          <label htmlFor="">From :</label>
          <input type="date" />
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">To :</label>
          <input type="date" />
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">WareHouse :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Warehouse 1</option>
            <option value="">Warehouse 2</option>
            <option value="">Warehouse 3</option>
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Product 1</option>
            <option value="">Product 2</option>
            <option value="">Product 3</option>
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-4">
          <button className="submitbtn" onClick={() => setonsubmit(true)}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/inventory")}>
            Cancel
          </button>
        </div>
      </div>

      {onsubmit && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-8">
            <button className={styles.xls} onClick={exportToExcel}>
              <p>Export to </p>
              <img src={xls} alt="" />
            </button>
            <button className={styles.xls} onClick={exportToPDF}>
              <p>Export to </p>
              <img src={pdf} alt="" />
            </button>
          </div>
          <div className="col-lg-8">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>PO ID</th>
                  <th>Warehouse ID</th>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>3423</td>
                  <td>#4545</td>
                  <td>3</td>
                  <td>2000</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>3423</td>
                  <td>#4545</td>
                  <td>3</td>
                  <td>2000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default IncomingStock;
