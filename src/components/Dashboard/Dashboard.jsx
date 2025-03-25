import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import NavContainer from "./navs/NavContainer";
import DashHeader from "./DashHeader";
import FootLink from "./FootLink";

import { useAuth } from "../../Auth";

import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage/HomePage";
import InventoryRoutes from "./Inventory/InventoryRoutes";
import PurchaseRoutes from "./Purchases/PurchaseRoutes";
import SalesRoutes from "./Sales/SalesRoutes";
import CustomerRoutes from "./Customers/CustomerRoutes";
import PaymentRoutes from "./Payments/PaymentRoutes";
import EmployeeRoutes from "./Employees/EmployeeRoutes";
import WarehouseRoutes from "./Warehouses/WarehouseRoutes";
import ProductRoutes from "./Products/ProductRoutes";
import LocationsHome from "./Locations/LocationsHome";
import AnnouncementHome from "./Annoucement/AnnouncementHome";
import TicketingService from "./TicketService/TicketingService";

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
    console.log(hover);
  };
  const onmouseleave = () => {
    setHover(false);
    setStyle("navcont");
  };

  // useEffect(() => {
  //   async function fetch() {
  //     try {
  //       const res = await axiosAPI.post("/employees/mdashboard");
  //       console.log(res);

  //       setLeavebalance(res.data.data.leaveBalances);
  //       setNotifications(res.data.data.latestNotifications);
  //       setPendingtasks(res.data.data.pendingTasks);
  //       setDashboard(res.data.data);
  //     } catch (e) {
  //       console.log(e);
  //       removeLogin();
  //     }
  //   }

  //   fetch();
  // }, []);

  console.log(leavebalance);
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
                      <Route index element={<HomePage />} />
                      <Route
                        path="/inventory/*"
                        element={<InventoryRoutes />}
                      />
                      <Route path="/purchases/*" element={<PurchaseRoutes />} />
                      <Route path="/sales/*" element={<SalesRoutes />} />
                      <Route path="/customers/*" element={<CustomerRoutes/>} />
                      <Route path="/payments/*" element={<PaymentRoutes/>} />
                      <Route path="/employees/*" element={<EmployeeRoutes/>} />
                      <Route path="/location/*" element={<LocationsHome/>} />
                      <Route path="/warehouses/*" element={<WarehouseRoutes/>} />
                      <Route path="/products/*" element={<ProductRoutes/>} />
                      <Route path="/announcement/*" element={<AnnouncementHome/>} />
                    </Routes>
                    <Outlet />
                  </div>
                
              </div>
            </div>
          </div>
          <FootLink />
          <TicketingService/>
        </>
      )}

      {admin === true && <Navigate to="/admin" />}
    </>
  );
}
export default Dashboard;
