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

  const [showGstinMsmeModal, setShowGstinMsmeModal] = useState(false);
  const [requireGstin, setRequireGstin] = useState(false);
  const [requireMsme, setRequireMsme] = useState(false);
  const [gstin, setGstin] = useState("");
  const [msme, setMsme] = useState("");

const onApproveClick = async () => {
  try {
    setLoading(true);
    const res = await axiosAPI.put(`/customers/${customerdata.id}/kyc/approve`);
    setSuccessful(res.data.message);

    // 🔍 Fetch updated customer info
    const customerRes = await axiosAPI.get(`/customers/${customerdata.id}`);
    const customer = customerRes.data;

    // 🧾 Check for missing GSTIN or MSME
    const hasGstin = !!customer.gstin;
    const hasMsme = !!customer.msmeNumber;

    // Set flags only for missing fields
    setRequireGstin(!hasGstin);
    setRequireMsme(!hasMsme);

    // Open modal only if one of them is missing
    if (!hasGstin || !hasMsme) {
      setShowGstinMsmeModal(true);
    } else {
      changeTrigger();
    }

  } catch (e) {
    setError(e.response?.data?.message || "Approval failed");
    setIsModalOpen(true);
  } finally {
    setLoading(false);
  }
};

const [showRejectionModal, setShowRejectionModal] = useState(false);
const [rejectionRemark, setRejectionRemark] = useState("");

const onDeclineClick = () => {
  setShowRejectionModal(true);
};

const submitRejection = async () => {
  try {
    if (!rejectionRemark.trim()) {
      setError("Please enter a rejection remark.");
      setIsModalOpen(true);
      return;
    }
    setLoading(true);
    const res = await axiosAPI.put(`/customers/${customerdata.id}/kyc/reject`, {
      remark: rejectionRemark,
    });
    setSuccessful(res.data.message);
    changeTrigger();
  } catch (e) {
    setError(e.response?.data?.message || "Rejection failed");
    setIsModalOpen(true);
  } finally {
    setLoading(false);
    setShowRejectionModal(false);
    setRejectionRemark("");
  }
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
        {customerdata.gstin && (
          <div className={`col-4 ${styles.longformmdl}`}>
            <label>GSTIN :</label>
            <input type="text" value={customerdata.gstin} readOnly />
          </div>
        )}

        {customerdata.msmeNumber && (
          <div className={`col-4 ${styles.longformmdl}`}>
            <label>MSME Number :</label>
            <input type="text" value={customerdata.msmeNumber} readOnly />
          </div>
        )}
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
      {showRejectionModal && (
  <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content p-3">
        <h5>Enter Rejection Remark</h5>
        <textarea
          className="form-control mb-3"
          placeholder="Write rejection reason..."
          value={rejectionRemark}
          onChange={(e) => setRejectionRemark(e.target.value)}
        />
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={() => setShowRejectionModal(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={submitRejection}>
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{showGstinMsmeModal && (
  <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content p-3">
        <h5>Additional Details</h5>

        {!customerdata.gstin && (
  <>
    <div className="form-check my-2">
      <input
        className="form-check-input"
        type="checkbox"
        checked={requireGstin}
        onChange={() => setRequireGstin(!requireGstin)}
        id="gstinCheck"
      />
      <label className="form-check-label" htmlFor="gstinCheck">
        Add GSTIN
      </label>
    </div>
    {requireGstin && (
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter GSTIN"
        value={gstin}
        onChange={(e) => setGstin(e.target.value)}
      />
    )}
  </>
)}


        {!customerdata.msme && (
  <>
    <div className="form-check my-2">
      <input
        className="form-check-input"
        type="checkbox"
        checked={requireMsme}
        onChange={() => setRequireMsme(!requireMsme)}
        id="msmeCheck"
      />
      <label className="form-check-label" htmlFor="msmeCheck">
        Add MSME Number
      </label>
    </div>
    {requireMsme && (
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter MSME Number"
        value={msme}
        onChange={(e) => setMsme(e.target.value)}
      />
    )}
  </>
)}


        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowGstinMsmeModal(false)}
          >
            Skip
          </button>
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                setLoading(true);
                const payload = {};
                if (requireGstin) payload.gstin = gstin;
                if (requireMsme) payload.msmeNumber = msme;
                if (Object.keys(payload).length > 0) {
                  await axiosAPI.put(`/customers/${customerdata.id}/details`, payload);
                }
                changeTrigger();
              } catch (e) {
                setError(e.response?.data?.message || "Failed to update details");
                setIsModalOpen(true);
              } finally {
                setLoading(false);
                setShowGstinMsmeModal(false);
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
}

export default KYCModal;
