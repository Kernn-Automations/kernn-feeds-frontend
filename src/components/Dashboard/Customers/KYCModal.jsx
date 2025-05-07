import React, { useState } from "react";
import styles from "./Customer.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";
import img from "./../../../images/dummy-img.jpeg";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";

function KYCModal({ customerdata, changeTrigger }) {

  const {axiosAPI} = useAuth(); 

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [successful, setSuccessful] = useState();

  const onApproveClick = () => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.put(
          `/customers/${customerdata.id}/kyc/approve`
        );
        console.log(res);
        setSuccessful(res.data.message);
        changeTrigger();
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  };

  const onDeclineClick = () => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.put(
          `/customers/${customerdata.id}/kyc/reject`
        );
        console.log(res);
        setSuccessful(res.data.message);
        changeTrigger();
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  };

  return (
    <>
      <h3 className={`px-3 mdl-title`}>KYC Approval</h3>
      <div className="row m-0 p-0 ">
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer ID :</label>
          <input type="text" value={customerdata.customer_id} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer Name :</label>
          <input type="text" value={customerdata.name} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse ID :</label>
          <input type="text" value={"na"} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse Name :</label>
          <input type="text" value={"na"} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">SE ID :</label>
          <input
            type="text"
            value={
              customerdata.salesExecutive && customerdata.salesExecutive.id
            }
          />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">SE Name :</label>
          <input
            type="text"
            value={
              customerdata.salesExecutive && customerdata.salesExecutive.name
            }
          />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Address</h5>
        <div className={`col-2 ${styles.textform}`}>
          <label htmlFor="">Address :</label>
        </div>
        <div className={`col-5 ${styles.textform}`}>
          <textarea name="" id="" value={customerdata.address}></textarea>
        </div>
      </div>

      <div className="row m-0 p-0 ">
        <h5 className={styles.headmdl}>Aadhar proof</h5>
        <div className={`col-4 `}>
          <img
            src={
              (customerdata.kycDocuments &&
                customerdata.kycDocuments[0]?.frontImage) ||
              img
            }
            alt="aadhar"
            className={styles.images}
          />
          <span>Aadhar Front</span>
        </div>
        <div className={`col-4 `}>
          <img
            src={
              (customerdata.kycDocuments &&
                customerdata.kycDocuments[0]?.backImage) ||
              img
            }
            alt="aadhar"
            className={styles.images}
          />
          <span>Aadhar Back</span>
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>PAN Card proof</h5>
        <div className={`col-4 `}>
          <img
            src={
              (customerdata.kycDocuments &&
                customerdata.kycDocuments[1]?.frontImage) ||
              img
            }
            alt="aadhar"
            className={styles.images}
          />
          <span>PAN Front</span>
        </div>
        <div className={`col-4 `}>
          <img
            src={
              (customerdata.kycDocuments &&
                customerdata.kycDocuments[1]?.backImage) ||
              img
            }
            alt="aadhar"
            className={styles.images}
          />
          <span>PAN Back</span>
        </div>

        <div className="row m-0 p-0 ">
          <h5 className={styles.headmdl}>Photo</h5>
          <div className={`col-4 `}>
            <img
              src={customerdata.photo || img}
              alt="aadhar"
              className={styles.images}
            />
          </div>
        </div>
      </div>
      {!loading && !successful && (
        <div className="row m-0 p-3 pt-4 justify-content-center">
          <div className={`col-4`}>
            <button className="submitbtn" onClick={onApproveClick}>Approve</button>

            <button className="cancelbtn" onClick={onDeclineClick}>Decline</button>
          </div>
        </div>
      )}

      {successful && (
        <div className="row m-0 p-3 pt-4 justify-content-center">
          <div className={`col-4`}>
            <DialogActionTrigger asChild>
              <button className="submitbtn">{successful}</button>
            </DialogActionTrigger>
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

export default KYCModal;
