import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import React, { useEffect, useState } from "react";
import styles from "./Payments.module.css";
import CreditNoteModal from "./CreditNoteModal";

function CreditNote({ navigate }) {
  const [customer, setCustomer] = useState();

  const [customers, setCustomers] = useState();

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [custDetails, setCustDetails] = useState();

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/customers?limit=50");
        console.log(res);

        setCustomers(res.data.customers);
      } catch (e) {
        // console.log(e);
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const [creditNotes, setCreditNotes] = useState();

  useEffect(() => {
    if (!customer) return;

    async function fetch() {
      setCreditNotes(null);

      try {
        const cust = customers.find((cust) => cust.id === Number(customer));
        console.log(cust);
        setCustDetails(cust);
        setLoading(true);
        const res = await axiosAPI.get(`/credit-notes/customer/${customer}`);
        console.log(res);

        setCreditNotes(res.data.creditNotes);
      } catch (e) {
        // console.log(e);
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [customer]);

  let index = 1;

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/payments")}>Payments</span>{" "}
        <i class="bi bi-chevron-right"></i> Credit-Notes
      </p>

      <div className="row m-0 p-3">
        {customers && (
          <div className={`col-3 formcontent`}>
            <label htmlFor="">Customers :</label>
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
        )}
      </div>

      {creditNotes && (
        <div className="row m-0 p-3 justify-content-center">
          {custDetails && (
            <div className={`col-lg-10 ${styles.custDetails}`}>
              <h5>{custDetails.name}</h5>
              <p>ID : {custDetails.customer_id}</p>
              <p>Mobile : {custDetails.mobile}</p>
            </div>
          )}
          <div className="col-lg-10">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr
                  className="animated-row"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <th>S.No</th>
                  <th>Order Date</th>
                  <th>Order ID</th>
                  <th>Discount Type</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {creditNotes.length === 0 && (
                  <tr>
                    <td colSpan={6}>NO DATA FOUND</td>
                  </tr>
                )}

                {creditNotes.length > 0 &&
                  creditNotes.map((creditNote) => (
                    <tr
                      key={creditNote.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{creditNote.orderDate?.slice(0, 10)}</td>
                      <td>{creditNote.orderNumber}</td>
                      <td>{creditNote.discountType}</td>
                      <td>{creditNote.amount}</td>
                      <td><CreditNoteModal credit={creditNote} /></td>
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

export default CreditNote;
