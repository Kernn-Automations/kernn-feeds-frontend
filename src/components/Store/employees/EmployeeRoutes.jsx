import React, { lazy, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import PageSkeleton from "@/components/SkeletonLoaders/PageSkeleton";

const StoreEmployeesHome = lazy(() => import("./StoreEmployeesHome"));
const EmployeesList = lazy(() => import("./EmployeesList"));
const EmployeeDetailsPage = lazy(() => import("./EmployeeDetailsPage"));

export default function EmployeeRoutes() {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            <StoreEmployeesHome />
          </Suspense>
        }
      />
      <Route
        path="/list"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <EmployeesList />
          </Suspense>
        }
      />
      <Route
        path="/:id"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <EmployeeDetailsPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

