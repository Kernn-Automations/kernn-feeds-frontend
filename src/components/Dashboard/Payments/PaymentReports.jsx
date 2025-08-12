import React, { useEffect, useState } from "react";
import styles from "./Payments.module.css";
import ReportsViewModal from "./ReportsViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { useAuth } from "@/Auth";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";

function PaymentReports({ navigate }) {
  const [onsubmit, setonsubmit] = useState(false);

  const { axiosAPI } = useAuth();

  const [reports, setReports] = useState();

  const [warehouses, setWarehouses] = useState();
  const [customers, setCustomers] = useState();
  const [ses, setSes] = useState();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [trigger, setTrigger] = useState(false);

  const onSubmit = () => {
    console.log(from, to, warehouse, customer);
    setTrigger(trigger ? false : true);
  };

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res1 = await axiosAPI.get("/warehouse");
        const res2 = await axiosAPI.get("/customers");
        const res3 = await axiosAPI.get("/employees/role/Business Officer");
        // console.log(res1);
        // console.log(res2);
        // console.log(res3);
        setWarehouses(res1.data.warehouses);
        setCustomers(res2.data.customers);
        setSes(res3.data.employees);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [warehouse, setWarehouse] = useState("");
  const [customer, setCustomer] = useState();
  const [se, setSe] = useState("");

  useEffect(() => {
    setReports(null);
    async function fetch() {
      try {
        // console.log(
        //   `/payment-requests?status=Approved&fromDate=${from}&toDate=${to}${
        //     warehouse ? `&warehouseId=${warehouse}` : ""
        //   }${customer ? `&customerTd=${customer}` : ""}${
        //     se ? `&salesExecutiveId=${se}` : ""
        //   }`
        // );
        setLoading(true);
        const res = await axiosAPI.get(
          `/payment-requests?status=Approved&fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerTd=${customer}` : ""}${
            se ? `&salesExecutiveId=${se}` : ""
          }`
        );
        console.log(res);
        setReports(res.data.paymentRequests);
      } catch (e) {
        // console.log(e);
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
    const columns = [
      "S.No",
      "Date",
      "Order ID",
      "Customer Name",
      "SE ID",
      "Warehouse Name",
      "Net Amount",
    ];
    if (reports && reports.length > 0) {
      reports.map((report) =>
        arr.push({
          "S.No": x++,
          Date: report.transactionDate,
          "Order ID": report.order.orderNumber,
          "Customer Name": report.order.customer.name,
          "SE ID": report.order.salesExecutive.id,
          "Warehouse Name": report.order.warehouse.name,
          "Net Amount": "na",
        })
      );
      setTableData(arr);

      if (type === "PDF")
        handleExportPDF(columns, tableData, "Payment-Reports");
      else if (type === "XLS")
        handleExportExcel(columns, tableData, "Payment-Reports");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/payments")}>Payments</span>{" "}
        <i class="bi bi-chevron-right"></i> Payment-Reports
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
            value={warehouse || ""}
            onChange={(e) =>
              setWarehouse(e.target.value === "null" ? "" : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option value={warehouse.id}>{warehouse.name}</option>
              ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Sales Executive :</label>
          <select
            name=""
            id=""
            value={se || ""}
            onChange={(e) =>
              setSe(e.target.value === "null" ? "" : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {ses && ses.map((se) => <option value={se.id}>{se.name}</option>)}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Customer :</label>
          <select
            name=""
            id=""
            value={customer}
            onChange={(e) =>
              setCustomer(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {customers &&
              customers.map((customer) => (
                <option value={customer.id}>{customer.name}</option>
              ))}
          </select>
        </div>
        {/* <div className={`col-3 formcontent`}>
          <label htmlFor="">Payment Mode :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Online</option>
            <option value="">Offline</option>
          </select>
        </div> */}
      </div>

      <div className="row m-0 p-2 justify-content-center">
        <div className={`col-3 formcontent`}>
          <button className="submitbtn" onClick={onSubmit}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>

      {reports && (
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
                <tr
                  className="animated-row"
                  style={{ animationDelay: `${index++ * 0.1}s` }}
                >
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>SE Name</th>
                  <th>Warehouse Name</th>
                  <th>Net Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={7}>NO DATA FOUND</td>
                  </tr>
                )}

                {reports.length > 0 &&
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      className="animated-row"
                      style={{ animationDelay: `${index++ * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{report.transactionDate}</td>
                      <td>{report.order?.orderNumber}</td>
                      <td>{report.order?.customer?.name}</td>
                      <td>{report.order?.salesExecutive?.name}</td>
                      <td>
                        {report.order.warehouse && report.order.warehouse?.name}
                      </td>
                      <td>{report.netAmount}</td>
                      <td>
                        <ReportsViewModal report={report} />
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

export default PaymentReports;
