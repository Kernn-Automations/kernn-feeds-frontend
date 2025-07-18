import React from "react";
import styles from "./Customer.module.css";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";
import ChartComponent from "../../ChartComponent";

function CustomerHome({ navigate, isAdmin }) {
    const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "New Customers",
        data: [5, 8, 6, 10, 7, 9],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyTypeData = {
    labels: ["Bill-Bill","Monthly"],
    datasets: [
      {
        label: "Customers",
        data: [45,35],
        backgroundColor: [
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
        ],
      },
    ],
  };
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          {isAdmin && (
            <button
              className="homebtn"
              onClick={() => navigate("/customers/create")}
            >
              Create Customer
            </button>
          )}
          <button
            className="homebtn"
            onClick={() => navigate("/customers/customer-list")}
          >
            Customers List
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/customers/kyc-approvals")}
          >
            KYC Approvals
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/customers/reports")}
          >
            Customer Reports
          </button>
        </div>
        {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4} marginTop={50}>
        <ReusableCard title="Total Customers" value="150" />
        <ReusableCard title="Active Customers" value="140" color="green.500" />
        <ReusableCard title="Pending KYC" value="10" color="yellow.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="New Customers Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Customer Types"
          data={dummyTypeData}
          options={{ responsive: true }}
        />
      </Flex>
      </div>
    </>
  );
}

export default CustomerHome;
