import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";

function StockHome({ navigate }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Transfers",
        data: [3, 4, 2, 6, 5, 7],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyProductData = {
    labels: ["Cattle Feed", "Fertilizer", "Minerals", "Supplements"],
    datasets: [
      {
        label: "Quantity",
        data: [4000, 2500, 2000, 1500],
        backgroundColor: [
          "#4e73df",
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
        ],
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
            onClick={() => navigate("/stock-transfer/transfer")}
          >
            Stock Transfer
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/stock-transfer/list")}
          >
            Transfer List
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Transfers This Month" value="12" />
        <ReusableCard title="From Central WH" value="7" color="blue.500" />
        <ReusableCard title="From Regional WH" value="5" color="purple.500" />
        <ReusableCard title="Total Quantity" value="8,500 kg" color="green.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="Transfers Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Top Products Transferred"
          data={dummyProductData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default StockHome;
