import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";

function InventoryHome({ navigate }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Stock Level (kg)",
        data: [1200, 1350, 1100, 1400, 1250, 1500],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyWarehouseData = {
    labels: ["Warehouse 1", "Warehouse 2", "Warehouse 3"],
    datasets: [
      {
        label: "Stock",
        data: [45, 35, 20],
        backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"],
      },
    ],
  };

  return (
    <>
      {/* Buttons */}
      <div className="row m-0 p-3">
        <div className="col">
          <button
            className="homebtn"
            onClick={() => navigate("/inventory/incoming-stock")}
          >
            Incoming Stock
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/inventory/outgoing-stock")}
          >
            Outgoing Stock
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/inventory/stock-summary")}
          >
            Stock Summary
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Total Inventory Value" value="₹8.2L" />
        <ReusableCard title="Outgoing" value="₹30K" color="red.500" />
        <ReusableCard title="Damaged Stock" value="₹12K" color="yellow.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="Stock Level Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Stock by Warehouse"
          data={dummyWarehouseData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default InventoryHome;
