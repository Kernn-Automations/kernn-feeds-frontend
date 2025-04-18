import React, { useEffect, useState } from "react";
import { Route, Router, Routes, useNavigate } from "react-router-dom";

import styles from "./Sales.module.css";
import SalesHome from "./SalesHome";
import Orders from "./Orders";
import Dispaches from "./Dispaches";
import Deliveries from "./Deliveries";
import { useAuth } from "@/Auth";

function SalesRoutes() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState();
  const [warehouses, setWarehouses] = useState();

  const { axiosAPI } = useAuth();

  useEffect(() => {
    async function fetch() {
      try {
        const res1 = await axiosAPI.get("/warehouse");
        const res2 = await axiosAPI.get("/customers");

        console.log(res1);
        console.log(res2);

        setWarehouses(res1.data.warehouses);
        setCustomers(res2.data.customers);
      } catch (e) {
        console.log(e);
      }
    }
    fetch();
  }, []);

  return (
    <>
      <Routes>
        <Route
          index
          element={
            <SalesHome
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
          }
        />
        <Route
          path="/orders"
          element={
            <Orders
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
          }
        />
        <Route
          path="/dispatches"
          element={
            <Dispaches
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
          }
        />
        <Route
          path="/deliveries"
          element={
            <Deliveries
              navigate={navigate}
              warehouses={warehouses}
              customers={customers}
            />
          }
        />
      </Routes>
    </>
  );
}

export default SalesRoutes;
