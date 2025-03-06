import React from 'react'
import styles from './Payments.module.css'
import { Route, Routes, useNavigate } from 'react-router-dom';
import PaymentHome from './PaymentHome';
import PaymentReports from './PaymentReports';
import PaymentApprovals from './PaymentApprovals';

function PaymentRoutes() {
    const navigate = useNavigate();
  return (
    <>
       <Routes>
          <Route index element={<PaymentHome navigate={navigate} />} />
          <Route path="/payment-reports" element={<PaymentReports navigate={navigate} />} />
          <Route
            path="/payment-approvals"
            element={<PaymentApprovals navigate={navigate} />}
          />
        </Routes>
    </>
  )
}

export default PaymentRoutes
