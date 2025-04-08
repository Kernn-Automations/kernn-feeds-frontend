import React, { useState } from "react";
import styles from "./Sales.module.css";
import DispachViewModal from "./DispachViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function Dispaches({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  const tableData = [
    [
      "S.No",
      "Date",
      "Order ID",
      "Warehouse ID",
      "Customer ID",
      "Dispatch Date",
      "Truck No.",
    ],
    ["1", "2025-02-28", "KM20", "4420", "2323", "2025-02-28", "AP-12-DF-2022"],
    ["2", "2025-02-28", "KM20", "4423", "2324", "2025-02-28", "AP-12-DF-2023"],
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
    saveAs(excelFile, "dispatches_table_data.xlsx");
  };

  // Function to export as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold"); // Set font style
    doc.setFontSize(16); // Set font size for title
    doc.text("Dispatches", 14, 10); // Title text with position (X: 14, Y: 10)

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
    doc.save("dispatches_table_data.pdf");
  };

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/sales")}>Sales</span>{" "}
        <i class="bi bi-chevron-right"></i> Dispatches
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
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Customer :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Customer 1</option>
            <option value="">Customer 2</option>
            <option value="">Customer 3</option>
          </select>
        </div>

        <div className={`col-3 formcontent`}>
          <button className="submitbtn" onClick={() => setonsubmit(true)}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/sales")}>
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
                  <th>Order ID</th>
                  <th>Warehouse ID</th>
                  <th>Customer ID</th>
                  <th>Dispach Date</th>
                  <th>Truck No.</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="animated-row"
                        style={{ animationDelay: `${index++ * 0.1}s` }}>
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>4420</td>
                  <td>2323</td>
                  <td>2025-02-28</td>
                  <td>AP-12-DF-2022</td>
                  <td>
                    <DispachViewModal />
                  </td>
                </tr>
                <tr className="animated-row"
                        style={{ animationDelay: `${index++ * 0.1}s` }}>
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM23</td>
                  <td>4423</td>
                  <td>2324</td>
                  <td>2025-02-28</td>
                  <td>AP-12-DF-2023</td>
                  <td>
                    <DispachViewModal />
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

export default Dispaches;
