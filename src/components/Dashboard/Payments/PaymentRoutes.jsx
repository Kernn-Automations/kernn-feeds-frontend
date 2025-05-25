import React, { lazy, Suspense } from "react";
import styles from "./Payments.module.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";

// Lazy-loaded components
const PaymentHome = lazy(() => import("./PaymentHome"));
const PaymentReports = lazy(() => import("./PaymentReports"));
const PaymentApprovals = lazy(() => import("./PaymentApprovals"));

function PaymentRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            <PaymentHome navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/payment-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <PaymentReports navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/payment-approvals"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <PaymentApprovals navigate={navigate} />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default PaymentRoutes;
