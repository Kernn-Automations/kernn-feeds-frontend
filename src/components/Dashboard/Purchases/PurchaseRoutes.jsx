import React from 'react'
import { Route, Router, Routes, useNavigate } from 'react-router-dom'
import PurchaseHome from './PurchaseHome';
import NewPurchase from './NewPurchase';
import PurchaseReport from './PurchaseReport';
import styles from "./Purchases.module.css"

function PurchaseRoutes() {
    const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route index element={<PurchaseHome navigate={navigate}/>}/>
        <Route path='/new-purchase' element={<NewPurchase navigate={navigate}/> }/>
        <Route path='/purchase-report' element={<PurchaseReport navigate={navigate}/>}/>
      </Routes>
    </>
  )
}

export default PurchaseRoutes
