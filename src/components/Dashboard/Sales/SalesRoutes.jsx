import React, { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styles from "./Sales.module.css";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";
import { useAuth } from "@/Auth";
import TrackingPage from "./TrackingPage";
import OrderTransferPage from "./OrderTransferPage";

// Lazy-loaded components
const SalesHome = lazy(() => import("./SalesHome"));
const Orders = lazy(() => import("./Orders"));
const Dispaches = lazy(() => import("./Dispaches"));
const Deliveries = lazy(() => import("./Deliveries"));
const CancelledOrders = lazy(() => import("./CancelledOrders")); 
const NewSalesOrder = lazy(() => import("./NewSalesOrder"));

function SalesRoutes() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState();
  const [warehouses, setWarehouses] = useState();
  const [orderId, setOrderId] = useState(null);
    const [managers, setManagers] = useState();

  const { axiosAPI } = useAuth();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const roles = user?.roles;
  const isAdmin = Array.isArray(roles)
    ? roles.includes("Admin")
    : (typeof roles === "string" ? roles.includes("Admin") : false);

  const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
     .toISOString()
     .slice(0, 10);
 
   const today = new Date(Date.now()).toISOString().slice(0, 10);
 
   const [from, setFrom] = useState(date);
   const [to, setTo] = useState(today);

  useEffect(() => {
    async function fetch() {
      try {
        const res1 = await axiosAPI.get("/warehouses");
        const res2 = await axiosAPI.get("/customers");

        // console.log(res1);
        // console.log(res2);

        setWarehouses(res1.data.warehouses);
        setCustomers(res2.data.customers);
        // setManagers(res.data.employees);
      } catch (e) {
        // console.log(e);
      }
    }
    fetch();
  }, []);

  return (
    <Routes>
      <Route index element={<Suspense fallback={<PageSkeleton />}>
            <SalesHome
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
            </Suspense>}
            />
      <Route
        path="/orders"
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
        path="/orders/new"
        element={<Suspense fallback={<PageSkeleton />}><NewSalesOrder navigate={navigate} warehouses={warehouses} customers={customers} /></Suspense>}
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
      <Route
          path="/order-transfer"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <OrderTransferPage navigate={navigate} managers={managers} />
            </Suspense>
          }
        />
        <Route
        path="/cancelled-order"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <CancelledOrders
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
              from={from}
              setFrom={setFrom}
              to={to}
              setTo={setTo}
            />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default SalesRoutes;
