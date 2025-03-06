import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import InventoryHome from './InventoryHome';
import IncomingStock from './IncomingStock';
import OutgoingStock from './OutgoingStock';
import StockSummary from './StockSummary';
import styles from "./Inventory.module.css"

function InventoryRoutes() {
    const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route index element={<InventoryHome navigate={navigate}/>}/>
        <Route path='/incoming-stock' element={<IncomingStock navigate={navigate}/>}/>
        <Route path='/outgoing-stock' element={<OutgoingStock navigate={navigate}/>}/>
        <Route path='/stock-summary' element={<StockSummary navigate={navigate}/>}/>

      </Routes>
    </>
  )
}

export default InventoryRoutes
