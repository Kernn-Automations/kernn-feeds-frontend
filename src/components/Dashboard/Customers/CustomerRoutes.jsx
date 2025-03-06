import React from "react";
import styles from "./Customer.module.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import CustomerHome from "./CustomerHome";
import CustomerList from "./CustomerList";
import KYCApproval from "./KYCApproval";
function CustomerRoutes() {
  const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route index element={<CustomerHome navigate={navigate} />} />
        <Route path="/customer-list" element={<CustomerList navigate={navigate} />} />
        <Route
          path="/kyc-approvals"
          element={<KYCApproval navigate={navigate} />}
        />
      </Routes>
    </>
  );
}

export default CustomerRoutes;
