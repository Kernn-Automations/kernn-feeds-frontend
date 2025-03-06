import React from "react";
import styles from "./Dashboard.module.css";
import VLApage from "./FinanceVLAs/VLApage";
import Productionpage from "./FinanceProduction/ProductionPage";
import Salespage from "./FinanceSales/SalesPage";
import { Route, Routes } from "react-router-dom";

function FinanceTabs({ tab, setTab }) {
  return (
    <div className={`col ${styles.tabs}`}>
      {/* {tab === "home" && <p>Finance Home</p>}
      {tab === "attendance" && <p>Attendance</p>}
      {tab === "leave" && <p>leave</p>}
      {tab === "vlas" && <VLApage />}
      {tab === "production" && <Productionpage />}
      {tab === "sales" && <Salespage />}
      {tab === "reimbursement" && <p>Reimbursement</p>}
      {tab === "apps" && <p>Application</p>} */}

      <Routes>
     <Route index element={<p>Finance Home</p>}/>
     <Route path="/attendance" element={<p>Attendance</p>}/>
     <Route path="/leave" element={<p>leave</p>}/>
     <Route path="/vlas" element={<VLApage />}/>
     <Route path="/production" element={<Productionpage />}/>
     <Route path="/sales" element={<Salespage />}/>
     <Route path="/reimbursement" element={<p>Reimbursement</p>}/>
     <Route path="/apps" element={<p>Application</p>}/>
      </Routes>
    </div>
  );
}

export default FinanceTabs;
