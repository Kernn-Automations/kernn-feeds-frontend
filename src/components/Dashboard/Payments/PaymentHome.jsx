import React, { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "@/components/ReusableCard";
import ChartComponent from "@/components/ChartComponent";
import { useAuth } from "@/Auth";
import LoadingAnimation from "@/components/LoadingAnimation";
import paymentAni from "../../../images/animations/fetchingAnimation.gif";

function PaymentHome({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPaymentDashboard() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/dashboard/payments");
        console.log("Payment Dashboard Response:", res.data);
        setPaymentData(res.data);
      } catch (err) {
        console.error("Payment dashboard fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load payment dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchPaymentDashboard();
  }, []);

  // Transform paymentsTrend for Chart.js
  const trend = paymentData?.paymentsTrend || [];
  const trendData = {
    labels: trend.map(item => item.month || item.label || item.date || ""),
    datasets: [
      {
        label: "Payments",
        data: trend.map(item => item.amount ?? 0),
        backgroundColor: "rgba(42,77,155,0.1)",
        borderColor: "#2a4d9b",
        fill: true,
        tension: 0.3,
      }
    ]
  };

  // Transform paymentTypeDistribution for doughnut chart
  const typeDist = paymentData?.paymentTypeDistribution || [];
  const typeData = {
    labels: typeDist.map(item => item.type || item.label || ""),
    datasets: [
      {
        label: "Payments",
        data: typeDist.map(item => item.amount ?? 0),
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
      {loading && <LoadingAnimation gif={paymentAni} msg="Loading payment dashboard..." />}

      {!loading && (
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
            <ReusableCard 
              title="Total Payments This Month" 
              value={`₹${Number(paymentData?.totalPaymentsThisMonth ?? 0).toLocaleString("en-IN")}`} 
            />
            <ReusableCard 
              title="Pending Approvals" 
              value={paymentData?.pendingApprovals ?? 0} 
              color="yellow.500" 
            />
            <ReusableCard 
              title="Credit Notes Issued" 
              value={paymentData?.creditNotesIssued ?? 0} 
              color="green.500" 
            />
          </Flex>

          {/* Charts */}
          <Flex wrap="wrap" px={4}>
            {trendData.labels && trendData.labels.length > 0 && trendData.datasets && trendData.datasets[0] && trendData.datasets[0].data && trendData.datasets[0].data.length > 0 && (
              <ChartComponent
                type="bar"
                title="Payments Trend"
                data={trendData}
                options={{ responsive: true }}
              />
            )}
            {typeData.labels && typeData.labels.length > 0 && typeData.datasets && typeData.datasets[0] && typeData.datasets[0].data && typeData.datasets[0].data.length > 0 && (
              <ChartComponent
                type="doughnut"
                title="Payment Type Distribution"
                data={typeData}
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

export default PaymentHome;
