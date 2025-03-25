import React, { useState } from "react";
import styles from "./Purchases.module.css";
import ReportViewModal from "./ReportViewModal";
import xls from "./../../../images/xls-png.png"
import pdf from "./../../../images/pdf-png.png"
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function PurchaseReport({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  const tableData = [
      [
        "S.No",
        "Date",
        "Purchase ID",
        "Warehouse",
        "Net Amount",
      ],
      ["1", "2025-02-28", "KM20", "Warehouse 1", "2000",],
      ["2", "2025-02-28", "KM20", "Warehouse 2", "2000", ],
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
      saveAs(excelFile, "purchase_report_table_data.xlsx");
    };
  
    // Function to export as PDF
    const exportToPDF = () => {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold"); // Set font style
    doc.setFontSize(16); // Set font size for title
    doc.text("Purchase Report", 14, 10); // Title text with position (X: 14, Y: 10)

      autoTable(doc, {
        headStyles: {
          fillColor: [169, 36, 39], // Convert HEX #a92427 to RGB (169, 36, 39)
          textColor: [255, 255, 255], // White text
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: {
          textColor: [0, 0, 0], // Black text
          fontSize: 10, // Reduce body font size
        },
        // Use autoTable(doc, {}) instead of doc.autoTable({})
        head: [tableData[0]], // Table Header
        body: tableData.slice(1), // Table Data
      });
      doc.save("purchase_report_table_data.pdf");
    };
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/purchases")}>Purchase</span>{" "}
        <i class="bi bi-chevron-right"></i> Purchase order Report
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
        <div className={`col-3`}>
          <button className="submitbtn" onClick={() => setonsubmit(true)}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/purchases")}>
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
                <tr>
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 1</td>
                  <td>2000</td>
                  <td>
                    <ReportViewModal />
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 2</td>
                  <td>2000</td>
                  <td>
                    <ReportViewModal />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default PurchaseReport;
