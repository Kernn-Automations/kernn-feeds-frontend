import React, { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import StockTransferPage from "./StockTransferPage";
import WarehouseDetailsPage from "./WarehouseDetailsPage";
import OrderTransferPage from "./OrderTransferPage";

// Lazy-loaded components
const WarehouseHome = lazy(() => import("./WarehouseHome"));
const OngoingWarehouse = lazy(() => import("./OngoingWarehouse"));

function WarehouseRoutes() {
  const navigate = useNavigate();

  const {axiosAPI} = useAuth();

  const [managers, setManagers] = useState();

  const [products, setProducts] = useState([]);

  const [error, setError] = useState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const user = JSON.parse(localStorage.getItem("user"));

  const roles = JSON.stringify(user.roles);

  const isAdmin = roles.includes("Admin");

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axiosAPI.get("/employees/role/Warehouse Manager");
        const res1 = await axiosAPI.get("/products/list");
        // console.log(res);
        setManagers(res.data.employees);
        setProducts(res1.data.products);
        console.log(res1.data.products)
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
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
            <Suspense fallback={<PageSkeleton />}>
              <WarehouseHome navigate={navigate} managers={managers} products={products} isAdmin={isAdmin}  />
            </Suspense>
          }
        />
        <Route
          path="/ongoing"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <OngoingWarehouse navigate={navigate} managers={managers} isAdmin={isAdmin} />
            </Suspense>
          }
        />
        <Route
          path="/stock-transfer"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <StockTransferPage navigate={navigate} managers={managers} />
            </Suspense>
          }
        />
        <Route
          path="/order-transfer"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <OrderTransferPage navigate={navigate} managers={managers} />
            </Suspense>
          }
        />
        <Route
          path="/:id"
          element={
            managers ? (
              <WarehouseDetailsPage managers={managers} />
            ) : (
              <PageSkeleton /> // or any loading fallback
            )
          }
        />
      </Routes>
      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default WarehouseRoutes;
