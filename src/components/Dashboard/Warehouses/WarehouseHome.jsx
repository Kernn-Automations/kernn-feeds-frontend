import React from 'react'
import NewWarehouseViewModal from './NewWarehouseViewModal'
import DeleteWarehouseViewModal from './DeleteWarehouseViewModal'

function WarehouseHome({navigate}) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <NewWarehouseViewModal/>
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
