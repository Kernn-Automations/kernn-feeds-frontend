import React, { useState } from "react";
import storeService from "../../../services/storeService";

export default function StoreIndents() {
  const [payload, setPayload] = useState({ storeId: "", items: [], notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onCreate = async () => {
    setLoading(true);
    try {
      const resp = await storeService.createIndent(payload);
      setResult(resp);
    } catch (e) {
      alert(e?.message || "Failed to create indent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Store Indents</h4>
      <button className="btn btn-primary" disabled={loading} onClick={onCreate}>Create Indent</button>
      {result && <pre style={{ marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}


