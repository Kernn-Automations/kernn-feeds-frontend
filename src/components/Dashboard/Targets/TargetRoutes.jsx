import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TargetsHome from "./TargetsHome";
import SalesTargets from "./SalesTargets";
import CustomerTargets from "./CustomerTargets";
import TargetList from "./TargetList";

function TargetRoutes() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const roles = JSON.stringify(user.roles);
  const isAdmin = roles.includes("Admin");

  return (
    <Routes>
      <Route path="/" element={<TargetsHome />} />
      <Route path="/all-targets" element={<TargetList />} />
      <Route path="/sales-target" element={<SalesTargets navigate={navigate} isAdmin={isAdmin} />} />
      <Route path="/customer-target" element={<CustomerTargets navigate={navigate} isAdmin={isAdmin} />} />
    </Routes>
  );
}

export default TargetRoutes;
