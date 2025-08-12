import React, { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import { useAuth } from "@/Auth";
import LoadingAnimation from "@/components/LoadingAnimation";
import stockAni from "../../../images/animations/fetchingAnimation.gif";

function StockHome({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStockDashboard() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/dashboard/stock-transfer");
        console.log("Stock Transfer Dashboard Response:", res.data);
        setStockData(res.data);
      } catch (err) {
        console.error("Stock transfer dashboard fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load stock transfer dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchStockDashboard();
  }, []);

  // Transform backend data for Chart.js
  const trendData = {
    labels: (stockData?.transfersTrend ?? []).map(item => item.month),
    datasets: [
      {
        label: "Transfers",
        data: (stockData?.transfersTrend ?? []).map(item => item.count ?? 0),
        backgroundColor: "#4F8EF7"
      }
    ]
  };
  const productData = {
    labels: (stockData?.topProductsTransferred ?? []).map(item => item.product),
    datasets: [
      {
        label: "Quantity",
        data: (stockData?.topProductsTransferred ?? []).map(item => item.quantity ?? 0),
        backgroundColor: "#F7B32B"
      }
    ]
  };

  return (
    <>
      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={stockAni} msg="Loading stock transfer dashboard..." />}

      {!loading && (
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
            <ReusableCard 
              title="Transfers This Month" 
              value={stockData?.transfersThisMonth } 
            />
            <ReusableCard 
              title="From Central WH" 
              value={stockData?.fromCentralWH } 
              color="blue.500" 
            />
            <ReusableCard 
              title="From Regional WH" 
              value={stockData?.fromLocalWH } 
              color="purple.500" 
            />
            <ReusableCard 
              title="Total Quantity" 
              value={stockData?.totalQuantity } 
              color="green.500" 
            />
          </Flex>

          {/* Charts */}
          <Flex wrap="wrap" px={4}>
            {trendData.labels.length > 0 && trendData.datasets[0].data.length > 0 && (
              <ChartComponent
                type="bar"
                title="Transfers Trend"
                data={trendData}
                options={{ responsive: true }}
              />
            )}
            {productData.labels.length > 0 && productData.datasets[0].data.length > 0 && (
              <ChartComponent
                type="bar"
                title="Top Products Transferred"
                data={productData}
                options={{ responsive: true }}
              />
            )}
          </Flex>
        </>
      )}
    </>
  );
}

export default StockHome;
