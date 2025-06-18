import React, { useEffect, useState } from "react";
import styles from "./Payments.module.css";
import ApprovalsViewModal from "./ApprovalsViewModal";
import { IoSearch } from "react-icons/io5";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { useAuth } from "@/Auth";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

function PaymentApprovals({ navigate }) {
  const { axiosAPI } = useAuth();

  const [reports, setReports] = useState();
  const [filteredReports, setFilteredReports] = useState();
  const [searchTerm, setSearchTerm] = useState("");

  const [trigger, setTrigger] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => setIsModalOpen(false);
  const changeTrigger = () => setTrigger(!trigger);

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        setReports(null);
        setFilteredReports(null);

        const query = `/payment-requests?status=Pending&page=${pageNo}&limit=${limit}`;

        console.log(query);

        const res = await axiosAPI.get(query);
        setReports(res.data.paymentRequests);
        setTotalPages(res.data.totalPages);
      } catch (e) {
        setError(e.response?.data?.message || "Something went wrong.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger, pageNo, limit]);

  // Filter by search term (customer name)
  useEffect(() => {
    const filtered = reports?.filter((r) =>
      r.order?.customer?.name
        ?.toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  let index = 1;

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/payments")}>Payments</span>{" "}
        <i className="bi bi-chevron-right"></i> Payment-approvals
      </p>

      {reports && filteredReports && (
        <>
          <div className="row m-0 p-3 pt-5 justify-content-end">
            <div className={`col-4 ${styles.search}`}>
              <input
                type="text"
                placeholder="Search by customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className={styles.searchicon}>
                <IoSearch />
              </span>
            </div>
          </div>

          <div className="row m-0 p-3 justify-content-center">
            <div className="row m-0 p-3 justify-content-center">
              <div className={`col-lg-10 ${styles.entity}`}>
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
            </div>
            <div className="col-lg-10">
              <table className="table table-bordered borderedtable">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>SE Name</th>
                    <th>Warehouse</th>
                    <th>Net Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={8}>NO DATA FOUND</td>
                    </tr>
                  )}
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{report.transactionDate}</td>
                      <td>{report.order?.orderNumber}</td>
                      <td>{report.order?.customer?.name}</td>
                      <td>{report.order?.salesExecutive?.name}</td>
                      <td>{report.order?.warehouse?.name}</td>
                      <td>{report.netAmount}</td>
                      <td>
                        <ApprovalsViewModal
                          report={report}
                          changeTrigger={changeTrigger}
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
        </>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default PaymentApprovals;
