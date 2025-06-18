import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";
import { IoSearch } from "react-icons/io5";
import CustomersModal from "./CustomersModal";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

function CustomerList({ navigate, isAdmin }) {
  const { axiosAPI } = useAuth();

  const [customers, setCustomers] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [salesExecutives, setSalesExecutives] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [se, setSe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fetch sales executives and warehouses
  useEffect(() => {
    async function fetchMeta() {
      try {
        setLoading(true);
        const res1 = await axiosAPI.get("/employees/role/Business Officer");
        const res2 = await axiosAPI.get("/warehouse");
        setSalesExecutives(res1.data.employees);
        setWarehouses(res2.data.warehouses);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch metadata.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMeta();
  }, []);

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch customers on filter change
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setCustomers(null);
        setFilteredCustomers(null)
        setLoading(true);
        const query = `/customers?kycStatus=Approved${
          warehouse ? `&warehouseId=${warehouse}` : ""
        }${se ? `&salesExecutiveId=${se}` : ""}&page=${pageNo}&limit=${limit}`;

        console.log(query);

        const res = await axiosAPI.get(query);
        console.log(res);
        setCustomers(res.data.customers);
        setTotalPages(res.data.totalPages);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch customers.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, [warehouse, se, pageNo, limit]);

  // Filter customers on search
  useEffect(() => {
    const filtered = customers?.filter((customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  let count = 1;

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/customers")}>Customers</span>{" "}
        <i className="bi bi-chevron-right"></i> Customer-list
      </p>

      {!customerId && (
        <div className="row m-0 p-3">
          <div className="col-3 formcontent">
            <label>WareHouse:</label>
            <select
              value={warehouse ?? "null"}
              onChange={(e) =>
                setWarehouse(e.target.value === "null" ? null : e.target.value)
              }
            >
              <option value="null">--select--</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-3 formcontent">
            <label>Sales Executive:</label>
            <select
              value={se ?? "null"}
              onChange={(e) =>
                setSe(e.target.value === "null" ? null : e.target.value)
              }
            >
              <option value="null">--select--</option>
              {salesExecutives.map((se) => (
                <option key={se.id} value={se.id}>
                  {se.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!customerId && filteredCustomers && (
        <>
          <div className="row m-0 p-3 justify-content-end">
            <div className={`col-md-5 ${styles.search}`}>
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

          {filteredCustomers && (
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

              <div className="col-md-10">
                <table className="table table-bordered borderedtable">
                  <thead>
                    <tr>
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
        </>
      )}

      {customerId && (
        <CustomersModal
          customerId={customerId}
          setCustomerId={setCustomerId}
          isAdmin={isAdmin}
        />
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default CustomerList;
