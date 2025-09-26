import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import React, { useEffect, useState } from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import styles from "./../Reports.module.css";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import xls from "@/images/xls-png.png";
import pdf from "@/images/pdf-png.png";

function EmployeeSaleReport({ navigate }) {
  const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { axiosAPI } = useAuth();

  const [from, setFrom] = useState(date);
  const [to, setTo] = useState(today);
  const [filter, setFilter] = useState("division");

  const [reports, setReports] = useState();
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        setReports(null);
        const query = `/reports/employees/sales?fromDate=${from}&toDate=${to}&groupBy=${filter}`;
        console.log(query);
        const res = await axiosAPI.get(query);
        setReports(res.data.data);
        console.log(res);
      } catch (e) {
        console.log(e);
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [from, to, filter]);

  const [tableData, setTableData] = useState();

  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = [
      "S.No",
      "Particulars",
      "Quantity",
      "Alt Quantity(Tonnes)",
      "Amount",
    ];

    if (reports && reports.length > 0) {
      reports.map((report) =>
        arr.push({
          "S.No": x++,
          Particulars: report.particulars,
          Quantity: report.qty,
          "Alt Quantity(Tonnes)": report.altQty,
          Amount: report.value,
        })
      );
      setTableData(arr);

      if (type === "PDF") handleExportPDF(columns, tableData, "Employee-Sales-report");
      else if (type === "XLS")
        handleExportExcel(columns, tableData, "Employee-Sales-Report");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i class="bi bi-chevron-right"></i>
        <span onClick={() => navigate("/reports/Employee-Reports")}>
          {" "}
          Employee-Reports
        </span>{" "}
        <i class="bi bi-chevron-right"></i> Employee Sales Reports
      </p>

      <div className="row m-0 p-3">
        <div className={`col-4 formcontent`}>
          <label htmlFor="">From :</label>
          <input
            type="date"
            name=""
            id=""
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className={`col-4 formcontent`}>
          <label htmlFor="">To :</label>
          <input
            type="date"
            name=""
            id=""
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className={`col-4 formcontent`}>
          <label htmlFor="">Filters :</label>
          <select name="" id="" onChange={(e) => setFilter(e.target.value)}>
            <option value="division">Divisions</option>
            <option value="zone">Zones</option>
            <option value="subzone">Sub Zones</option>
            <option value="team">Teams</option>
            <option value="employee">Employees</option>
          </select>
        </div>
      </div>

      {reports && (
        <>
          <div className="row m-0 p-3 pb-0 justify-content-around">
            <div className="col-lg-4">
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
                onChange={(e) => setLimit(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="row m-0 p-3 justify-content-around">
            <div className="col-lg-8">
              <table className={`table table-bordered borderedtable`}>
                <thead>
                  <tr
                    className="animated-row"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <th>S.No</th>
                    <th>Particulars</th>
                    <th>Quantity</th>
                    <th>Alt Quantity(Tonnes)</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td colSpan={5}>NO DATA FOUND</td>
                    </tr>
                  )}

                  {reports.map((report) => (
                    <tr
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{report.particulars}</td>
                      <td>{report.qty}</td>
                      <td>{Number(report.altQty)?.toFixed(2)}</td>
                      <td>{report.value}</td>
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
        </>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default EmployeeSaleReport;
