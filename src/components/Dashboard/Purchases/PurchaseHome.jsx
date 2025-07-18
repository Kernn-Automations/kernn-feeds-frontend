import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";

function PurchaseHome({ navigate }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Purchases ₹",
        data: [50000, 60000, 45000, 70000, 55000, 80000],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyVendorData = {
    labels: ["Vendor A", "Vendor B", "Vendor C", "Vendor D"],
    datasets: [
      {
        label: "₹",
        data: [30000, 25000, 20000, 15000],
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
            onClick={() => navigate("/purchases/new-purchase")}
          >
            + New Purchase Order
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/purchases/purchase-report")}
          >
            Purchase Order Report
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/purchases/vendors")}
          >
            Vendors
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Total Purchase Orders" value="42" />
        <ReusableCard title="Pending Deliveries" value="6" color="yellow.500" />
        <ReusableCard title="Vendors" value="12" color="blue.500" />
        <ReusableCard title="This Month Spend" value="₹1.2L" color="green.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="Purchases Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Purchases by Vendor"
          data={dummyVendorData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default PurchaseHome;
