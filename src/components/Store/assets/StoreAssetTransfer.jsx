import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Dashboard/HomePage/HomePage.module.css";
import ErrorModal from "@/components/ErrorModal";

const dummyAssets = [
  { id: 1, name: "Display Rack - Medium", available: 4 },
  { id: 2, name: "Billing Counter System", available: 1 },
  { id: 3, name: "Generator Unit", available: 2 },
];

const dummyStores = [
  { id: 11, name: "Store - Hyderabad" },
  { id: 12, name: "Store - Bengaluru" },
  { id: 13, name: "Store - Chennai" },
];

export default function StoreAssetTransfer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    assetId: "",
    fromStore: "Current Store",
    toStore: "",
    quantity: "",
    reason: "",
    remarks: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.assetId || !form.toStore || !form.quantity || !form.reason) {
      setError("Please fill all the required fields.");
      setIsModalOpen(true);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2
            style={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "28px",
              color: "var(--primary-color)",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            Asset Transfer
          </h2>
          <p className="path">
            <span onClick={() => navigate("/store/assets")}>Assets</span> <i className="bi bi-chevron-right"></i> Transfer
          </p>
        </div>
        <button className="cancelbtn" onClick={() => navigate("/store/assets")}>
          Back to Assets
        </button>
      </div>

      <div className={styles.orderStatusCard}>
        <h4 style={{ margin: 0, marginBottom: "20px", fontFamily: "Poppins", fontWeight: 600, fontSize: "20px", color: "var(--primary-color)" }}>
          Transfer Request
        </h4>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label>Asset *</label>
              <select value={form.assetId} onChange={(e) => handleChange("assetId", e.target.value)} required>
                <option value="">Select Asset</option>
                {dummyAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} (Available: {asset.available})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>From Store</label>
              <input type="text" value={form.fromStore} disabled />
            </div>
            <div>
              <label>To Store *</label>
              <select value={form.toStore} onChange={(e) => handleChange("toStore", e.target.value)} required>
                <option value="">Select Store</option>
                {dummyStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Quantity *</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} required />
            </div>
            <div>
              <label>Reason *</label>
              <select value={form.reason} onChange={(e) => handleChange("reason", e.target.value)} required>
                <option value="">Select Reason</option>
                <option value="New Store Requirement">New Store Requirement</option>
                <option value="Replacement">Replacement</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Remarks (Optional)</label>
              <textarea rows="3" value={form.remarks} onChange={(e) => handleChange("remarks", e.target.value)} placeholder="Additional notes..." />
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
            <button type="submit" className="homebtn">
              Submit Transfer
            </button>
            <button
              type="button"
              className="cancelbtn"
              onClick={() =>
                setForm({
                  assetId: "",
                  fromStore: "Current Store",
                  toStore: "",
                  quantity: "",
                  reason: "",
                  remarks: "",
                })
              }
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {submitted && (
        <div className={styles.orderStatusCard} style={{ marginTop: "24px" }}>
          <h4 style={{ margin: 0, marginBottom: "12px", fontFamily: "Poppins", fontWeight: 600 }}>Transfer Summary</h4>
          <ul style={{ margin: 0, paddingLeft: "20px", fontFamily: "Poppins", fontSize: "14px" }}>
            <li>
              Asset: <strong>{dummyAssets.find((a) => a.id === Number(form.assetId))?.name || "-"}</strong>
            </li>
            <li>
              Quantity: <strong>{form.quantity}</strong>
            </li>
            <li>
              To Store: <strong>{dummyStores.find((s) => s.id === Number(form.toStore))?.name || "-"}</strong>
            </li>
            <li>
              Reason: <strong>{form.reason}</strong>
            </li>
            {form.remarks && (
              <li>
                Remarks: <strong>{form.remarks}</strong>
              </li>
            )}
          </ul>
          <p style={{ marginTop: "12px", fontFamily: "Poppins", color: "#059669" }}>The transfer request has been submitted for processing.</p>
        </div>
      )}

      {isModalOpen && <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />}
    </div>
  );
}

