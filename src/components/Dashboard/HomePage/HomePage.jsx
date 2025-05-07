import React, { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import Productbox from "./Productbox";
import KYCApproval from "./KYCApproval";
import ProductBarchart from "./ProductBarchart";
import PaymentApprovals from "./PaymentApprovals";
import ProductLineChart from "./ProductLineChart";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import axios from "axios";
import PageSkeleton from "@/components/SkeletonLoaders/PageSkeleton";

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
  const [salesAnalysis, setSalesAnalysis] = useState();
  const [kycApprovals, setKycApprovals] = useState();

  // formData.append("roleName", );

  const VITE_API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${VITE_API}/employees/dashboard`,

          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              roleName: user.roles[0].name,
            },
          }
        );
        console.log(res);

        setKycApprovals(res.data.dashboard.kycApprovals);
        setPaymentsApprovals(res.data.dashboard.paymentApprovals);
        setSalesAnalysis(res.data.dashboard.salesAnalysis);
        setTopPerformingBOs(res.data.dashboard.topPerformingBOs);
        setProducts(res.data.dashboard.topSellingProducts);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load Dashboard.");
        setIsModalOpen(true);
        console.log(err);
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
            Hello, {wish} {user.name} !!
          </h2>
        </div>
      </div>
      <div className="row m-0 p-3 justify-content-around">
        <Productbox products={products} />
        <KYCApproval kycApprovals={kycApprovals} />

        <PaymentApprovals paymentsApprovals={paymentsApprovals} />
        <ProductBarchart topPerformingBOs={topPerformingBOs} />
        <ProductLineChart salesAnalysis={salesAnalysis} />
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <PageSkeleton />}
    </>
  );
}

export default HomePage;
