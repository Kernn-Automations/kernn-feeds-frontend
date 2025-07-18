import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import DeleteProductViewModal from "./DeleteProductViewModal";

function ProductHome({ navigate, isAdmin }) {
  const dummyTrendData = {
    labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Products Added",
        data: [10, 15, 8, 20, 12, 18],
        borderColor: "#2a4d9b",
        backgroundColor: "rgba(42,77,155,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const dummyTopStockData = {
    labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
    datasets: [
      {
        label: "Stock Qty",
        data: [500, 400, 300, 200, 100],
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
          {isAdmin && (
            <>
              <button
                className="homebtn"
                onClick={() => navigate("/products/add")}
              >
                + Add
              </button>
              <DeleteProductViewModal />
            </>
          )}
          <button
            className="homebtn"
            onClick={() => navigate("/products/modify")}
          >
            Ongoing
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/products/pricing-list")}
          >
            Pricing List
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/products/taxes")}
          >
            Taxes
          </button>
        </div>
      </div>

      {/* Cards */}
      <Flex wrap="wrap" justify="space-between" px={4}>
        <ReusableCard title="Total Products" value="120" />
        <ReusableCard title="Active Products" value="110" color="green.500" />
        <ReusableCard title="Warehouses Stocking Products" value="6" color="blue.500" />
        <ReusableCard title="Low Stock Alerts" value="9" color="red.500" />
      </Flex>

      {/* Charts */}
      <Flex wrap="wrap" px={4}>
        <ChartComponent
          type="line"
          title="Products Added Trend"
          data={dummyTrendData}
          options={{ responsive: true }}
        />
        <ChartComponent
          type="doughnut"
          title="Top 5 Products by Stock"
          data={dummyTopStockData}
          options={{ responsive: true }}
        />
      </Flex>
    </>
  );
}

export default ProductHome;
