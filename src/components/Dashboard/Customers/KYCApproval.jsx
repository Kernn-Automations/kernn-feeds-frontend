import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";
import { IoSearch } from "react-icons/io5";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import KYCModal from "./KYCModal";

function KYCApproval({ navigate, isAdmin }) {
  const { axiosAPI } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [trigger, setTrigger] = useState(false);

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const changeTrigger = () => setTrigger((prev) => !prev);

  useEffect(() => {
    async function fetchPendingKYC() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/customers?kycStatus=Pending");
        setCustomers(res.data.customers || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch data.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingKYC();
  }, [trigger]);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

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
            <div className="col-10">
              <table className="table table-bordered borderedtable">
                <thead>
                  <tr className="animated-row" style={{ animationDelay: `${count * 0.1}s` }}>
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
                  {filteredCustomers.length === 0 && (
                    <tr className="animated-row">
                      <td colSpan={7}>NO DATA FOUND</td>
                    </tr>
                  )}
                  {filteredCustomers.map((customer) => (
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
