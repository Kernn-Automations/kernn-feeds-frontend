import React, { lazy, Suspense } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";

// Lazy-loaded components
const CustomerReports = lazy(() => import("./CustomerReports"));
const EmployeeReports = lazy(() => import("./EmployeeReports"));
const ReportsHome = lazy(() => import("./ReportsHome"));
const SalesReports = lazy(() => import("./SalesReports"));
const StockReports = lazy(() => import("./StockReports"));
const TargetReports = lazy(() => import("./TargetReports"));
const LedgerReports = lazy(() => import("./LedgerReports"));

function ReportsRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            <ReportsHome navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/customer-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CustomerReports navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/employee-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <EmployeeReports navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/sales-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <SalesReports navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/stock-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <StockReports navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/target-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <TargetReports navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/ledger-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <LedgerReports navigate={navigate} />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default ReportsRoutes;
