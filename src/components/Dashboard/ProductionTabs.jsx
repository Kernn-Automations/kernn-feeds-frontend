import React from 'react'
import styles from "./Dashboard.module.css";
import Logout from './Logout';
import ShiftsPage from './ProductionShifts/ShiftsPage';
import ProductionPage from './ProductionsProd/ProductionPage';
import DepartmentPage from './ProductionDepartment/DepartmentPage';
import { Route, Routes } from 'react-router-dom';
function ProductionTabs({tab, setTab}) {
  return (
    <div className={`col ${styles.tabs}`}>
    {/* {tab === "home" && <p>Production Home</p>}
    {tab === "attendance" && <p>Attendance</p>}
    {tab === "leave" && <p>Leave</p>}
    {tab === "apps" && <p>Application</p>}
    {tab === "profile" && <p>Profile</p>}
    {tab === "indents" && <p>Indents</p>}
    {tab === "shifts" && <ShiftsPage/>}
    {tab === "production" && <ProductionPage/>}
    {tab === "departments" && <DepartmentPage/>}
    {tab === "reimbursement" && <p>Reimbursement</p>}
    {tab === "milkcollection"} */}

    <Routes>
      <Route index element={<p>Production Home</p>}/>
      <Route path='/attendance' element={<p>Attendance</p>}/>
      <Route path='/leave' element={<p>Leave</p>}/>
      <Route path='/apps' element={<p>Application</p>}/>
      <Route path='/profile' element={<p>Profile</p>}/>
      <Route path='/indents' element={<p>Indents</p>}/>
      <Route path='/employees' element={<p>Employees</p>}/>
      <Route path='/shifts/*' element={<ShiftsPage/>}/>
      <Route path='/production/*' element={<ProductionPage/>}/>
      <Route path='/departments/*' element={<DepartmentPage/>}/>
      <Route path='/reimbursement' element={<p>Reimbursement</p>}/>  
    </Routes>
  </div>
  )
}

export default ProductionTabs
