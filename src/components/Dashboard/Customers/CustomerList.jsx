import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";
import { IoSearch } from "react-icons/io5";
import CustomersViewModal from "./CustomersViewModal";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function CustomerList({ navigate }) {
  const [customers, setCustomers] = useState();
  const [warehouses, setWarehouses] = useState();
  const [ses, setSes] = useState();

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
        setLoading(true);
        const res = await axiosAPI.get("/customers");
        const res2 = await axiosAPI.get("/warehouse");
        console.log(res);
        setCustomers(res.data.customers);
        setWarehouses(res2.data.warehouses);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  let count = 1;

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/customers")}>Customers</span>{" "}
        <i class="bi bi-chevron-right"></i> Customer-list
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 formcontent`}>
          <label htmlFor="">WareHouse :</label>
          <select name="" id="">
            <option value={null}>--select--</option>
            {warehouses && warehouses.map((warehouse) => <option value={warehouse.id}>{warehouse.name}</option>)}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Sales Executive :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Executive 1</option>
            <option value="">Executive 2</option>
            <option value="">Executive 3</option>
          </select>
        </div>
      </div>

      {customers && (
        <>
          <div className="row m-0 p-3 justify-content-end">
            <div className={`col-md-5 ${styles.search}`}>
              <input type="text" placeholder="Search..." />
              <span className={styles.searchicon}>
                <IoSearch />
              </span>
            </div>
          </div>
          <div className="row m-0 p-3 justify-content-center">
            <div className="col-md-10">
              <table className={`table table-bordered borderedtable`}>
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
                  {customers.length === 0 && (
                    <tr
                      className="animated-row"
                      style={{ animationDelay: `${count * 0.1}s` }}
                    >
                      <td colSpan={7}>NO DATA FOUND</td>
                    </tr>
                  )}
                  {customers.length > 1 &&
                    customers.map((customer) => (
                      <tr
                        className="animated-row"
                        style={{ animationDelay: `${count * 0.1}s` }}
                      >
                        <td>{count++}</td>
                        <td>{customer.customer_id}</td>
                        <td>{customer.name}</td>
                        <td>{customer.salesExecutive.id}</td>
                        <td>{customer.salesExecutive.name}</td>
                        <td>{customer.warehouse && customer.warehouse.name}</td>
                        <td>
                          <CustomersViewModal customer={customer} />
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

export default CustomerList;
