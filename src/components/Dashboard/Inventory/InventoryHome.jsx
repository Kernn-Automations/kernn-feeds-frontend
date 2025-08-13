import React, { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import { useAuth } from "@/Auth";
import LoadingAnimation from "@/components/LoadingAnimation";
import inventoryAni from "../../../images/animations/fetchingAnimation.gif";

function InventoryHome({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInventoryDashboard() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/dashboard/inventory");
        console.log("Inventory Dashboard Response:", res.data);
        setInventoryData(res.data);
      } catch (err) {
        console.error("Inventory dashboard fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load inventory dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchInventoryDashboard();
  }, []);

  // Transform backend arrays for Chart.js
  const trend = inventoryData?.stockLevelTrend || [];
  const trendData = {
    labels: trend.map(item => item.month || item.label || item.date || ""),
    datasets: [
      {
        label: "Stock Level",
        data: trend.map(item => item.value ?? item.stock ?? 0),
        backgroundColor: "rgba(42,77,155,0.1)",
        borderColor: "#2a4d9b",
        fill: true,
        tension: 0.3,
      }
    ]
  };

  const byWarehouse = inventoryData?.stockByWarehouse || [];
  const warehouseData = {
    labels: byWarehouse.map(item => item.warehouse || item.label || ""),
    datasets: [
      {
        label: "Stock",
        data: byWarehouse.map(item => item.stock ?? 0),
        backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b", "#858796", "#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
      }
    ]
  };

  return (
    <>
      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={inventoryAni} msg="Loading inventory dashboard..." />}

      {!loading && (
        <>
          {/* Buttons */}
          <div className="row m-0 p-3">
            <div className="col">
                <button className='homebtn' onClick={() => navigate('/inventory/incoming-stock')}>Incoming Stock</button>
                <button className='homebtn' onClick={() => navigate('/inventory/outgoing-stock')}>Outgoing Stock</button>
                <button className='homebtn' onClick={() => navigate('/inventory/current-stock')}>Current Stock</button>
                <button className='homebtn' onClick={() => navigate('/inventory/stock-summary')}>Stock Summary</button>
                <button className='homebtn' onClick={() => navigate('/inventory/damaged-goods')}>Damaged Goods</button>
            </div>
          </div>

          {/* Cards */}
          <Flex wrap="wrap" justify="space-between" px={4}>
            <ReusableCard 
              title="Total Inventory Value" 
              value={inventoryData?.totalInventoryValue || "₹8.2L"} 
            />
            <ReusableCard 
              title="Outgoing" 
              value={inventoryData?.outgoingValue || "₹30K"} 
              color="red.500" 
            />
            <ReusableCard 
              title="Damaged Stock" 
              value={inventoryData?.damagedStockValue || "₹12K"} 
              color="yellow.500" 
            />
          </Flex>

          {/* Charts */}
          <Flex wrap="wrap" px={4}>
            <ChartComponent
              type="line"
              title="Stock Level Trend"
              data={trendData}
              options={{ responsive: true }}
            />
            <ChartComponent
              type="doughnut"
              title="Stock by Warehouse"
              data={warehouseData}
              options={{ responsive: true }}
              legendPosition="left"
            />
          </Flex>
        </>
      )}
    </>
  );
}

export default InventoryHome;
