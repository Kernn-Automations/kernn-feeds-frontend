import React from "react";
import styles from "./Dashboard.module.css";
import Logout from "./Logout";
import SalesPage from "./SalesSalesTab/SalesPage";
import SalesRoutesPage from "./SalesRoutes/SalesRoutesPage";
import VendorsPage from "./SalesVendors/VendorsPage";
import { Route, Routes } from "react-router-dom";
function SalesTabs({ tab, setTab }) {
  return (
    <div className={`col ${styles.tabs}`}>
      {/* {tab === "home" && <p>Sales Home</p>}
      {tab === "attendance" &&  <p>Attendance</p>}
      {tab === "leave" &&  <p>leave</p>}
      {tab === "tasks" &&  <p>Tasks</p>}
      {tab === "location" &&  <p>Locations</p>}
      {tab === "apps" &&  <p>Applications</p>}
      {tab === "profile" &&  <p>Profile</p>}
      {tab === "indents" &&  <p>Indents</p>}
      {tab === "routes" &&  <SalesRoutesPage/>}
      {tab === "emp" &&  <p>Employess</p>}
      {tab === "contracts" &&  <p>Contracts</p>}
      {tab === "sales" &&  <SalesPage/>}
      {tab === "vendors" && <VendorsPage/>}
      {tab === "reimbursement" && <p>Reimbursement</p>} */}

      <Routes>
        <Route index element={<p>Sales Home</p>} />
        <Route path="/attendance/*" element={<p>Attendance</p>} />
        <Route path="/leave/*" element={<p>Leave</p>} />
        <Route path="/tasks/*" element={<p>tasks</p>} />
        <Route path="/location/*" element={<p>Location</p>} />
        <Route path="/apps/*" element={<p>Application</p>} />
        <Route path="/profile/*" element={<p>Profile</p>} />
        <Route path="/indents/*" element={<p>Indents</p>} />
        <Route path="/routes/*" element={<SalesRoutesPage />} />
        <Route path="/employees/*" element={<p>Employess</p>} />
        <Route path="/contracts/*" element={<p>Contracts</p>} />
        <Route path="/sales/*" element={<SalesPage />} />
        <Route path="/dealers/*" element={<VendorsPage />} />
        <Route path="/reimbursement/*" element={<p>Reimbursement</p>} />
      </Routes>
    </div>
  );
}

export default SalesTabs;
