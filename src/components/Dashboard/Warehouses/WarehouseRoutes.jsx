import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import WarehouseHome from './WarehouseHome';
import OngoingWarehouse from './OngoingWarehouse';

function WarehouseRoutes() {
    const navigate = useNavigate();
    return (
      <>
        <Routes>
          <Route index element={<WarehouseHome navigate={navigate} />} />
          <Route
            path="/ongoing"
            element={<OngoingWarehouse navigate={navigate} />}
          />
        </Routes>
      </>
    );
}

export default WarehouseRoutes
