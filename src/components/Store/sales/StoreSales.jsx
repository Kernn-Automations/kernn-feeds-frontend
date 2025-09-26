import React, { useState } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";
import storeService from "../../../services/storeService";

export default function StoreSales() {
  const [payload, setPayload] = useState({ storeId: "", customerId: "", items: [], payments: [], notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onCreate = async () => {
    setLoading(true);
    try {
      const resp = await storeService.createSale(payload);
      setResult(resp);
    } catch (e) {
      alert(e?.message || "Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Sales</h4>

      {/* Buttons (Sales-style) */}
      <div className="row m-0 p-2">
        <div className="col">
          <button className="homebtn">Sales Orders</button>
          <button className="homebtn">Returned Orders</button>
          <button className="homebtn" disabled={loading} onClick={onCreate}>Create Sale</button>
        </div>
      </div>

      {/* Mini Dashboards */}
      <Flex wrap="wrap" justify="space-between" px={2}>
        <ReusableCard title="Today Orders" value={"12"} />
        <ReusableCard title="Today Sales" value={"₹45,680"} color="green.500" />
        <ReusableCard title="Returns Today" value={"2"} color="red.500" />
        <ReusableCard title="This Month" value={"₹3,21,400"} color="blue.500" />
      </Flex>

      {result && <pre style={{ marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}


