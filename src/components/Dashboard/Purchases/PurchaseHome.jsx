import React, { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import { useAuth } from "@/Auth";
import LoadingAnimation from "@/components/LoadingAnimation";
import purchaseAni from "../../../images/animations/fetchingAnimation.gif";

function PurchaseHome({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPurchaseDashboard() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/dashboard/purchases");
        console.log("Purchase Dashboard Response:", res.data);
        setPurchaseData(res.data);
      } catch (err) {
        console.error("Purchase dashboard fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load purchase dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchPurchaseDashboard();
  }, []);

  // Transform backend data for Chart.js format
  const trendData = React.useMemo(() => {
    if (!purchaseData?.purchasesTrend || !Array.isArray(purchaseData.purchasesTrend)) {
      return {
        labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "Purchases ₹",
            data: [0, 0, 0, 0, 0, 0],
            borderColor: "#2a4d9b",
            backgroundColor: "rgba(42,77,155,0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      };
    }

    const labels = purchaseData.purchasesTrend.map(item => item.month);
    const data = purchaseData.purchasesTrend.map(item => item.amount);

    return {
      labels,
      datasets: [
        {
          label: "Purchases ₹",
          data,
          borderColor: "#2a4d9b",
          backgroundColor: "rgba(42,77,155,0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [purchaseData?.purchasesTrend]);

  const vendorData = React.useMemo(() => {
    if (!purchaseData?.purchasesByVendor || !Array.isArray(purchaseData.purchasesByVendor)) {
      return {
        labels: ["No Vendors"],
        datasets: [
          {
            label: "₹",
            data: [0],
            backgroundColor: ["#4e73df"],
          },
        ],
      };
    }

    const labels = purchaseData.purchasesByVendor.map(item => item.vendor);
    const data = purchaseData.purchasesByVendor.map(item => item.amount);

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
            "#ffce56"
          ],
        },
      ],
    };
  }, [purchaseData?.purchasesByVendor]);

  return (
    <>
      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={purchaseAni} msg="Loading purchase dashboard..." />}

      {!loading && (
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
            <ReusableCard 
              title="Total Purchase Orders" 
              value={purchaseData?.totalPurchaseOrders ?? "0"} 
            />
            <ReusableCard 
              title="Pending Deliveries" 
              value={purchaseData?.pendingDeliveries ?? "0"} 
              color="yellow.500" 
            />
            <ReusableCard 
              title="Vendors" 
              value={purchaseData?.vendors ?? "0"} 
              color="blue.500" 
            />
            <ReusableCard 
              title="This Month Spend" 
              value={`₹${Number(purchaseData?.thisMonthSpend ?? 0).toLocaleString("en-IN")}`} 
              color="green.500" 
            />
          </Flex>

          {/* Charts */}
          <Flex wrap="wrap" px={4}>
            {trendData && trendData.datasets && trendData.datasets[0] && trendData.datasets[0].data && trendData.datasets[0].data.length > 0 && (
              <ChartComponent
                type="line"
                title="Purchases Trend"
                data={trendData}
                options={{ responsive: true }}
              />
            )}
            {vendorData && vendorData.datasets && vendorData.datasets[0] && vendorData.datasets[0].data && vendorData.datasets[0].data.length > 0 && (
                          <ChartComponent
              type="doughnut"
              title="Purchases by Vendor"
              data={vendorData}
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

export default PurchaseHome;
