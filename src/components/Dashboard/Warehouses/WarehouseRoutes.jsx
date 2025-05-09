import React, { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import PageSkeleton from "../../SkeletonLoaders/PageSkeleton";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";

// Lazy-loaded components
const WarehouseHome = lazy(() => import("./WarehouseHome"));
const OngoingWarehouse = lazy(() => import("./OngoingWarehouse"));

function WarehouseRoutes() {
  const navigate = useNavigate();

  const {axiosAPI} = useAuth();

  const [managers, setManagers] = useState();

  const [error, setError] = useState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axiosAPI.get("/employees/role/Warehouse Manager");
        // console.log(res);
        setManagers(res.data.employees);
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
              <WarehouseHome navigate={navigate} managers={managers}  />
            </Suspense>
          }
        />
        <Route
          path="/ongoing"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <OngoingWarehouse navigate={navigate} managers={managers} />
            </Suspense>
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
