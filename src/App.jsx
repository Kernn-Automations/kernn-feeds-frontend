// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Auth"; // <-- just the hook
import "./App.css";
import { lazy, Suspense } from "react";
import DashboardSkeleton from "./components/SkeletonLoaders/DashboardSkeleton";
import LoginSkeleton from "./components/SkeletonLoaders/LoginSkeleton";
import ReportsPage from "./components/UnauthReports/ReportsPage";

// lazy imports
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const Login = lazy(() => import("./components/Login"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const Divs = lazy(() => import("./pages/Divs"));
const StoreDashboard = lazy(() => import("./components/Store/StoreDashboard"));

export default function App() {
  const { islogin, setIslogin } = useAuth();
  const token = localStorage.getItem("accessToken");

  // restore your old islogin logic
  useEffect(() => {
    console.log("App.jsx - Token changed:", token ? "EXISTS" : "MISSING");
    console.log("App.jsx - Current pathname:", window.location.pathname);

    // Only set login state if we're not already on a protected route
    if (window.location.pathname === "/login") {
      setIslogin(!!token);
    } else if (token) {
      setIslogin(true);
    }
  }, [token, setIslogin]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<LoginSkeleton />}>
            <Login />
          </Suspense>
        }
      />

      <Route
        path="/daily-reports"
        element={
          <Suspense fallback={<LoginSkeleton />}>
            <ReportsPage />
          </Suspense>
        }
      />

      <Route path="/divs" element={<Divs />} />
      
      {/* Store Routes */}
      <Route path="/store/*" element={
        <Suspense fallback={<DashboardSkeleton />}>
          <StoreDashboard />
        </Suspense>
      } />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute token={token} />}>
        {/* Dashboard with nested routes */}
        <Route
          path="/*"
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <Dashboard />
            </Suspense>
          }
        />

        {/* Direct routes to different sections */}
        {/* <Route path="/home" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <HomePage />
          </Suspense>
        } /> */}

        {/* <Route path="/divisions" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <DivisionManager />
          </Suspense>
        } /> */}
      </Route>
    </Routes>
  );
}
