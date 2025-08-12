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
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

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
        const res1 = await axiosAPI.get("/warehouses");
        // console.log(res1);
        setWarehouses(res1.data.warehouses);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, []);

  // Backend

  const [purchases, setPurchases] = useState();

  // Set default date range to last 6 months to get more records
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(sixMonthsAgo);
  const [to, setTo] = useState(today);
  const [trigger, setTrigger] = useState(false);
  const [warehouse, setWarehouse] = useState();

  const onSubmit = () => {
    console.log(from, to, warehouse, customer);
    setTrigger(trigger ? false : true);
  };

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Reset page number when limit changes
  useEffect(() => {
    setPageNo(1);
  }, [limit]);

  // Global refresh function for purchase orders
  const refreshPurchaseOrders = async () => {
    try {
      setPurchases(null);
      setLoading(true);

      // Build query with optional date filters
      let query = `/purchases`;
      const params = [];
      
      if (from && to) {
        params.push(`fromDate=${from}&toDate=${to}`);
      }
      
      if (warehouse && warehouse !== "null") {
        params.push(`warehouseId=${warehouse}`);
      }
      
      if (params.length > 0) {
        query += `?${params.join('&')}`;
      }

      console.log("Refreshing purchase orders...");
      console.log("API Query:", query);

      const res = await axiosAPI.get(query);
      console.log("Refresh - Full API Response:", res);
      console.log("Refresh - API purchaseOrders:", res.data.purchaseOrders);
      
      // Client-side pagination since backend is not respecting limit
      const allPurchases = res.data.purchaseOrders || [];
      const startIndex = (pageNo - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPurchases = allPurchases.slice(startIndex, endIndex);
      
      setPurchases(paginatedPurchases);
      console.log("✅ Purchase orders refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing purchase orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set global function for other components to use
  React.useEffect(() => {
    window.refreshPurchaseOrders = refreshPurchaseOrders;
    return () => {
      delete window.refreshPurchaseOrders;
    };
  }, [from, to, warehouse, pageNo, limit]);

  useEffect(() => {
    async function fetch() {
      try {
        setPurchases(null);
        setLoading(true);

        // Build query with optional date filters
        let query = `/purchases`;
        const params = [];
        
        if (from && to) {
          params.push(`fromDate=${from}&toDate=${to}`);
        }
        
        if (warehouse && warehouse !== "null") {
          params.push(`warehouseId=${warehouse}`);
        }
        
        if (params.length > 0) {
          query += `?${params.join('&')}`;
        }

        console.log("API Query:", query);
        console.log("Limit value:", limit, "Type:", typeof limit);
        console.log("Page number:", pageNo);

        const res = await axiosAPI.get(query);
        console.log("Full API Response:", res);
        console.log("API purchaseOrders:", res.data.purchaseOrders);
        console.log("Total Pages:", res.data.totalPages);
        console.log("Records returned:", res.data.purchaseOrders?.length || 0);
        
        // Client-side pagination since backend is not respecting limit
        const allPurchases = res.data.purchaseOrders || [];
        const startIndex = (pageNo - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPurchases = allPurchases.slice(startIndex, endIndex);
        
        setPurchases(paginatedPurchases);
        setTotalPages(Math.ceil(allPurchases.length / limit));
      } catch (e) {
        console.log("API Error:", e);
        setError(e.response?.data?.message || "An error occurred");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger, pageNo, limit, from, to, warehouse]);

  const [tableData, setTableData] = useState([]);

  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = ["S.No", "Date", "PO ID", "Warehouse Name", "Net Amount"];
    if (purchases && purchases.length > 0) {
      purchases.map((st) =>
        arr.push({
          "S.No": x++,
  Date: st.createdAt ? st.createdAt.slice(0, 10) : '',
  "PO ID": st.orderNumber || st.ordernumber || 'N/A',
  "Warehouse Name": st.warehouse || warehouses?.find(w => w.id === st.warehouseId)?.name || st.warehouseId || 'N/A',
  "Net Amount": st.totalAmount || "",
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
          <button className="btn btn-info ms-2" onClick={refreshPurchaseOrders}>
            Refresh
          </button>
        </div>
      </div>

      {purchases && (
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
          <div className={`col-lg-2 ${styles.entity}`}>
            <label htmlFor="">Entity :</label>
            <select
              name=""
              id=""
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="col-lg-10">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Purchase ID</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                  {/* <th>Net Amount</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 && (
                  <tr>
      <td colSpan={7}>NO DATA FOUND</td>
                  </tr>
                )}
                {purchases.length > 0 &&
                  purchases.map((order, index) => (
                    <tr
                      key={order.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index + 1}</td>
        <td>{order.createdAt ? order.createdAt.slice(0, 10) : ''}</td>
        <td>{order.orderNumber || order.ordernumber || 'N/A'}</td>
        <td>
          {order.warehouse || warehouses?.find(w => w.id === order.warehouseId)?.name || order.warehouseId || 'N/A'}
        </td>
        <td>
          <span className={`badge ${order.status === 'Received' ? 'bg-success' : 'bg-warning'}`}>
            {order.status === 'Received' ? 'Stocked In' : 'Pending'}
          </span>
        </td>
                      <td>
          <ReportViewModal order={order} warehouses={warehouses} setWarehouses={setWarehouses} />
                      </td>
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

export default PurchaseReport;