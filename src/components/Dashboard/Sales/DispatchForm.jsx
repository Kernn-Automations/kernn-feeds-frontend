import { useAuth } from "@/Auth";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import styles from "./Sales.module.css";
import ComplementryModal from "./ComplementryModal";

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
  const [isPartialDispatch, setIsPartialDispatch] = useState(false);
  const [isComplementryAdded, setIsComplementryAdded] = useState(false);
  const [destinations, setDestinations] = useState([
    { productId: "", quantity: "" },
  ]);
  const [complimentries, setComplimentries] = useState([]);
  const { axiosAPI } = useAuth();

  const [openComplementryModal, setOpenComplementryModal] = useState(false);

  const onIsComplementryChange = (e) => {
    setIsComplementryAdded(e.target.checked);
    if (e.target.checked) setOpenComplementryModal(true);
  };

  // Helper functions for managing destinations
  const addDestination = () => {
    setDestinations([...destinations, { productId: "", quantity: "" }]);
  };

  const removeDestination = (index) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index, field, value) => {
    const updated = destinations.map((dest, i) =>
      i === index ? { ...dest, [field]: value } : dest
    );
    setDestinations(updated);
  };

 

  const [products, setProducts] = useState();

  useEffect(() => {
    async function fetch(params) {
      try {
        const res = await axiosAPI.get("/products?showAll=true");
        console.log(res);
        setProducts(res.data.products);
      } catch (e) {
        console.log(e);
      }
    }

    fetch();
  }, []);

  const onSubmitBtn = async () => {
    if (!truckNumber || !driverName || !driverMobile) {
      setError("All fields are required");
      setIsModalOpen(true);
      return;
    }

    // Validate partial dispatch destinations if enabled
    if (isPartialDispatch) {
      const hasEmptyDestinations = destinations.some(
        (dest) => !dest.productId.trim() || !dest.quantity.trim()
      );
      if (hasEmptyDestinations) {
        setError(
          "All product and quantity fields are required for partial dispatch"
        );
        setIsModalOpen(true);
        return;
      }
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

      const dispatchData = {
        truckNumber,
        driverName,
        driverMobile,
        isPartialDispatch,
        addComplementaryAttribute: isComplementryAdded,
        complementaryItems: isComplementryAdded ? complimentries : [],
        ...(isPartialDispatch && { destinations }),
      };

      console.log(dispatchData);

      const res = await axiosAPI.put(
        `/sales-orders/${orderId}/dispatch`,
        dispatchData
      );
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
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                placeholder="Enter truck number"
              />
            </div>
            <div className={`mb-2 ${styles.dispatchForm}`}>
              <label>Driver Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Enter driver name"
              />
            </div>
            <div className={`mb-2 ${styles.dispatchForm}`}>
              <label>Driver Mobile</label>
              <input
                type="text"
                value={driverMobile}
                onChange={(e) => setDriverMobile(e.target.value)}
                placeholder="Enter driver mobile"
              />
            </div>

            {/* Partial Dispatch Checkbox */}
            <div className={`mb-3 ${styles.dispatchForm}`}>
              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  id="partialDispatch"
                  checked={isPartialDispatch}
                  onChange={(e) => setIsPartialDispatch(e.target.checked)}
                  className="me-2"
                />
                <label htmlFor="partialDispatch" className="mb-0">
                  Partial Dispatch
                </label>
              </div>
              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  id="isComplementryAdded"
                  checked={isComplementryAdded}
                  onChange={(e) => onIsComplementryChange(e)}
                  className="me-2"
                />
                <label htmlFor="isComplementryAdded" className="mb-0">
                  Add Complementry
                </label>
              </div>
            </div>
            {isComplementryAdded && (
              <div className={styles.compDetails}>
                <h6>Complementry Details</h6>
                {complimentries.map((comp) => {
                  const product = products.find(
                    (p) => String(p.id) === String(comp.productId)
                  );
                  return (
                    <p>
                      <span>{product?.name || comp.productId} : </span>
                      {comp.bags} Bags
                    </p>
                  );
                })}
              </div>
            )}

            <ComplementryModal
              openComplementryModal={openComplementryModal}
              setOpenComplementryModal={setOpenComplementryModal}
              isComplementryAdded={isComplementryAdded}
              setIsComplementryAdded={setIsComplementryAdded}
              products={products}
              complimentries={complimentries}
              setComplimentries={setComplimentries}
              orderId={orderId}
            />

            {/* Partial Dispatch Destinations */}
            {isPartialDispatch && (
              <div className={`mb-3 ${styles.partialDispatchSection}`}>
                <h6 className="mb-3">Dispatch Details</h6>
                {destinations.map((destination, index) => (
                  <div key={index} className={`mb-3 ${styles.destinationCard}`}>
                    {destinations.length > 1 && (
                      <div className="d-flex justify-content-end mb-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeDestination(index)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <div className={`mb-2 ${styles.dispatchForm}`}>
                      <label>Product</label>
                      <select
                        value={destination.productId}
                        onChange={(e) =>
                          updateDestination(index, "productId", e.target.value)
                        }
                        className={styles.dispatchFormSelect}
                      >
                        <option value="">Select Product</option>
                        {order?.items?.map((item, itemIndex) => (
                          <option
                            key={itemIndex}
                            value={item.productId || item.id}
                          >
                            {item.productName || item.name} - Qty:{" "}
                            {item.quantity} {item.unit && `(${item.unit})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={`mb-2 ${styles.dispatchForm}`}>
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={destination.quantity}
                        onChange={(e) =>
                          updateDestination(index, "quantity", e.target.value)
                        }
                        placeholder="Enter quantity"
                        min="1"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={addDestination}
                >
                  + Add More Product
                </button>
              </div>
            )}
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
