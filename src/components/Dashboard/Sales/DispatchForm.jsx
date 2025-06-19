import { useAuth } from "@/Auth";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import styles from "./Sales.module.css";

function DispatchForm({
  actionLoading,
  setActionLoading,
  showDispatchModal,
  setShowDispatchModal,
  orderId,
  order,
  setOrder,
  setError,
  setIsModalOpen,
}) {
  const [truckNumber, setTruckNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");

  const { axiosAPI } = useAuth();

  const onSubmitBtn = async () => {
    if (!truckNumber || !driverName || !driverMobile) {
      setError("All fields are required");
      setIsModalOpen(true);
      return;
    }
    try {
      setActionLoading(true);
      const eligibility = await axiosAPI.get(
        `/sales-orders/${orderId}/dispatch/eligibility`
      );
      if (!eligibility.data.eligible) {
        setError(eligibility.data.reason || "Not eligible for dispatch");
        setIsModalOpen(true);
        return;
      }
      const res = await axiosAPI.put(`/sales-orders/${orderId}/dispatch`, {
        truckNumber,
        driverName,
        driverMobile,
      });
      setOrder({
        ...order,
        orderStatus: res.data.orderStatus,
      });
      setShowDispatchModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Dispatch failed");
      setIsModalOpen(true);
    } finally {
      setActionLoading(false);
    }
  };
  return (
    <>
      <DialogRoot
        placement={"center"}
        size={"md"}
        className={styles.mdl}
        open={showDispatchModal}
        onOpenChange={setShowDispatchModal}
      >
        <DialogActionTrigger asChild>
          <button
            className={styles.dispatchBtn}
            onClick={() => setShowDispatchModal(true)}
          >
            {actionLoading ? "Checking..." : "Dispatch Order"}
          </button>
        </DialogActionTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <h5 className="px-3 mdl-title">Dispatch Order</h5>
            <div className={`mb-2 ${styles.dispatchForm}`}>
              <label>Truck Number</label>
              <input
                type="text"
                // className="form-control"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                placeholder="Enter truck number"
              />
            </div>
            <div className={`mb-2 ${styles.dispatchForm}`}>
              <label>Driver Name</label>
              <input
                type="text"
                // className="form-control"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Enter driver name"
              />
            </div>
            <div className={`mb-3 ${styles.dispatchForm}`}>
              <label>Driver Mobile</label>
              <input
                type="text"
                // className="form-control"
                value={driverMobile}
                onChange={(e) => setDriverMobile(e.target.value)}
                placeholder="Enter driver mobile"
              />
            </div>
            <div className="d-flex justify-content-end gap-2 py-3">
              <button
                className="cancelbtn"
                onClick={() => setShowDispatchModal(false)}
              >
                Cancel
              </button>
              <button
                className="submitbtn"
                disabled={actionLoading}
                onClick={onSubmitBtn}
              >
                {actionLoading ? "Dispatching..." : "Dispatch"}
              </button>
            </div>
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" asChild>
            <button onClick={() => setShowDispatchModal(false)}>
              <i className="bi bi-x"></i>
            </button>
          </DialogCloseTrigger>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default DispatchForm;
