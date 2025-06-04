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

function OngoingWarehouseRuleModal({ rule, onClose }) {
  const [minimumQty, setMinimumQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [unit, setUnit] = useState("");
  const [warehouseOptions, setWarehouseOptions] = useState([]);
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
      setMaxQty(rule.maxQuantity || "");
      setUnit(rule.unit || "");
      setWarehouseOptions(rule.warehouseOptions || []);
      setErrors({});
      setSuccess(false);
    }
  }, [rule]);

  useEffect(() => {
    const remaining = allOptions.filter((opt) => !warehouseOptions.includes(opt));
    setAvailableOptions(remaining);
  }, [warehouseOptions]);

  const validateFields = () => {
    const newErrors = {};
    if (!minimumQty) newErrors.minimumQty = true;
    if (!maxQty) newErrors.maxQty = true;
    if (!unit) newErrors.unit = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitClick = () => {
    if (!validateFields()) return;
    setLoading(true);
    axiosAPI
      .put(`/warehouse/rules/${rule.id}`, {
        minQuantity: minimumQty,
        maxQuantity: maxQty,
        unit,
        warehouseOptions,
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

  const handleSelect = (e) => {
    const value = e.target.value;
    if (value) {
      setWarehouseOptions((prev) => [...prev, value]);
    }
  };

  const handleRemove = (val) => {
    setWarehouseOptions((prev) => prev.filter((v) => v !== val));
  };

  return (
    <DialogRoot open={true} onOpenChange={() => onClose(false)} placement="center" size="lg">
      <DialogContent className="mdl">
        <DialogBody>
          <h3 className={`px-3 pb-3 mdl-title`}>Edit Warehouse Rule</h3>

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

          <div className="row justify-content-center">
            <div className="col-4 inputcolumn-mdl">
              <label>Max Qty:</label>
              <input
                type="text"
                value={maxQty}
                onChange={(e) => setMaxQty(e.target.value)}
                className={errors.maxQty ? styles.errorField : ""}
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

          <div style={{ width: "80%", margin: "20px auto" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {warehouseOptions.map((value) => (
                <div
                  key={value}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span>{value}</span>
                  <button
                    onClick={() => handleRemove(value)}
                    style={{
                      marginLeft: "8px",
                      background: "none",
                      border: "none",
                      color: "red",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="row m-0 p-2 justify-content-center">
              <div className="col-12 inputcolumn-mdl">
                <label>Warehouse Options:</label>
                <select onChange={handleSelect} value="">
                  <option value="">-- Select --</option>
                  {availableOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
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
            <ErrorModal isOpen={true} message={error} onClose={() => setError(null)} />
          )}
        </DialogBody>

        <DialogCloseTrigger className="inputcolumn-mdl-close" />
      </DialogContent>
    </DialogRoot>
  );
}

export default OngoingWarehouseRuleModal;
