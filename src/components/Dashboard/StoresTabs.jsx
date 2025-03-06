import React from "react";
import styles from "./Dashboard.module.css";
import Logout from "./Logout";
import StorePage from "./StoresStoreTab/StorePage";
import DepartmentPage from "./StoresDepartment/DepartmentPage";
import StoresIndentPage from "./StoresIndent/StoresIndentPage";
import StoreContractsPage from "./StoreContracts/StoreContractsPage";
import StorePaymentsPage from "./StorePayments/StorePaymentsPage";
import { Route, Routes } from "react-router-dom";

function StoresTabs({ tab, setTab }) {
  return (
    <div className={`col ${styles.tabs}`}>
      {/* {tab === "home" && <p>Sales Home</p>}
      {tab === "attendance" &&  <p>Attendance</p>}
      {tab === "leave" &&  <p>leave</p>}
      {tab === "stores" &&  <StorePage/>}
      {tab === "department" &&  <DepartmentPage/>}
      {tab === "indents" &&  <StoresIndentPage/>}
      {tab === "contracts" &&  <StoreContractsPage/>}
      {tab === "bills" &&  <StorePaymentsPage/>}
      {tab === "emp" &&  <p>Employess</p>}
      {tab === "profile" &&  <p>Profile</p>}
      {tab === "apps" && <p>Applications</p>}
      {tab === "reimbursement" && <p>Reimbursement</p>} */}

      <Routes>
        <Route index element={<p>Sales Home</p>} />
        <Route path="/attendance/*" element={<p>Attendance</p>} />
        <Route path="/leave/*" element={<p>leave</p>} />
        <Route path="/stores/*" element={<StorePage />} />
        <Route path="/department/*" element={<DepartmentPage />} />
        <Route path="/indents/*" element={<StoresIndentPage />} />
        <Route path="/contracts/*" element={<StoreContractsPage />} />
        <Route path="/bills/*" element={<StorePaymentsPage />} />
        <Route path="/employees/*" element={<p>Employess</p>} />
        <Route path="/profile/*" element={<p>Profile</p>} />
        <Route path="/apps/*" element={<p>Applications</p>} />
        <Route path="/reimbursement/*" element={<p>Reimbursement</p>} />
      </Routes>
    </div>
  );
}

export default StoresTabs;
