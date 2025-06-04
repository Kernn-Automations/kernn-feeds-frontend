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

function OngoingMinOrderModal({ rule, onClose }) {
  const [minimumQty, setMinimumQty] = useState("");
  const [ruleType, setRuleType] = useState("");
  const [unit, setUnit] = useState("");
  const [productId, setProductId] = useState("");
  const [availableOptions, setAvailableOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { axiosAPI } = useAuth();
  const allOptions = ["local", "central", "state", "district"];

  useEffect(() => {
    if (rule) {
      setMinimumQty(rule.minQuantity || "");
      setRuleType(rule.maxQuantity || "");
      setUnit(rule.unit || "");
      setProductId(rule.productId || "");
      setErrors({});
      setSuccess(false);
    }
  }, [rule]);

  const validateFields = () => {
    const newErrors = {};
    if (!minimumQty) newErrors.minimumQty = true;
    if (!ruleType) newErrors.ruleType = true;
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
        ruleType,
        unit,
        productId,
      })
      .then((res) => {
        setSuccess(true);
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
          <h3 className={`px-3 pb-3 mdl-title`}>Edit Minimum Order Rule</h3>

          <div className="row justify-content-center">
            <div className="col-4 inputcolumn-mdl">
              <label>Rule Type:</label>
              <select
                name=""
                id=""
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className={errors.ruleType ? styles.errorField : ""}
              >
                <option value="product">Product</option>
                <option value="cart">Cart</option>
              </select>
            </div>
          </div>
          {ruleType === "product" && (
            <div className="row justify-content-center">
              <div className="col-4 inputcolumn-mdl">
                <label>Product Id:</label>
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className={errors.productId ? styles.errorField : ""}
                />
              </div>
            </div>
          )}

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

export default OngoingMinOrderModal;
