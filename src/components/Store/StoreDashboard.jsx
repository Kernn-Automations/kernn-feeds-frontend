import React, { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import styles from "../Dashboard/Dashboard.module.css";
import StoreDashHeader from "./StoreDashHeader";
import StoreNavContainer from "./StoreNavContainer";
import FootLink from "../Dashboard/FootLink";

const StoreHome = lazy(() => import("./StoreHome"));
const StoreSales = lazy(() => import("./sales/StoreSales"));
const StoreDamaged = lazy(() => import("./damaged/StoreDamaged"));
const StoreInventory = lazy(() => import("./inventory/StoreInventory"));
const StoreIndents = lazy(() => import("./indents/StoreIndents"));
const StoreCustomers = lazy(() => import("./customers/StoreCustomers"));
const StoreEmployees = lazy(() => import("./employees/StoreEmployees"));
const StoreProducts = lazy(() => import("./products/StoreProducts"));
const StoreDiscounts = lazy(() => import("./discounts/StoreDiscounts"));

export default function StoreDashboard() {
  const [hover, setHover] = useState(false);
  const [style, setStyle] = useState("navcont");
  const [tab, setTab] = useState("home");

  const onmouseover = () => {
    setHover(true);
    setStyle("navover");
  };
  const onmouseleave = () => {
    setHover(false);
    setStyle("navcont");
  };

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="container-fluid py-0 my-0">
      <div className="row py-0 my-0 pr-0">
        <div
          className={`col ${styles[style]}`}
          onMouseOver={onmouseover}
          onMouseLeave={onmouseleave}
        >
          <StoreNavContainer hover={hover} setTab={setTab} tab={tab} />
        </div>

        <div className="col p-0">
          <div className={`row p-0 ${styles.headline}`} style={{ left: hover ? 250 : 80.5, transition: 'left .2s ease' }}>
            <StoreDashHeader
              notifications={null}
              user={storedUser}
              setTab={setTab}
              admin={false}
              orgadmin={false}
            />
          </div>

          <div className={`col ${styles.tabs}`} style={{ marginLeft: hover ? 240 : 70, transition: 'margin-left .2s ease' }}>
            <Routes>
          <Route index element={<Suspense fallback={<div>Loading...</div>}><StoreHome /></Suspense>} />
          <Route path="sales" element={<Suspense fallback={<div>Loading...</div>}><StoreSales /></Suspense>} />
          <Route path="damaged" element={<Suspense fallback={<div>Loading...</div>}><StoreDamaged /></Suspense>} />
          <Route path="inventory" element={<Suspense fallback={<div>Loading...</div>}><StoreInventory /></Suspense>} />
          <Route path="indents" element={<Suspense fallback={<div>Loading...</div>}><StoreIndents /></Suspense>} />
          <Route path="customers" element={<Suspense fallback={<div>Loading...</div>}><StoreCustomers /></Suspense>} />
          <Route path="employees" element={<Suspense fallback={<div>Loading...</div>}><StoreEmployees /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<div>Loading...</div>}><StoreProducts /></Suspense>} />
          <Route path="discounts" element={<Suspense fallback={<div>Loading...</div>}><StoreDiscounts /></Suspense>} />
          <Route path="*" element={<Navigate to="/store" replace />} />
            </Routes>
          </div>
        </div>
      </div>
      <FootLink />
    </div>
  );
}


