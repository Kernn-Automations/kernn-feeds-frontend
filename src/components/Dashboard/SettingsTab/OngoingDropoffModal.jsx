import React, { useEffect, useState } from "react";
import {
  DialogRoot,
  DialogBody,
  DialogContent,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { useAuth } from "@/Auth";
import styles from "./Settings.module.css";

function OngoingDropoffModal({ rule, onClose }) {
  const [minimumQty, setMinimumQty] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [maxDropOffPoints, setMaxDropOffPoints] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { axiosAPI } = useAuth();

  useEffect(() => {
    if (rule) {
      setMinimumQty(rule.minQuantity || "");
      setMaxQuantity(rule.maxQuantity || "");
      setUnit(rule.unit || "");
      setMaxDropOffPoints(rule.maxDropOffPoints || "");
      setErrors({});
      setSuccess(false);
    }
  }, [rule]);

  const validateFields = () => {
    const newErrors = {};
    if (!minimumQty) newErrors.minimumQty = true;
    if (!maxQuantity) newErrors.maxQuantity = true;
    if (!unit) newErrors.unit = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitClick = () => {
    if (!validateFields()) return;
    setLoading(true);
    axiosAPI
      .put(`/drops/rules/${rule.id}`, {
        minQuantity: minimumQty,
        maxQuantity,
        unit,
        maxDropOffPoints,
      })
      .then((res) => {
        setSuccess(true);
        console.log(res);
        setTimeout(() => {
          onClose(true);
        }, 1000);
      })
      .catch((e) => {
        setError(e.response?.data?.message || "Update failed");
      })
      .finally(() => setLoading(false));
  };

  return (
    <DialogRoot
      open={true}
      onOpenChange={() => onClose(false)}
      placement="center"
      size="lg"
    >
      <DialogContent className="mdl">
        <DialogBody>
          <h3 className={`px-3 pb-3 mdl-title`}>Edit Drop-Off Rule</h3>

          <div className="row justify-content-center">
            <div className="row justify-content-center">
              <div className="col-4 inputcolumn-mdl">
                <label>Minimum Qty:</label>
                <input
                  type="text"
                  value={minimumQty}
                  onChange={(e) => setMinimumQty(e.target.value)}
                  className={errors.minimumQty ? styles.errorField : ""}
                />
              </div>
            </div>

            <div className="col-4 inputcolumn-mdl">
              <label>Max Quantity:</label>
              <input
                type="text"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
                className={errors.maxQuantity ? styles.errorField : ""}
              />
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-4 inputcolumn-mdl">
              <label>Max. Drop-off Points:</label>
              <input
                type="text"
                value={maxDropOffPoints}
                onChange={(e) => setMaxDropOffPoints(e.target.value)}
                className={errors.maxDropOffPoints ? styles.errorField : ""}
              />
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-4 inputcolumn-mdl">
              <label>Unit:</label>
              <select
                onChange={(e) => setUnit(e.target.value)}
                value={unit || "null"}
                className={errors.unit ? styles.errorField : ""}
              >
                <option value="null">--select--</option>
                <option value="kg">Kgs</option>
                <option value="ton">Tons</option>
                <option value="g">Grams</option>
              </select>
            </div>
          </div>

          <div className="row pt-3 mt-3 justify-content-center">
            <div className="col-5">
              {!loading && !success && (
                <>
                  <button className="submitbtn" onClick={onSubmitClick}>
                    Update
                  </button>
                  <button className="cancelbtn" onClick={() => onClose(false)}>
                    Cancel
                  </button>
                </>
              )}
              {loading && <Loading />}
              {success && <button className="submitbtn">Updated!</button>}
            </div>
          </div>

          {error && (
            <ErrorModal
              isOpen={true}
              message={error}
              onClose={() => setError(null)}
            />
          )}
        </DialogBody>

        <DialogCloseTrigger className="inputcolumn-mdl-close" />
      </DialogContent>
    </DialogRoot>
  );
}

export default OngoingDropoffModal;
