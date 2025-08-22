// File: WarehouseDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/Auth";
import WarehouseHeaderCard from "./Components/WarehouseHeaderCard";
import WarehouseTabSection from "./Components/WarehouseTabSection";

function WarehouseDetailsPage({managers}) {
  const { id } = useParams(); // Get warehouseId from URL
    const {axiosAPI} = useAuth();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
    async function fetchWarehouse() {
      try {
        const res = await axiosAPI.get(`/warehouses/details/${id}`);
        console.log("Warehouse Details Response:", res.data);
        
        // Check if stockSummary is in data field and extract it
        if (res.data.stockSummary && res.data.stockSummary.data) {
          // Backend returns { data: [...] } structure
          res.data.stockSummary = res.data.stockSummary.data;
        }
        
        setWarehouse(res.data); // whole object: { warehouse, manager, ... }
      } catch (error) {
        console.error("Failed to load warehouse", error);
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    fetchWarehouse();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <WarehouseHeaderCard warehouse={warehouse} refreshData={()=>fetchWarehouse()} managers={managers} />
      <WarehouseTabSection warehouseDetails={warehouse} />
    </div>
  );
}

export default WarehouseDetailsPage;
