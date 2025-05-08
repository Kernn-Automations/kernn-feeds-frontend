import React, { useEffect, useState } from "react";
import styles from "./Inventory.module.css";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";

function OutgoingStock({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);
  const [warehouses, setWarehouses] = useState();
  const [products, setProducts] = useState();
  const [customers, setCustomers] = useState();

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
        const res2 = await axiosAPI.get("/customers");
        const res3 = await axiosAPI.get("/products/list");
        console.log(res1);
        console.log(res2);
        console.log(res3);
        setWarehouses(res1.data.warehouses);
        setCustomers(res2.data.customers);
        setProducts(res3.data.products);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, []);

  // Backend

  const [stock, setStock] = useState();

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [warehouse, setWarehouse] = useState();
  const [customer, setCustomer] = useState();
  const [product, setProduct] = useState();
  const [trigger, setTrigger] = useState(false);

  const onSubmit = () => {
    setTrigger(trigger ? false : true);
  };

  useEffect(() => {
    async function fetch() {
      try {
        setStock(null);
        setLoading(true);
        console.log(
          `/warehouse/inventory/outgoing?fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerId=${customer}` : ""}${
            product ? `&customerId=${customer}` : ""
          }`
        );
        const res = await axiosAPI.get(
          `/warehouse/inventory/outgoing?fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerId=${customer}` : ""}${
            product ? `&productId=${product}` : ""
          }`
        );
        console.log(res);
        setStock(res.data.outgoingStock);
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

  // // Function to export as PDF
  // const exportToPDF = () => {
  //   const doc = new jsPDF();

  //   doc.setFont("helvetica", "bold"); // Set font style
  //   doc.setFontSize(16); // Set font size for title
  //   doc.text("Incoming Stock", 14, 10); // Title text with position (X: 14, Y: 10)

  //   autoTable(doc, {
  //     headStyles: {
  //       fillColor: [169, 36, 39], // Convert HEX #a92427 to RGB (169, 36, 39)
  //       textColor: [255, 255, 255], // White text
  //       fontStyle: "bold",
  //     },
  //     // Use autoTable(doc, {}) instead of doc.autoTable({})
  //     head: [tableData[0]], // Table Header
  //     body: tableData.slice(1), // Table Data
  //   });
  //   doc.save("incoming_stock_table_data.pdf");
  // };

  const [tableData, setTableData] = useState();

  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = [
      "S.No",
      "Date",
      "Order ID",
      "Warehouse Name",
      "Product Name",
      "SKU",
      "Customer Name",
      "Quantity",
      "Amount",
    ];
    if (stock && stock.length > 0) {
      stock.map((st) =>
        arr.push({
          "S.No": x++,
          Date: st.date.slice(0, 10),
          "Order ID": st.orderNumber,
          "Warehouse Name": st.warehouseName,
          "Product Name": st.productName,
          "SKU": st.sku,
          "Customer Name": st.customerName,
          Quantity: st.quantity,
          Amount: st.totalAmount,
        })
      );
      setTableData(arr);

      if (type === "PDF") handleExportPDF(columns, tableData, "Outgoing-Stock");
      else if (type === "XLS")
        handleExportExcel(columns, tableData, "Outgoing-Stock");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i> Outgoing Stock
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
          <select name="" id="" onChange={(e) => setWarehouse(e.target.value === "null" ? null : e.target.value)}>
            <option value="null">--select--</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option value={warehouse.id}>{warehouse.name}</option>
              ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select name="" id="" onChange={(e) => setProduct(e.target.value === "null" ? null : e.target.value)}>
            <option value="null">--select--</option>
            {products &&
              products.map((product) => (
                <option value={product.id}>{product.name}</option>
              ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Customers :</label>
          <select name="" id="" onChange={(e) => setCustomer(e.target.value === "null" ? null : e.target.value)}>
            <option value="null">--select--</option>
            {customers &&
              customers.map((customer) => (
                <option value={customer.id}>{customer.name}</option>
              ))}
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 pb-5 justify-content-center">
        <div className="col-4">
          <button className="submitbtn" onClick={onSubmit}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate("/inventory")}>
            Cancel
          </button>
        </div>
      </div>

      {stock && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-10">
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
                <tr className="animated-row"
                  style={{ animationDelay: `${index * 0.1}s` }}>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Warehouse Name</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Customer Name</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
              {stock.length === 0 && (
                  <tr>
                    <td colSpan={9}>NO DATA FOUND</td>
                  </tr>
                )}
                {stock.length > 1 &&
                  stock.map((st) => (
                    <tr
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{st.date.slice(0, 10)}</td>
                      <td>{st.orderNumber}</td>
                      <td>{st.warehouseName}</td>
                      <td>{st.productName}</td>
                      <td>{st.sku}</td>
                      <td>{st.customerName}</td>
                      <td>{st.quantity}</td>
                      <td>{st.totalAmount}</td>
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

export default OutgoingStock;
