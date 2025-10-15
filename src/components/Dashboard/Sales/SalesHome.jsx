import React, { useEffect, useState, useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import styles from "../Dashboard.module.css";
import SalesPieChart from "./SalesPieChart";

function SalesHome({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSalesDashboard() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/dashboard/sales");
        console.log("Sales Dashboard Response:", res.data);
        setSalesData(res.data);
      } catch (err) {
        console.error("Sales dashboard fetch error:", err);
        setError(
          err?.response?.data?.message || "Failed to load sales dashboard"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSalesDashboard();
  }, []);

  // Transform backend array for Chart.js
  const trendData = useMemo(() => {
    if (!salesData?.salesTrend || !Array.isArray(salesData.salesTrend)) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Sales ₹",
            data: [0, 0, 0, 0, 0, 0],
            borderColor: "#2a4d9b",
            backgroundColor: "rgba(42,77,155,0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      };
    }

    const labels = salesData.salesTrend.map(
      (item) => item.month || item.label || item.date || ""
    );
    const data = salesData.salesTrend.map(
      (item) => item.amount ?? item.value ?? item.sales ?? 0
    );

    return {
      labels,
      datasets: [
        {
          label: "Sales ₹",
          data,
          borderColor: "#2a4d9b",
          backgroundColor: "rgba(42,77,155,0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [salesData?.salesTrend]);

  // Transform salesByProduct for doughnut chart
  const productData = useMemo(() => {
    if (
      !salesData?.salesByProduct ||
      !Array.isArray(salesData.salesByProduct)
    ) {
      return {
        labels: ["No Products"],
        datasets: [
          {
            label: "₹",
            data: [0],
            backgroundColor: ["#4e73df"],
          },
        ],
      };
    }

    const labels = salesData.salesByProduct.map(
      (item) => item.product || item.name || ""
    );
    const data = salesData.salesByProduct.map(
      (item) => item.amount ?? item.sales ?? 0
    );

    return {
      labels,
      datasets: [
        {
          label: "₹",
          data,
          backgroundColor: [
            "#4e73df",
            "#1cc88a",
            "#36b9cc",
            "#f6c23e",
            "#e74a3b",
            "#858796",
            "#ff6384",
            "#36a2eb",
            "#cc65fe",
            "#ffce56",
          ],
        },
      ],
    };
  }, [salesData?.salesByProduct]);

  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="container-fluid" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row m-0 p-3">
            <div className="col text-center">
              <div className="alert alert-danger">
                <strong>Error loading sales dashboard</strong>
                <br />
                <small>{error}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buttons - Always visible */}
      <div className="row m-0 p-3">
        <div className="col">
          <button
            className="homebtn"
            onClick={() => navigate("/sales/orders/new")}
          >
            + New Sales Order
          </button>
          <button className="homebtn" onClick={() => navigate("/sales/orders")}>
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
        <ReusableCard
          title="Total Orders"
          value={salesData?.totalOrders || (loading ? <Loading /> : "0")}
        />
        <ReusableCard
          title="Pending Orders"
          value={salesData?.pendingOrders || (loading ? <Loading /> : "0")}
          color="yellow.500"
        />
        <ReusableCard
          title="Cancelled Orders"
          value={salesData?.cancelledOrders || (loading ? <Loading /> : "0")}
          color="red.500"
        />
        <ReusableCard
          title="This Month Sales"
          value={
            loading ? (
              <Loading />
            ) : (
              `₹${Number(salesData?.thisMonthSales ?? 0).toLocaleString("en-IN")}`
            )
          }
          color="green.500"
        />
      </Flex>

      {/* Charts */}
      <div className={styles["charts-grid"]}>
        {trendData.labels &&
          trendData.labels.length > 0 &&
          trendData.datasets &&
          trendData.datasets[0] &&
          trendData.datasets[0].data &&
          trendData.datasets[0].data.length > 0 && (
            <ChartComponent
              type="line"
              title="Sales Trend"
              data={trendData}
              options={{ responsive: true }}
            />
          )}
        {productData.labels &&
          productData.labels.length > 0 &&
          productData.datasets &&
          productData.datasets[0] &&
          productData.datasets[0].data &&
          productData.datasets[0].data.length > 0 && (
            <ChartComponent
              type="doughnut"
              title="Sales by Product"
              data={productData}
              options={{ responsive: true }}
              legendPosition="left"
            />
          )}
      </div>
      <SalesPieChart />
    </>
  );
}

export default SalesHome;
