import React, { useEffect, useState } from "react";
import styles from "./Purchases.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/Auth";
import axios from "axios";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function ReportsModal({ pdetails, warehouses }) {
  const { axiosAPI } = useAuth();

  const VITE_API = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("access_token");

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const downloadPDF = async () => {
    if (!pdetails?.id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${VITE_API}/purchases/${pdetails.id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // space after 'Bearer' is required
          },
          responseType: "blob", // for file downloads
        }
      );

      console.log(response);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Purchase-${pdetails.orderNumber || pdetails.id}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url); // Clean up
    } catch (e) {
      console.log(e);
      setError(e.response.data.message);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3 className={`px-3 mdl-title`}>Purchase Report</h3>
      <div className="row m-0 p-0">
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Date :</label>
          <input type="text" value={pdetails && pdetails.date} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Time :</label>
          <input
            type="text"
            value={pdetails && pdetails.createdAt.slice(11, 16)}
          />
        </div>
        {/* <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">User ID :</label>
          <input type="text" />
        </div> */}
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse :</label>
          <input
            type="text"
            value={pdetails && pdetails.warehouse && pdetails.warehouse.name}
          />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Purchase ID :</label>
          <input type="text" value={pdetails && pdetails.orderNumber} />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>TO</h5>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor Name :</label>
          <input type="text" value={pdetails && pdetails.supplier.name} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor ID :</label>
          <input
            type="text"
            value={pdetails && pdetails.supplier.supplierCode}
          />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 1 :</label>
          <input type="text" value={pdetails && pdetails.supplier.plot} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 2 :</label>
          <input type="text" value={pdetails && pdetails.supplier.street} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Village/City :</label>
          <input type="text" value={pdetails && pdetails.supplier.city} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">District :</label>
          <input type="text" value={pdetails && pdetails.supplier.district} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">State :</label>
          <input type="text" value={pdetails && pdetails.supplier.state} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Pincode :</label>
          <input type="text" value={pdetails && pdetails.supplier.pincode} />
        </div>
      </div>

      <div className="row m-0 p-0 justify-content-center">
        <h5 className={styles.headmdl}>Products</h5>
        <div className="col-10">
          <table
            className={`table table-bordered borderedtable ${styles.mdltable}`}
          >
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Units</th>
                <th>Quantity</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {pdetails &&
                pdetails.items.map((item) => (
                  <tr>
                    <td>{item.id}</td>
                    <td>{item.SKU}</td>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity}</td>
                    <td>{item.totalAmount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="row m-0 p-3 pt-4">
          <div className={`col-3 ${styles.longformmdl}`}>
            <label htmlFor="">Total Amount :</label>
            <span>{(pdetails && pdetails.totalAmount) || 0}/-</span>
          </div>
        </div>
      </div>

      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-2`}>
          {!loading && (
            <button className="submitbtn" onClick={downloadPDF}>
              Download
            </button>
          )}
          {/* <DialogActionTrigger asChild>
            <button className="cancelbtn">Cancel</button>
          </DialogActionTrigger> */}
          {loading && <Loading />}
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default ReportsModal;
