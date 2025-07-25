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
        const res1 = await axiosAPI.get("/warehouse");
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

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetch() {
      try {
        setPurchases(null);
        setLoading(true);

        const query = `/purchases?fromDate=${from}&toDate=${to}${
          warehouse ? `&warehouseId=${warehouse}` : ""
        }&page=${pageNo}&limit=${limit}`;

        console.log(query);

        const res = await axiosAPI.get(query);
        console.log(res);
        setPurchases(res.data.purchaseOrders);
        setTotalPages(res.data.totalPages);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger, pageNo, limit]);

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
              onChange={(e) => setLimit(e.target.value)}
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
                  {/* <th>Net Amount</th> */}
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
                      key={order.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{order.date}</td>
                      <td>{order.ordernumer}</td>
                      <td>{order.warehouse.name}</td>
                      {/* <td>{order.totalAmount !== undefined && order.totalAmount !== null ? order.totalAmount : "—"}</td> */}
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
