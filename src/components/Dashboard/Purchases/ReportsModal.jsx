import React, { useEffect, useState } from "react";
import styles from "./Purchases.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/Auth";

function ReportsModal({ order, warehouses }) {
  const { axiosAPI } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    
  };
  const [pdf, setPdf] = useState();
  useEffect(() => {
    async function fetch() {
      try{
        const res = await axiosAPI.get(`/purchases/${order.id}/pdf`);
        console.log(res)
        setPdf(res.data);
      }catch(e){
        console.log(e)
      }
    }
    fetch();
  }, [])

  const downloadPDF = async () => {
    try {
      const response = await axiosAPI.get(`/purchases/${order.id}/pdf`, {
        responseType: 'arraybuffer', // Important to get raw binary
      });
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf'; // Set your desired file name here
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const [pdetails, setPdetails] = useState();

  const [error, setError] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  useEffect(() => {
    async function fetch(params) {
      try {
        const res = await axiosAPI.get(`/purchases/${order.id}`);
        console.log(res);
        setPdetails(res.data.purchaseOrder);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, []);

  return (
    <>
      <h3 className={`px-3 mdl-title`}>Purchase Report</h3>
      <div className="row m-0 p-0">
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Date :</label>
          <input type="text" value={"na"} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Time :</label>
          <input type="text" value={"na"} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">User ID :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse :</label>
          <input type="text" value={pdetails && pdetails.warehouse.name} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Purchase ID :</label>
          <input type="text" value={pdetails && pdetails.ordernumber} />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>TO</h5>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor Name :</label>
          <input type="text" value={pdetails && pdetails.supplierName} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor ID :</label>
          <input type="text" value={"na"} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 1 :</label>
          <input type="text" value={pdetails && pdetails.supplierPlot} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 2 :</label>
          <input type="text" value={pdetails && pdetails.supplierStreet} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Village/City :</label>
          <input type="text" value={pdetails && pdetails.supplierCity} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">District :</label>
          <input type="text" value={pdetails && pdetails.supplierDistrict} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">State :</label>
          <input type="text" value={pdetails && pdetails.supplierState} />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Pincode :</label>
          <input type="text" value={pdetails && pdetails.supplierPincode} />
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
                    <td>{item.productId}</td>
                    <td>{item.product.name}</td>
                    <td>{item.unitPrice}</td>
                    <td>{item.quantity}</td>
                    <td>{"na"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="row m-0 p-3 pt-4">
          <div className={`col-3 ${styles.longformmdl}`}>
            <label htmlFor="">Total Amount :</label>
            <span> na/-</span>
          </div>
        </div>
      </div>

      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-2`}>
          <button className="submitbtn" onClick={downloadPDF}>Download</button>
          {/* <DialogActionTrigger asChild>
            <button className="cancelbtn">Cancel</button>
          </DialogActionTrigger> */}
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default ReportsModal;
