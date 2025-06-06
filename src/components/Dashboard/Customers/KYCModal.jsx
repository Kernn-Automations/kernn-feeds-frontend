import React, { useState } from "react";
import styles from "./Customer.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";
import img from "./../../../images/dummy-img.jpeg";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";

function KYCModal({ customerdata, changeTrigger }) {
  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const [successful, setSuccessful] = useState();

  const onApproveClick = () => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.put(
          `/customers/${customerdata.id}/kyc/approve`
        );
        setSuccessful(res.data.message);
        changeTrigger();
      } catch (e) {
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
        setSuccessful(res.data.message);
        changeTrigger();
      } catch (e) {
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

      <div className="row m-0 p-0">
        <div className={`col-5 ${styles.longformmdl2}`}>
          <label>Customer Name :</label>
          <input
            type="text"
            value={customerdata.name || "-"}
            style={{
              width: `${(customerdata.name?.length || 1) + 1}ch`,
              padding: "0.3rem 0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            readOnly
          />
        </div>
        <div className={`col-5 ${styles.longformmdl2}`}>
          <label>Email :</label>
          <input
            type="text"
            value={customerdata.email || "-"}
            style={{
              width: `${(customerdata.email?.length || 1) + 1}ch`,
              padding: "0.3rem 0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            readOnly
          />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label>Customer ID :</label>
          <input type="text" value={customerdata.customer_id || "-"} readOnly />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label>Mobile :</label>
          <input type="text" value={customerdata.mobile || "-"} readOnly />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label>WhatsApp :</label>
          <input type="text" value={customerdata.whatsapp || "-"} readOnly />
        </div>

        <div className={`col-4 ${styles.longformmdl}`}>
          <label>Aadhaar Number :</label>
          <input
            type="text"
            value={customerdata.aadhaarNumber || "-"}
            readOnly
          />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label>PAN Number :</label>
          <input type="text" value={customerdata.panNumber || "-"} readOnly />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label>KYC Status :</label>
          <input type="text" value={customerdata.kycStatus || "-"} readOnly />
        </div>
        {customerdata.rejectionRemark && (
          <div className={`col-8 ${styles.longformmdl}`}>
            <label>Rejection Remark :</label>
            <textarea value={customerdata.rejectionRemark} readOnly />
          </div>
        )}
        <div className={`col-4 ${styles.longformmdl}`}>
          <label>SE ID :</label>
          <input
            type="text"
            value={customerdata.salesExecutive?.id || "NA"}
            readOnly
          />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label>SE Name :</label>
          <input
            type="text"
            value={customerdata.salesExecutive?.name || "NA"}
            readOnly
          />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Address</h5>
        <div className={`col-2 ${styles.textform}`}>
          <label>Address :</label>
        </div>
        <div className={`col-10 ${styles.textform}`}>
          <textarea value={customerdata.address || "-"} readOnly />
        </div>
      </div>

      <div className="row m-0 p-0 ">
        <h5 className={styles.headmdl}>Aadhaar Proof</h5>
        <div className={`col-4`}>
          <img
            src={customerdata.kycDocuments?.[0]?.frontImage || img}
            alt="aadhaar-front"
            className={styles.images}
          />
          <span>Aadhaar Front</span>
        </div>
        <div className={`col-4`}>
          <img
            src={customerdata.kycDocuments?.[0]?.backImage || img}
            alt="aadhaar-back"
            className={styles.images}
          />
          <span>Aadhaar Back</span>
        </div>
      </div>

      <div className="row m-0 p-0 ">
        <h5 className={styles.headmdl}>PAN Card Proof</h5>
        <div className={`col-4`}>
          <img
            src={customerdata.kycDocuments?.[1]?.frontImage || img}
            alt="pan-front"
            className={styles.images}
          />
          <span>PAN Front</span>
        </div>
        <div className={`col-4`}>
          <img
            src={customerdata.kycDocuments?.[1]?.backImage || img}
            alt="pan-back"
            className={styles.images}
          />
          <span>PAN Back</span>
        </div>
      </div>

      <div className="row m-0 p-0 ">
        <h5 className={styles.headmdl}>Customer Photo</h5>
        <div className={`col-4`}>
          <img
            src={customerdata.photo || img}
            alt="customer-photo"
            className={styles.images}
          />
        </div>
      </div>

      {!loading && !successful && (
        <div className="row m-0 p-3 pt-4 justify-content-center">
          <div className={`col-4`}>
            <button className="submitbtn" onClick={onApproveClick}>
              Approve
            </button>
            <button className="cancelbtn" onClick={onDeclineClick}>
              Decline
            </button>
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
