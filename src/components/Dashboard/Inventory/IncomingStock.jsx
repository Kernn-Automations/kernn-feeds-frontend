import React, { useEffect, useState } from "react";
import styles from "./Inventory.module.css";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
function IncomingStock({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);
  const [warehouses, setWarehouses] = useState();
  const [products, setProducts] = useState();
  const [customers, setCustomers] = useState();

  const { axiosAPI } = useAuth();
  const { selectedDivision } = useDivision();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        // ✅ Get division ID from context for division filtering
        const currentDivisionId = selectedDivision?.id;

        // ✅ Add division parameters to prevent wrong division data
        let warehouseEndpoint = "/warehouse";
        let customersEndpoint = "/customers";
        let productsEndpoint = "/products/list";

        if (currentDivisionId) {
          warehouseEndpoint += `?divisionId=${currentDivisionId}`;
          customersEndpoint += `?divisionId=${currentDivisionId}`;
          productsEndpoint += `?divisionId=${currentDivisionId}`;
        }

        console.log('IncomingStock - Initial data fetch with division parameters:');
        console.log('IncomingStock - Division ID:', currentDivisionId);
        console.log('IncomingStock - Warehouse endpoint:', warehouseEndpoint);
        console.log('IncomingStock - Customers endpoint:', customersEndpoint);
        console.log('IncomingStock - Products endpoint:', productsEndpoint);

        const res1 = await axiosAPI.get(warehouseEndpoint);
        const res2 = await axiosAPI.get(customersEndpoint);
        const res3 = await axiosAPI.get(productsEndpoint);
        // console.log(res1);
        // console.log(res2);
        // console.log(res3);
        setWarehouses(res1.data.warehouses);
        setCustomers(res2.data.customers);
        setProducts(res3.data.products);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, [selectedDivision?.id]);

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

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetch() {
      try {
        setStock(null);
        setLoading(true);

        // ✅ Get division ID from context for division filtering
        const currentDivisionId = selectedDivision?.id;

        // ✅ Handle "All Warehouses" option - don't send warehouseId parameter
        let warehouseParam = "";
        if (warehouse && warehouse !== "all") {
          warehouseParam = `&warehouseId=${warehouse}`;
        }

        // ✅ Add division parameters to prevent wrong division data
        let divisionParam = "";
        if (currentDivisionId) {
          divisionParam = `&divisionId=${currentDivisionId}`;
        }

        const query = `/warehouse/inventory/incoming?fromDate=${from}&toDate=${to}${warehouseParam}${
          customer ? `&customerId=${customer}` : ""
        }${
          product ? `&productId=${product}` : ""
        }${divisionParam}&page=${pageNo}&limit=${limit}`;

        console.log('IncomingStock - Fetching stock with warehouse filter:', warehouse);
        console.log('IncomingStock - Warehouse parameter:', warehouseParam);
        console.log('IncomingStock - Division ID:', currentDivisionId);
        console.log('IncomingStock - Division parameter:', divisionParam);
        console.log('IncomingStock - Final query:', query);

        const res = await axiosAPI.get(query);
        console.log(res);
        setStock(res.data.incomingStock);
        setTotalPages(res.data.totalPages)
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger, pageNo, limit, selectedDivision?.id]);

  // Function to export as Excel

  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = [
      "S.No",
      "Date",
      "PO ID",
      "Warehouse Name",
      "Product Name",
      "Quantity",
      "Amount",
    ];
    if (stock && stock.length > 0) {
      stock.map((st) =>
        arr.push({
          "S.No": x++,
          Date: st.date.slice(0, 10),
          "PO ID": st.purchaseOrderId,
          "Warehouse Name": st.warehouseName,
          "Product Name": st.productName,
          Quantity: st.quantity,
          Amount: st.totalAmount,
        })
      );
      setTableData(arr);

      if (type === "PDF") handleExportPDF(columns, tableData, "Incoming_Stock");
      else if (type === "XLS")
        handleExportExcel(columns, tableData, "IncomingStock");
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
        <i class="bi bi-chevron-right"></i> Incoming Stock
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
            onChange={(e) =>
              setWarehouse(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            <option value="all">All Warehouses</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select
            name=""
            id=""
            onChange={(e) =>
              setProduct(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {products &&
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
          </select>
        </div>
        {/* <div className={`col-3 formcontent`}>
          <label htmlFor="">Customers :</label>
          <select name="" id="" onChange={(e) => setCustomer(e.target.value === "null" ? null : e.target.value)}>
            <option value="null">--select--</option>
            {customers &&
              customers.map((customer) => (
                <option value={customer.id}>{customer.name}</option>
              ))}
          </select>
        </div> */}
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
        <div className="row m-0 p-3 justify-content-around">
          <div className="col-lg-5">
            <button className={styles.xls} onClick={() => onExport("XLS")}>
              <p>Export to </p>
              <img src={xls} alt="" />
            </button>
            <button className={styles.xls} onClick={() => onExport("PDF")}>
              <p>Export to </p>
              <img src={pdf} alt="" />
            </button>
          </div>
          <div className={`col-lg-3 ${styles.entity}`}>
            <label htmlFor="">Entity :</label>
            <select
              name=""
              id=""
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="col-lg-9">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>PO ID</th>
                  <th>Warehouse Name</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stock.length === 0 && (
                  <tr>
                    <td colSpan={7}>NO DATA FOUND</td>
                  </tr>
                )}
                {stock.length > 0 &&
                  stock.map((st, stIndex) => (
                    <tr
                      key={st.id}
                      className="animated-row"
                      style={{ animationDelay: `${stIndex * 0.1}s` }}
                    >
                      <td>{index + stIndex}</td>
                      <td>{st.date.slice(0, 10)}</td>
                      <td>{st.purchaseOrderId}</td>
                      <td>{st.warehouseName}</td>
                      <td>{st.productName}</td>
                      <td>{st.quantity}</td>
                      <td>{st.totalAmount}</td>
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

      {loading && <Loading />}
    </>
  );
}

export default IncomingStock;
