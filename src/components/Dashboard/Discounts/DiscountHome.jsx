import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";

function DiscountHome({ navigate }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Discounts ₹",
        data: [20000, 25000, 18000, 30000, 35000, 42000],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyTypeData = {
    labels: ["Bill-to-Bill", "Monthly"],
    datasets: [
      {
        label: "₹",
        data: [28000, 14000],
        backgroundColor: ["#4e73df", "#1cc88a"],
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
            onClick={() => navigate("/discounts/bill-to-bill")}
          >
            Bill-to-Bill
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/discounts/monthly")}
          >
            Monthly Discount
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Total Discounts" value="₹42,000" />
        <ReusableCard title="Bill-to-Bill Discounts" value="₹28,000" color="blue.500" />
        <ReusableCard title="Monthly Discounts" value="₹14,000" color="green.500" />
        <ReusableCard title="Avg Discount %" value="3.5%" color="yellow.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="Discounts Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Discount Type Share"
          data={dummyTypeData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default DiscountHome;
