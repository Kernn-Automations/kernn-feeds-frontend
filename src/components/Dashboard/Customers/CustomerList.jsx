import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";
import { IoSearch } from "react-icons/io5";
import CustomersModal from "./CustomersModal";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function CustomerList({ navigate, isAdmin }) {
  const { axiosAPI } = useAuth();

  const [customers, setCustomers] = useState([]);
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

  // Fetch customers on filter change
  useEffect(() => {
    async function fetchCustomers() {
      try {
        // setCustomers([]);
        setLoading(true);
        const query = `/customers?kycStatus=Approved${
          warehouse ? `&warehouseId=${warehouse}` : ""
        }${se ? `&salesExecutiveId=${se}` : ""}`;

        const res = await axiosAPI.get(query);
        setCustomers(res.data.customers || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch customers.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, [warehouse, se]);

  // Filter customers on search
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

      {!customerId && (
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
