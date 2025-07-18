import React from 'react'
import styles from "./Inventory.module.css"

function InventoryHome({navigate}) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
            <button className='homebtn' onClick={() => navigate('/inventory/incoming-stock')}>Incoming Stock</button>
            <button className='homebtn' onClick={() => navigate('/inventory/outgoing-stock')}>Outgoing Stock</button>
            <button className='homebtn' onClick={() => navigate('/inventory/stock-summary')}>Stock Summary</button>
            <button className='homebtn' onClick={() => navigate('/inventory/damaged-goods')}>Damaged Goods</button>
        </div>
      </div>
    </>
  )
}

export default InventoryHome
