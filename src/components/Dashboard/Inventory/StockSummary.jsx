import React, { useEffect, useState } from "react";
import styles from "./Inventory.module.css";

import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";

function StockSummary({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  const [warehouses, setWarehouses] = useState();

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axiosAPI.get("/warehouse");
        console.log(res);
        setWarehouses(res.data.warehouses);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, []);

  const tableData = [
    [
      "S.No",
      "Date",
      "Warehouse ID",
      "Warehouse Name",
      "Product ID",
      "Product Name",
      "Quantity",
    ],
    ["1", "2025-02-28", "KM20", "Warehouse 1", "#4545", "Product 1", "3"],
    ["2", "2025-02-28", "KM20", "Warehouse 2", "#4545", "Product 2", "3"],
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
    saveAs(excelFile, "table_data.xlsx");
  };

  // Function to export as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold"); // Set font style
    doc.setFontSize(16); // Set font size for title
    doc.text("Stock Summary", 14, 10); // Title text with position (X: 14, Y: 10)

    autoTable(doc, {
      headStyles: {
        fillColor: [169, 36, 39], // Convert HEX #a92427 to RGB (169, 36, 39)
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: [0, 0, 0], // Black text
        fontSize: 8, // Reduce body font size
      },
      // Use autoTable(doc, {}) instead of doc.autoTable({})
      head: [tableData[0]], // Table Header
      body: tableData.slice(1), // Table Data
    });
    doc.save("stock_summary_table_data.pdf");
  };

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i>Stock Summary
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Date :</label>
          <input type="date" />
        </div>

        <div className={`col-3 formcontent`}>
          <label htmlFor="">WareHouse :</label>
          <select name="" id="">
            <option value="">--select--</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option value={warehouse.id}>{warehouse.name}</option>
              ))}
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
        <div className="col-3 formcontent">
          <button className="submitbtn" onClick={() => setonsubmit(true)}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/inventory")}>
            Cancel
          </button>
        </div>
      </div>

      <div className="row m-0 p-3 justify-content-center"></div>

      {onsubmit && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-8">
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
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Warehouse ID</th>
                  <th>Warehouse Name</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className="animated-row"
                  style={{ animationDelay: `${index++ * 0.1}s` }}
                >
                  <td>1</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 1</td>
                  <td>#4545</td>
                  <td>Product 1</td>
                  <td>3</td>
                </tr>
                <tr
                  className="animated-row"
                  style={{ animationDelay: `${index++ * 0.1}s` }}
                >
                  <td>2</td>
                  <td>2025-02-28</td>
                  <td>KM20</td>
                  <td>Warehouse 2</td>
                  <td>#4545</td>
                  <td>Product 2</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default StockSummary;
