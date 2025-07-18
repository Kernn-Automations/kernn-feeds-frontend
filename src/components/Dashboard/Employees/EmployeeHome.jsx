import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";

function EmployeeHome({ navigate, isAdmin }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Employees",
        data: [45, 47, 50, 51, 52, 52],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyRoleData = {
    labels: ["Warehouse", "Sales", "Admin", "Manager", "Support", "Driver"],
    datasets: [
      {
        label: "Roles",
        data: [15, 12, 8, 5, 6, 6],
        backgroundColor: [
          "#4e73df",
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
          "#e74a3b",
          "#858796",
        ],
      },
    ],
  };

  return (
    <>
      {/* Buttons */}
      <div className="row m-0 p-3">
        <div className="col">
          {isAdmin && (
            <button
              className="homebtn"
              onClick={() => navigate("/employees/create-employee")}
            >
              Create Employee
            </button>
          )}
          <button
            className="homebtn"
            onClick={() => navigate("/employees/manage-employees")}
          >
            Manage Employees
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Total Employees" value="52" />
        <ReusableCard title="Active Employees" value="48" color="green.500" />
        <ReusableCard title="Inactive Employees" value="4" color="red.500" />
        <ReusableCard title="Roles Covered" value="6" color="purple.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="Employees Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Employees by Role"
          data={dummyRoleData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default EmployeeHome;
