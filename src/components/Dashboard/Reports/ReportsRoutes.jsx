import React, { lazy, Suspense } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";

// Lazy-loaded components
const CustomerReports = lazy(() => import("./CustomerReports"));
const EmployeeReports = lazy(() => import("./EmployeeReports"));
const ReportsHome = lazy(() => import("./ReportsHome"));

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
        path="/customers-report"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CustomerReports />
          </Suspense>
        }
      />
      <Route
        path="/employee-reports"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <EmployeeReports />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default ReportsRoutes;
