import React, { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import Productbox from "./Productbox";
import KYCApproval from "./KYCApproval";
import ProductBarchart from "./ProductBarchart";
import PaymentApprovals from "./PaymentApprovals";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import axios from "axios";
import PageSkeleton from "@/components/SkeletonLoaders/PageSkeleton";
import LowStockAlerts from "./LowStockAlerts";

function HomePage() {
  const hour = new Date().getHours();
  let wish;
  const user = JSON.parse(localStorage.getItem("user"));

  if (hour < 12) {
    wish = "Good Morning";
  } else if (hour < 18) {
    wish = "Good Afternoon";
  } else {
    wish = "Good Evening";
  }

  // Backend

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [successful, setSuccessful] = useState();

  const formData = new FormData();

  const [products, setProducts] = useState();
  const [paymentsApprovals, setPaymentsApprovals] = useState();
  const [topPerformingBOs, setTopPerformingBOs] = useState();
  const [kycApprovals, setKycApprovals] = useState();
  const [lowStock, setLowStock] = useState();
  const [orderStatuses, setOrderStatuses] = useState();

  // formData.append("roleName", );

  const VITE_API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/dashboard/home");
        console.log("Dashboard Home Response:", res.data);

        // Map the new backend response structure
        setKycApprovals(res.data.kycApprovals);
        setPaymentsApprovals(res.data.orderStatuses?.pendingPaymentApprovals);
        setTopPerformingBOs(res.data.topPerformingBOs);
        setProducts(res.data.topSellingProducts);
        setLowStock(res.data.lowStockAlerts);
        setOrderStatuses(res.data.orderStatuses);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load Dashboard.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, []);

  return (
    <>
      <div className="row m-0 p-0">
        <div className="col p-3">
          <h2 className={styles.wish}>
            Hello, {wish} {user?.name} !!
          </h2>
        </div>
      </div>
      <div className="row m-0 p-3 justify-content-around">
        <Productbox products={products} />
        <KYCApproval kycApprovals={kycApprovals} />

        <PaymentApprovals orderStatuses={orderStatuses} />
        <LowStockAlerts lowStockNotifications={lowStock} />
        <ProductBarchart topPerformingBOs={topPerformingBOs} />
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <PageSkeleton />}
    </>
  );
}

export default HomePage;
