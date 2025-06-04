import React, { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styles from "./Sales.module.css";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";
import { useAuth } from "@/Auth";
import TrackingPage from "./TrackingPage";

// Lazy-loaded components
const SalesHome = lazy(() => import("./SalesHome"));
const Orders = lazy(() => import("./Orders"));
const Dispaches = lazy(() => import("./Dispaches"));
const Deliveries = lazy(() => import("./Deliveries"));

function SalesRoutes() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState();
  const [warehouses, setWarehouses] = useState();
  const [orderId, setOrderId] = useState(null);

  const { axiosAPI } = useAuth();

  useEffect(() => {
    async function fetch() {
      try {
        const res1 = await axiosAPI.get("/warehouse");
        const res2 = await axiosAPI.get("/customers");

        // console.log(res1);
        // console.log(res2);

        setWarehouses(res1.data.warehouses);
        setCustomers(res2.data.customers);
      } catch (e) {
        // console.log(e);
      }
    }
    fetch();
  }, []);

  return (
    <Routes>
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            {/* <SalesHome
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            /> */}
            <Orders
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
              setOrderId={setOrderId}
            />
          </Suspense>
        }
      />
      <Route
        path="/orders"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <Orders
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
          </Suspense>
        }
      />
      <Route
        path="/dispatches"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <Dispaches
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
          </Suspense>
        }
      />
      <Route
        path="/deliveries"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <Deliveries
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
          </Suspense>
        }
      />
      <Route
        path="/tracking"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <TrackingPage
              navigate={navigate}
              setOrderId={setOrderId}
              orderId={orderId}
            />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default SalesRoutes;
