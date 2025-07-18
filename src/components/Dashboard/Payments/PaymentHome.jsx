import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";

function PaymentHome({ navigate }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Payments ₹",
        data: [100000, 120000, 95000, 140000, 110000, 130000],
        backgroundColor: "#2a4d9b",
      },
    ],
  };

  const dummyTypeData = {
    labels: ["UPI", "Bank Transfer"],
    datasets: [
      {
        label: "₹",
        data: [180000, 90000],
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
            onClick={() => navigate("/payments/payment-reports")}
          >
            Payment Reports
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/payments/payment-approvals")}
          >
            Payment Approvals
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/payments/credit-notes")}
          >
            Credit Notes
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Total Payments This Month" value="₹5.2L" />
        <ReusableCard title="Pending Approvals" value="8" color="yellow.500" />
        <ReusableCard title="Credit Notes Issued" value="3" color="green.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="bar"
          title="Payments Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Payment Type Distribution"
          data={dummyTypeData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default PaymentHome;
