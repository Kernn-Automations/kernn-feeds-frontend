import React from 'react'
import styles from "./Dashboard.module.css";
import VLPHomePage from './VLPHome/VLPHomePage';
import MilkCollectionPage from './VLPMilkCollection/MilkCollectionPage';
import Logout from './Logout';
import VLPReportsPage from './VLPReports/VLPReportsPage';
import VLPBillPage from './VLPMilkBill/VLPBillPage';
import VLPPaymentsPage from './VLPPayments/VLPPaymentsPage';
import { Route, Routes } from 'react-router-dom';

function VLPTabs({tab, setTab, dashboard}) {
  return (
    <div className={`col ${styles.tabs}`}>
      {/* {tab === "home" && <VLPHomePage dashboard={dashboard}/>}
      {tab === "milkcollection" && <MilkCollectionPage/>}
      {tab === "reports" && <VLPReportsPage/>}
      {tab === "bill" && <VLPBillPage/>}
      {tab === "payments" && <VLPPaymentsPage/>}
      {tab === "logout" && <Logout setTab={setTab}/>} */}

      <Routes>
        <Route index element={<VLPHomePage dashboard={dashboard}/>}/>
        <Route path='/vla-milkcollection' element={<MilkCollectionPage/>}/>
        <Route path='/vla-reports' element={<VLPReportsPage/>}/>
        <Route path='/vla-bill' element={<VLPBillPage/>}/>
        <Route path='/vla-payments' element={<VLPPaymentsPage/>}/>
      </Routes>


      {tab === "milkcollection"}
    </div>
  )
}

export default VLPTabs
