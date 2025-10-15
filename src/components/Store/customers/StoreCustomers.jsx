import React, { useState } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";
import storeService from "../../../services/storeService";

export default function StoreCustomers() {
  const [payload, setPayload] = useState({ storeId: "", name: "", mobile: "", area: "", pincode: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onCreateOrFind = async () => {
    setLoading(true);
    try {
      const resp = await storeService.createOrFindCustomer(payload);
      setResult(resp);
    } catch (e) {
      alert(e?.message || "Failed to create/find customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Customers</h4>

      {/* Buttons */}
      <div className="row m-0 p-2">
        <div className="col">
          <button className="homebtn">Customers List</button>
          <button className="homebtn" disabled={loading} onClick={onCreateOrFind}>Create Customer</button>
        </div>
      </div>

      {/* Mini Dashboards */}
      <Flex wrap="wrap" justify="space-between" px={2}>
        <ReusableCard title="Total Customers" value={"156"} />
        <ReusableCard title="KYC Pending" value={"18"} color="yellow.500" />
        <ReusableCard title="Active" value={"120"} color="green.500" />
      </Flex>

      {result && <pre style={{ marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}


