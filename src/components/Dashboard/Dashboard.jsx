// src/components/Dashboard/Dashboard.jsx

import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import styles from "./Dashboard.module.css";
import NavContainer from "./navs/NavContainer";
import DashHeader from "./DashHeader";
import FootLink from "./FootLink";

import { useAuth } from "../../Auth";
import { useDivision } from "../context/DivisionContext";
import DivisionSelector from "./DivisionSelector";
import { fetchWithDivision } from "../../utils/fetchWithDivision";

// Local skeletons
import PageSkeleton from "../SkeletonLoaders/PageSkeleton";
import RouteSkeleton from "../SkeletonLoaders/RouteSkeleton";
import TicketingService from "./TicketService/TicketingService";
import SettingRoutes from "./SettingsTab/SettingRoutes";

// Lazy-loaded Routes
const WelcomePage     = lazy(() => import("../WelcomePage.jsx"));
const HomePage        = lazy(() => import("./HomePage/HomePage"));
const InventoryRoutes = lazy(() => import("./Inventory/InventoryRoutes"));
const PurchaseRoutes  = lazy(() => import("./Purchases/PurchaseRoutes"));
const SalesRoutes     = lazy(() => import("./Sales/SalesRoutes"));
const CustomerRoutes  = lazy(() => import("./Customers/CustomerRoutes"));
const PaymentRoutes   = lazy(() => import("./Payments/PaymentRoutes"));
const EmployeeRoutes  = lazy(() => import("./Employees/EmployeeRoutes"));
const WarehouseRoutes = lazy(() => import("./Warehouses/WarehouseRoutes"));
const ProductRoutes   = lazy(() => import("./Products/ProductRoutes"));
const LocationsHome   = lazy(() => import("./Locations/LocationsHome"));
const InvoiceRoutes   = lazy(() => import("./Invoice/InvoiceRoutes"));
const StockRoutes     = lazy(() => import("./StockTransfer/StockRoutes"));
const DiscountRoutes  = lazy(() => import("./Discounts/DiscountRoutes"));
const DivisionManager = lazy(() => import("./DivisionManager"));

export default function Dashboard({
  admin,
  setAdmin,
  role,
  dept,
  setRoleclick,
  setBtnclick,
  orgadmin,
}) {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const { axiosAPI, removeLogin } = useAuth();
  const {
    user: divisionUser,
    selectedDivision,
    showAllDivisions,
  } = useDivision();

  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        // Extract division ID from the selectedDivision object
        const divisionId = selectedDivision?.id || null;
        
        console.log('Dashboard - selectedDivision object:', selectedDivision);
        console.log('Dashboard - extracted divisionId:', divisionId);
        
        const data = await fetchWithDivision(
          "/employees",
          localStorage.getItem("accessToken"),
          divisionId, // Pass the ID, not the object
          showAllDivisions
        );
        setEmployees(data.data || []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    loadEmployees();
  }, [selectedDivision, showAllDivisions]);

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

  // 🔧 Admin routing logic fix
  if (admin === true) {
    return <Navigate to="/admin" />;
  }

  return (
    <>
      <DivisionSelector userData={storedUser} />

      <div className="container-fluid py-0 my-0">
        <div className="row py-0 my-0 pr-0">
          <div
            className={`col ${styles[style]}`}
            onMouseOver={onmouseover}
            onMouseLeave={onmouseleave}
          >
            <NavContainer
              hover={hover}
              onmouseover={onmouseover}
              onmouseleave={onmouseleave}
              style={style}
              setTab={setTab}
              tab={tab}
              admin={admin}
              orgadmin={orgadmin}
            />
          </div>

          <div className="col p-0">
            <div className={`row p-0 ${styles.headline}`}>
              <DashHeader
                notifications={null}
                user={storedUser}
                setRoleclick={setRoleclick}
                setBtnclick={setBtnclick}
                setTab={setTab}
                admin={admin}
                setAdmin={setAdmin}
                orgadmin={orgadmin}
              />
            </div>

            <div className={`col ${styles.tabs}`}>
              <Routes>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <HomePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/inventory/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <InventoryRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/purchases/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <PurchaseRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/sales/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <SalesRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/invoices/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <InvoiceRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/customers/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <CustomerRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/payments/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <PaymentRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/stock-transfer/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <StockRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/employees/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <EmployeeRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/discounts/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <DiscountRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/locations/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <LocationsHome />
                    </Suspense>
                  }
                />
                <Route
                  path="/warehouses/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <WarehouseRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/products/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <ProductRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/settings/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <SettingRoutes />
                    </Suspense>
                  }
                />
                <Route
                  path="/divisions/*"
                  element={
                    <Suspense fallback={<RouteSkeleton />}>
                      <DivisionManager />
                    </Suspense>
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </div>

      <FootLink />
      <TicketingService />
    </>
  );
}
