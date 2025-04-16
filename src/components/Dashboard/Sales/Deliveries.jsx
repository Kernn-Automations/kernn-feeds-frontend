import React, { useEffect, useState } from "react";
import styles from "./Sales.module.css";
import DeliveryViewModal from "./DeliveryViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import deliverAni from "../../../images/animations/delivered_primary.gif"
import { useAuth } from "@/Auth";
import LoadingAnimation from "@/components/LoadingAnimation";


function Deliveries({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  const tableData = [
    [
      "S.No",
      "Date",
      "Order ID",
      "Warehouse ID",
      "Customer ID",
      "Dispatch Date",
      "Delivery Date",
    ],
    ["1", "2025-02-28", "KM20", "4420", "2323", "2025-02-20", "2025-02-28"],
    ["2", "2025-02-28", "KM20", "4423", "2324", "2025-02-24", "2025-02-26"],
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
    saveAs(excelFile, "deliveries_table_data.xlsx");
  };

  let index = 1;

  // Function to export as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold"); // Set font style
    doc.setFontSize(16); // Set font size for title
    doc.text("Deliveries", 14, 10); // Title text with position (X: 14, Y: 10)

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
    doc.save("deliveries_table_data.pdf");
  };

  // backend --------------------------
    const [orders, setOrders] = useState();
  
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
          setLoading(true);
          const res = await axiosAPI.get(
            "/sales-orders?status=Delivered"
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
    }, []);

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/sales")}>Sales</span>{" "}
        <i class="bi bi-chevron-right"></i> Deliveries
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

      {orders && (
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
                  <th>Warehouse Name</th>
                  <th>Customer ID</th>
                  <th>Dispach Date</th>
                  <th>Dilivered Date</th>
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
                      <td>{order.dispatchDate && order.dispatchDate.slice(0,10)}</td>
                      <td>{order.deliveredDate && order.deliveredDate.slice(0,10)}</td>
                      <td>
                        <DeliveryViewModal order={order} />
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
      
            {loading && <LoadingAnimation gif={deliverAni} />}
    </>
  );
}

export default Deliveries;
