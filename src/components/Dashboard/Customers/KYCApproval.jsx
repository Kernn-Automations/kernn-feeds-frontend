import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";
import KYCViewModal from "./KYCViewModal";
import { IoSearch } from "react-icons/io5";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import KYCModal from "./KYCModal";

function KYCApproval({ navigate }) {
  const [customers, setCustomers] = useState();

  const [trigger, setTrigger] = useState(false);

  const changeTrigger = () => setTrigger(!trigger);

  const [customerId, setCustomerId] = useState();

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
        const res = await axiosAPI.get("/customers?kycStatus=Pending");
        //console.log(res);
        setCustomers(res.data.customers);
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

  let count = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/customers")}>Customers</span>{" "}
        <i class="bi bi-chevron-right"></i> KYC-Approvals
      </p>
      {customers && !customerId &&  (
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
            <div className="col-10">
              <table className={`table table-bordered borderedtable`}>
                <thead>
                  <tr
                    className="animated-row"
                    style={{ animationDelay: `${count * 0.1}s` }}
                  >
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
                  {customers.length > 0 &&
                    customers.map((customer) => (
                      <tr
                        key={customer.id}
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
                          {/* <KYCViewModal
                            customer={customer}
                            changeTrigger={changeTrigger}
                          /> */}
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
        <KYCModal customerId={customerId} setCustomerId={setCustomerId} />
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
