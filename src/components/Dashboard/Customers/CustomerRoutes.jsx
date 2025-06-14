import React, { lazy, Suspense } from "react";
import styles from "./Customer.module.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import PageSkeleton from "@/components/SkeletonLoaders/PageSkeleton";
import CustomerReportsPage from "./CustomerReports";

// Lazy loaded components
const CustomerHome = lazy(() => import("./CustomerHome"));
const CustomerList = lazy(() => import("./CustomerList"));
const KYCApproval = lazy(() => import("./KYCApproval"));
const CreateCustomer = lazy(() => import("./CreateCustomer"));

function CustomerRoutes() {
  const navigate = useNavigate();

   const user = JSON.parse(localStorage.getItem("user"));

  const roles = JSON.stringify(user.roles);

  const isAdmin = roles.includes("Admin");

  return (
    <Routes>
     
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CustomerHome navigate={navigate} isAdmin={isAdmin} />
          </Suspense>
        }
      />
       <Route
        path="/create"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CreateCustomer navigate={navigate} isAdmin={isAdmin} />
          </Suspense>
        }
      />
      <Route
        path="/customer-list"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CustomerList navigate={navigate} isAdmin={isAdmin} />
          </Suspense>
        }
      />
      <Route
        path="/kyc-approvals"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <KYCApproval navigate={navigate} isAdmin={isAdmin} />
          </Suspense>
        }
      />
      <Route
        path="/reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CustomerReportsPage navigate={navigate} />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default CustomerRoutes;
