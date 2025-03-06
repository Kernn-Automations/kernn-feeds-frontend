import React from "react";
import styles from "./Employees.module.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import CreateEmployee from "./CreateEmployee";
import EmployeeHome from "./EmployeeHome";
import AssignRole from "./AssignRole";
import ManageEmployees from "./ManageEmployees";

function EmployeeRoutes() {
  const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route index element={<EmployeeHome navigate={navigate} />} />
        <Route
          path="/create-employee"
          element={<CreateEmployee navigate={navigate} />}
        />
        <Route
          path="/assign-role"
          element={<AssignRole navigate={navigate} />}
        />
        <Route
          path="/manage-employees"
          element={<ManageEmployees navigate={navigate} />}
        />
      </Routes>
    </>
  );
}

export default EmployeeRoutes;
