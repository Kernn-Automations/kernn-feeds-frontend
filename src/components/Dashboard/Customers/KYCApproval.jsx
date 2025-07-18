import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";
import { IoSearch } from "react-icons/io5";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import KYCModal from "./KYCModal";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

function KYCApproval({ navigate, isAdmin }) {
  const { axiosAPI } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [trigger, setTrigger] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const changeTrigger = () => setTrigger((prev) => !prev);

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch customers based on search term or default KYC Pending
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        setCustomers([]);
        const query =
          searchTerm.trim().length >= 3
            ? `/customers/search?customerName=${searchTerm.trim()}&kycStatus=Pending`
            : `/customers?kycStatus=Pending&page=${pageNo}&limit=${limit}`;

        const res = await axiosAPI.get(query);
        console.log(res)
        setCustomers(res.data.customers);
        setTotalPages(res.data?.totalPages || 1);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch data.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [trigger, pageNo, limit, searchTerm]);

  let count = 1;

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/customers")}>Customers</span>{" "}
        <i className="bi bi-chevron-right"></i> KYC-Approvals
      </p>

      {!customerId && (
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
            <div className={`col-lg-10 ${styles.entity}`}>
              <label>Entity:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPageNo(1); // reset to page 1 on limit change
                }}
              >
                {[10, 20, 30, 40, 50].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-10">
              <table className="table table-bordered borderedtable">
                <thead>
                  <tr className="animated-row">
                    <th>S.No</th>
                    <th>Customer ID</th>
                    <th>Customer Name</th>
                    <th>SE ID</th>
                    <th>SE Name</th>
                    <th>Warehouse</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 && (
                    <tr className="animated-row">
                      <td colSpan={7}>NO DATA FOUND</td>
                    </tr>
                  )}
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="animated-row"
                      style={{ animationDelay: `${count * 0.1}s` }}
                    >
                      <td>{count++}</td>
                      <td>{customer.customer_id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.salesExecutive?.id}</td>
                      <td>{customer.salesExecutive?.name}</td>
                      <td>{customer.warehouse?.name}</td>
                      <td>
                        <button onClick={() => setCustomerId(customer.id)}>
                          view
                        </button>
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

      {customerId && (
        <KYCModal
          customerId={customerId}
          setCustomerId={setCustomerId}
          isAdmin={isAdmin}
          changeTrigger={changeTrigger}
        />
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-10 pt-5">
            <Loading />
          </div>
        </div>
      )}
    </>
  );
}

export default KYCApproval;
