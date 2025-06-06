import React from "react";
import { FaWarehouse, FaUser, FaPhone } from "react-icons/fa";

function WarehouseHeaderCard({ warehouse }) {
  return (
    <div className="d-flex align-items-start mb-4 p-3 border rounded shadow-sm bg-light">
      <div className="me-3">
        <FaWarehouse size={48} color="#007bff" />
      </div>
      <div>
        <h4 className="mb-1">{warehouse.warehouse.name}</h4>
        <div className="text-muted">{warehouse.warehouse.type} • {warehouse.warehouse.city}, {warehouse.warehouse.state}</div>
        <div className="mt-2">
          <FaUser className="me-2" /> <strong>{warehouse.manager.name}</strong>
          <span className="ms-3"><FaPhone className="me-2" />{warehouse.manager.mobile}</span>
        </div>
      </div>
    </div>
  );
}

export default WarehouseHeaderCard;
