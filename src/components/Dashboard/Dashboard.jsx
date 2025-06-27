import { lazy, Suspense, useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import NavContainer from "./navs/NavContainer";
import DashHeader from "./DashHeader";
import FootLink from "./FootLink";

import { useAuth } from "../../Auth";

import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import TicketingService from "./TicketService/TicketingService";
import PageSkeleton from "../SkeletonLoaders/PageSkeleton";
import RouteSkeleton from "../SkeletonLoaders/RouteSkeleton";
import SettingRoutes from "./SettingsTab/SettingRoutes";

// import HomePage from "./HomePage/HomePage";
// import InventoryRoutes from "./Inventory/InventoryRoutes";
// import PurchaseRoutes from "./Purchases/PurchaseRoutes";
// import SalesRoutes from "./Sales/SalesRoutes";
// import CustomerRoutes from "./Customers/CustomerRoutes";
// import PaymentRoutes from "./Payments/PaymentRoutes";
// import EmployeeRoutes from "./Employees/EmployeeRoutes";
// import WarehouseRoutes from "./Warehouses/WarehouseRoutes";
// import ProductRoutes from "./Products/ProductRoutes";
// import LocationsHome from "./Locations/LocationsHome";
// import AnnouncementHome from "./Annoucement/AnnouncementHome";

// Lazy-loaded Pages
const HomePage = lazy(() => import("./HomePage/HomePage"));
const InventoryRoutes = lazy(() => import("./Inventory/InventoryRoutes"));
const PurchaseRoutes = lazy(() => import("./Purchases/PurchaseRoutes"));
const SalesRoutes = lazy(() => import("./Sales/SalesRoutes"));
const CustomerRoutes = lazy(() => import("./Customers/CustomerRoutes"));
const PaymentRoutes = lazy(() => import("./Payments/PaymentRoutes"));
const EmployeeRoutes = lazy(() => import("./Employees/EmployeeRoutes"));
const WarehouseRoutes = lazy(() => import("./Warehouses/WarehouseRoutes"));
const ProductRoutes = lazy(() => import("./Products/ProductRoutes"));
const LocationsHome = lazy(() => import("./Locations/LocationsHome"));
const InvoiceRoutes = lazy(() => import("./Invoice/InvoiceRoutes"));
const StockRoutes = lazy(() => import("./StockTransfer/StockRoutes"));
const DiscountRoutes = lazy(() => import("./Discounts/DiscountRoutes"));
// const AnnouncementHome = lazy(() => import("./Annoucement/AnnouncementHome"));

function Dashboard({
  admin,
  setAdmin,
  role,
  dept,
  setRoleclick,
  setBtnclick,
  orgadmin,
}) {
  const user = JSON.parse(localStorage.getItem("user"));

  // const role = "production"
  // const role = "sales"
  // const role = "stores"

  if (dept) admin = false;
  // useEffect(() => {
  //   if (dept) {
  //     setAdmin(false);
  //   }
  // }, [dept]);

  const { axiosAPI, removeLogin } = useAuth();

  const [hover, setHover] = useState(false);

  const [style, setStyle] = useState("navcont");

  const [tab, setTab] = useState("home");

  const [leavebalance, setLeavebalance] = useState(null);

  const [notifications, setNotifications] = useState(null);

  const [pendingtasks, setPendingtasks] = useState(null);

  const [dashboard, setDashboard] = useState(null);

  const onmouseover = () => {
    setHover(true);
    setStyle("navover");
    // console.log(hover);
  };
  const onmouseleave = () => {
    setHover(false);
    setStyle("navcont");
  };

  // useEffect(() => {
  //   async function fetch() {
  //     try {
  //       const res = await axiosAPI.post("/employees/mdashboard");
  // console.log(res);

  //       setLeavebalance(res.data.data.leaveBalances);
  //       setNotifications(res.data.data.latestNotifications);
  //       setPendingtasks(res.data.data.pendingTasks);
  //       setDashboard(res.data.data);
  //     } catch (e) {
  // console.log(e);
  //       removeLogin();
  //     }
  //   }

  //   fetch();
  // }, []);

  // console.log(leavebalance);
  return (
    <>
      {admin === false && (
        <>
          <div className="container-fluid py-0 my-0">
            <div className="row py-0 my-0 pr-0">
              <div
                className={`col ${styles[style]}`}
                onMouseOver={onmouseover}
                onMouseLeave={onmouseleave}
              >
                <NavContainer
                  hover={hover}
                  setTab={setTab}
                  tab={tab}
                  role={role}
                  dept={dept}
                />
              </div>
              <div className="col p-0">
                <div className={`row p-0 ${styles.headline}`}>
                  <DashHeader
                    notifications={notifications}
                    user={user}
                    setRoleclick={setRoleclick}
                    setBtnclick={setBtnclick}
                    setTab={setTab}
                    admin={admin}
                    setAdmin={setAdmin}
                    orgadmin={orgadmin}
                  />
                </div>

                {/* // <div className={`col ${styles.tabs}`}>
                  //   {tab === "home" && ( */}
                {/* //     <HomePage */}
                {/* //       user={user}
                  //       leavebalance={leavebalance}
                  //       pendingtasks={pendingtasks}
                  //     />
                  //   )}
                  //   {tab === "attendance" && <AttendancePage />}
                  //   {tab === "leave" && <LeavePage />}
                  //   {tab === "tasks" && <TaskContainer />}
                  //   {tab === "location" && <LocationPage />}
                  //   {tab === "bmc" && <BMCPage />}
                  //   {tab === "apps" && <ApplicationsPage />}
                  //   {tab === "profile" && <ProfilePage />}
                  //   {tab === "indents" && <IndentsPage />}
                  //   {tab === "routes" && <RoutesPage />}
                  //   {tab === "emp" && <EmployeePage />}
                  //   {tab === "report" && <ReportsPage />}
                  //   {tab === "contracts" && <ContractsPage />}
                  //   {tab === "reimbursement" && <ReimbursementPage />}
                  // </div> */}
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
                      path="/location/*"
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
                    {/* <Route
                      path="/announcement/*"
                      element={
                        <Suspense fallback={<RouteSkeleton />}>
                          <AnnouncementHome />
                        </Suspense>
                      }
                    /> */}
                  </Routes>

                  <Outlet />
                </div>
              </div>
            </div>
          </div>
          <FootLink />
          <TicketingService />
        </>
      )}

      {admin === true && <Navigate to="/admin" />}
    </>
  );
}
export default Dashboard;
