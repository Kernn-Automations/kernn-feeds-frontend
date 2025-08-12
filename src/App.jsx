// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Auth";              // <-- just the hook
import "./App.css";
import { lazy, Suspense } from "react";
import DashboardSkeleton from "./components/SkeletonLoaders/DashboardSkeleton";
import LoginSkeleton     from "./components/SkeletonLoaders/LoginSkeleton";


// lazy imports
const Dashboard      = lazy(() => import("./components/Dashboard/Dashboard"));
const Login          = lazy(() => import("./components/Login"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const Divs           = lazy(() => import("./pages/Divs"));

// Import all the route components
const InventoryRoutes = lazy(() => import("./components/Dashboard/Inventory/InventoryRoutes"));
const PurchaseRoutes  = lazy(() => import("./components/Dashboard/Purchases/PurchaseRoutes"));
const SalesRoutes     = lazy(() => import("./components/Dashboard/Sales/SalesRoutes"));
const CustomerRoutes  = lazy(() => import("./components/Dashboard/Customers/CustomerRoutes"));
const PaymentRoutes   = lazy(() => import("./components/Dashboard/Payments/PaymentRoutes"));
const EmployeeRoutes  = lazy(() => import("./components/Dashboard/Employees/EmployeeRoutes"));
const WarehouseRoutes = lazy(() => import("./components/Dashboard/Warehouses/WarehouseRoutes"));
const ProductRoutes   = lazy(() => import("./components/Dashboard/Products/ProductRoutes"));
const LocationsHome   = lazy(() => import("./components/Dashboard/Locations/LocationsHome"));
const InvoiceRoutes   = lazy(() => import("./components/Dashboard/Invoice/InvoiceRoutes"));
const StockRoutes     = lazy(() => import("./components/Dashboard/StockTransfer/StockRoutes"));
const DiscountRoutes  = lazy(() => import("./components/Dashboard/Discounts/DiscountRoutes"));
const DivisionManager = lazy(() => import("./components/Dashboard/DivisionManager"));
const HomePage        = lazy(() => import("./components/Dashboard/HomePage/HomePage"));
const SettingRoutes   = lazy(() => import("./components/Dashboard/SettingsTab/SettingRoutes"));



export default function App() {
  const { islogin, setIslogin } = useAuth();
  const token = localStorage.getItem("accessToken");

  // restore your old islogin logic
  useEffect(() => {
    console.log('App.jsx - Token changed:', token ? 'EXISTS' : 'MISSING');
    console.log('App.jsx - Current pathname:', window.location.pathname);
    
    // Only set login state if we're not already on a protected route
    if (window.location.pathname === '/login') {
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

      <Route path="/divs" element={<Divs />} />
      
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
        
        {/* <Route path="/inventory/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <InventoryRoutes />
          </Suspense>
        } />
        
        <Route path="/purchases/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <PurchaseRoutes />
          </Suspense>
        } />
        
        <Route path="/sales/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <SalesRoutes />
          </Suspense>
        } />
        
        <Route path="/invoices/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <InvoiceRoutes />
          </Suspense>
        } />
        
        <Route path="/customers/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <CustomerRoutes />
          </Suspense>
        } />
        
        <Route path="/payments/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <PaymentRoutes />
          </Suspense>
        } />
        
        <Route path="/stock-transfer/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <StockRoutes />
          </Suspense>
        } />
        
        <Route path="/employees/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <EmployeeRoutes />
          </Suspense>
        } />
        
        <Route path="/discounts/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <DiscountRoutes />
          </Suspense>
        } />
        
        <Route path="/location/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <LocationsHome />
          </Suspense>
        } />
        
        <Route path="/warehouses/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <WarehouseRoutes />
          </Suspense>
        } />
        
        <Route path="/products/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <ProductRoutes />
          </Suspense>
        } />
        
        <Route path="/settings/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <SettingRoutes />
          </Suspense>
        } /> */}
        
        <Route path="/divisions" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <DivisionManager />
          </Suspense>
        } />
        
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}