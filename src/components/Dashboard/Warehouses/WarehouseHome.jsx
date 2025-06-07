
import React from "react";
import NewWarehouseViewModal from "./NewWarehouseViewModal";
import DeleteWarehouseViewModal from "./DeleteWarehouseViewModal";
import OngoingWarehousesPage from './OngoingWarehouse'; // Adjust path if needed

function WarehouseHome({ navigate, managers, products, isAdmin }) {



  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">

          {isAdmin && (
            <>
              <NewWarehouseViewModal managers={managers} products={products} />
              <DeleteWarehouseViewModal />
            </>
          )}

          {/* New Buttons */}
          <button
            className="homebtn me-2"
            onClick={() => navigate("/warehouses/stock-transfer")}
          >
            Stock Transfer
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/warehouses/order-transfer")}
          >
            Order Transfer
          </button>
        </div>
      </div>

      {/* Direct Embed of Ongoing Warehouses */}
      <div className="p-3">
        <OngoingWarehousesPage navigate={navigate} />
      </div>
    </>
  );
}

export default WarehouseHome;
