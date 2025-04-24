import React, { lazy, Suspense } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import PageSkeleton from '../../SkeletonLoaders/PageSkeleton';

// Lazy-loaded components
const WarehouseHome = lazy(() => import('./WarehouseHome'));
const OngoingWarehouse = lazy(() => import('./OngoingWarehouse'));

function WarehouseRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            <WarehouseHome navigate={navigate} />
          </Suspense>
        }
      />
      <Route
        path="/ongoing"
        element={
          <Suspense fallback={<PageSkeleton />}>
            <OngoingWarehouse navigate={navigate} />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default WarehouseRoutes;
