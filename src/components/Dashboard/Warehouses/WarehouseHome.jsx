import React from 'react'
import NewWarehouseViewModal from './NewWarehouseViewModal'
import DeleteWarehouseViewModal from './DeleteWarehouseViewModal'

function WarehouseHome({navigate, managers}) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <NewWarehouseViewModal managers={managers}/>
          <DeleteWarehouseViewModal/>
          <button
            className="homebtn"
            onClick={() => navigate("/warehouses/ongoing")}
          >
            Ongoing
          </button>
        </div>
      </div>
    </>
  )
}

export default WarehouseHome
