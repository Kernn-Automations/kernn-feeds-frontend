// File: WarehouseDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/Auth";
import WarehouseHeaderCard from "./Components/WarehouseHeaderCard";
import WarehouseTabSection from "./Components/WarehouseTabSection";

function WarehouseDetailsPage() {
  const { id } = useParams(); // Get warehouseId from URL
    const {axiosAPI} = useAuth();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchWarehouse() {
      try {
        const res = await axiosAPI.get(`/warehouse/details/${id}`);
        console.log(res);
        setWarehouse(res.data); // whole object: { warehouse, manager, ... }
      } catch (error) {
        console.error("Failed to load warehouse", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWarehouse();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <WarehouseHeaderCard warehouse={warehouse} />
      <WarehouseTabSection warehouseDetails={warehouse} />
    </div>
  );
}

export default WarehouseDetailsPage;
