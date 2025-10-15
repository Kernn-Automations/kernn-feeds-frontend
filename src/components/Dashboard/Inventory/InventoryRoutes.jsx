import React, { lazy, Suspense } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styles from "./Inventory.module.css";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";

// Lazy-loaded components
const InventoryHome = lazy(() => import("./InventoryHome"));
const IncomingStock = lazy(() => import("./IncomingStock"));
const OutgoingStock = lazy(() => import("./OutgoingStock"));
const StockSummary = lazy(() => import("./StockSummary"));
const CurrentStock = lazy(() => import("./CurrentStock"))
const DamagedGoods = lazy(() => import("./DamagedGoods"));
const ManualStockManagement = lazy(() => import("./ManualStockManagement"));
const ManualStockAPITest = lazy(() => import("./ManualStockAPITest"));

function InventoryRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            <InventoryHome navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/incoming-stock"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <IncomingStock navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/outgoing-stock"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <OutgoingStock navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/current-stock"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CurrentStock navigate={navigate} />
          </Suspense>
        }
      />
      
      <Route
        path="/stock-summary"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <StockSummary navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/damaged-goods"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <DamagedGoods navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/manage-stock"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <ManualStockManagement navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/manage-stock-test"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <ManualStockAPITest navigate={navigate} />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default InventoryRoutes;
