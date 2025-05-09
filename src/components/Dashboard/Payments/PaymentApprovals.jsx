import React, { useEffect, useState } from "react";
import styles from "./Payments.module.css";
import ApprovalsViewModal from "./ApprovalsViewModal";
import { IoSearch } from "react-icons/io5";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { useAuth } from "@/Auth";

function PaymentApprovals({ navigate }) {
  const { axiosAPI } = useAuth();

  const [reports, setReports] = useState();

  const [trigger, setTrigger] = useState(false);

  const changeTrigger = () => setTrigger(!trigger);

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // const onSubmit = () => {
  //   // console.log(from, to, warehouse, customer);
  //   setTrigger(trigger ? false : true);
  // };

  useEffect(() => {
    setReports(null);
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/payment-requests?status=Pending");
        console.log(res);
        setReports(res.data.paymentRequests);
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

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/payments")}>Payments</span>{" "}
        <i class="bi bi-chevron-right"></i> Payment-approvals
      </p>

      {reports && (
        <>
          <div className="row m-0 p-3 pt-5 justify-content-end">
            <div className={`col-4 ${styles.search}`}>
              <input type="text" placeholder="Search..." />
              <span className={styles.searchicon}>
                <IoSearch />
              </span>
            </div>
          </div>

          <div className="row m-0 p-3 justify-content-center">
            <div className="col-lg-10">
              <table className={`table table-bordered borderedtable`}>
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
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={8}>NO DATA FOUND</td>
                    </tr>
                  )}
                  {reports.length > 0 &&
                    reports.map((report) => (
                      <tr
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
                          <ApprovalsViewModal report={report} changeTrigger={changeTrigger} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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
