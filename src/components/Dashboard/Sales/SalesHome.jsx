import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";

function SalesHome({ navigate }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Sales ₹",
        data: [150000, 180000, 140000, 200000, 175000, 210000],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyProductData = {
    labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
    datasets: [
      {
        label: "₹",
        data: [80000, 65000, 55000, 45000, 35000],
        backgroundColor: [
          "#4e73df",
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
          "#e74a3b",
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
            onClick={() => navigate("/sales/orders")}
          >
            Sales Orders
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/sales/order-transfer")}
          >
            Order Transfer
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/sales/cancelled-order")}
          >
            Cancelled Orders
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Total Orders" value="320" />
        <ReusableCard title="Pending Orders" value="15" color="yellow.500" />
        <ReusableCard title="Cancelled Orders" value="8" color="red.500" />
        <ReusableCard title="This Month Sales" value="₹6.8L" color="green.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="Sales Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Sales by Product"
          data={dummyProductData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default SalesHome;
