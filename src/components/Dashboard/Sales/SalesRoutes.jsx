import React from 'react'
import { Route, Router, Routes, useNavigate } from 'react-router-dom'

import styles from "./Sales.module.css"
import SalesHome from './SalesHome';
import Orders from './Orders';
import Dispaches from './Dispaches';
import Deliveries from './Deliveries';

function SalesRoutes() {
    const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route index element={<SalesHome navigate={navigate}/>}/>
        <Route path='/orders' element={<Orders navigate={navigate}/> }/>
        <Route path='/dispatches' element={<Dispaches navigate={navigate}/>}/>
        <Route path='/deliveries' element={<Deliveries navigate={navigate}/>}/>
      </Routes>
    </>
  )
}

export default SalesRoutes
