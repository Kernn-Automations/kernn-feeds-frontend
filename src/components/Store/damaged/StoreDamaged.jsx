import React, { useState } from "react";
import storeService from "../../../services/storeService";

export default function StoreDamaged() {
  const [payload, setPayload] = useState({ storeId: "", productId: "", quantity: 0, unit: "kg", damageReason: "", description: "", estimatedValue: 0, imageBase64: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onReport = async () => {
    setLoading(true);
    try {
      const resp = await storeService.reportDamagedGoods(payload);
      setResult(resp);
    } catch (e) {
      alert(e?.message || "Failed to report damaged goods");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Damaged Goods & Reports</h4>
      <button className="btn btn-primary" disabled={loading} onClick={onReport}>Report Damaged</button>
      {result && <pre style={{ marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}


