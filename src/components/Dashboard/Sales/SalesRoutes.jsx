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

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
     .toISOString()
     .slice(0, 10);
 
   const today = new Date(Date.now()).toISOString().slice(0, 10);
 
   const [from, setFrom] = useState(date);
   const [to, setTo] = useState(today);

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
              from={from}
              setFrom={setFrom}
              to={to}
              setTo={setTo}
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
