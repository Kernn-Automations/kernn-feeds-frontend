import React, { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import { useAuth } from "@/Auth";
import LoadingAnimation from "@/components/LoadingAnimation";
import salesAni from "../../../images/animations/fetchingAnimation.gif";

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
        setError(err?.response?.data?.message || "Failed to load sales dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchSalesDashboard();
  }, []);

  // Transform backend array for Chart.js
  const trend = salesData?.salesTrend || [];
  const trendData = {
    labels: trend.map(item => item.month || item.label || item.date || ""),
    datasets: [
      {
        label: "Sales",
        data: trend.map(item => item.amount ?? item.value ?? item.sales ?? 0),
        backgroundColor: "rgba(42,77,155,0.1)",
        borderColor: "#2a4d9b",
        fill: true,
        tension: 0.3,
      }
    ]
  };

  // Transform salesByProduct for doughnut chart
  const productTrend = salesData?.salesByProduct || [];
  const productData = {
    labels: productTrend.map(item => item.product || item.name || ""),
    datasets: [
      {
        label: "Sales",
        data: productTrend.map(item => item.amount ?? item.sales ?? 0),
        backgroundColor: [
          "#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b", "#858796",
          "#ff6384", "#36a2eb", "#cc65fe", "#ffce56"
        ],
      }
    ]
  };

  return (
    <>
      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={salesAni} msg="Loading sales dashboard..." />}

      {!loading && (
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
            <ReusableCard 
              title="Total Orders" 
              value={salesData?.totalOrders || "320"} 
            />
            <ReusableCard 
              title="Pending Orders" 
              value={salesData?.pendingOrders || "15"} 
              color="yellow.500" 
            />
            <ReusableCard 
              title="Cancelled Orders" 
              value={salesData?.cancelledOrders || "8"} 
              color="red.500" 
            />
            <ReusableCard 
              title="This Month Sales" 
              value={`₹${Number(salesData?.thisMonthSales ?? 0).toLocaleString("en-IN")}`} 
              color="green.500" 
            />
          </Flex>

          {/* Charts */}
          <Flex wrap="wrap" px={4}>
            {trendData.labels && trendData.labels.length > 0 && trendData.datasets && trendData.datasets[0] && trendData.datasets[0].data && trendData.datasets[0].data.length > 0 && (
              <ChartComponent
                type="line"
                title="Sales Trend"
                data={trendData}
                options={{ responsive: true }}
              />
            )}
            {productData.labels && productData.labels.length > 0 && productData.datasets && productData.datasets[0] && productData.datasets[0].data && productData.datasets[0].data.length > 0 && (
                          <ChartComponent
              type="doughnut"
              title="Sales by Product"
              data={productData}
              options={{ responsive: true }}
              legendPosition="left"
            />
            )}
          </Flex>
        </>
      )}
    </>
  );
}

export default SalesHome;
