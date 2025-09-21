import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Targets.module.css";
import { FaUsers, FaChartLine } from "react-icons/fa";

function TargetsHome() {
  const navigate = useNavigate();

  return (
    <>
      {/* Buttons - Always visible */}
      <div className="row m-0 p-3">
        <div className="col">
          <button 
            className="homebtn"
            onClick={() => navigate("/targets/sales-target")}
          >
            Sales Targets
          </button>
          <button 
            className="homebtn"
            onClick={() => navigate("/targets/customer-target")}
          >
            Customer Targets
          </button>
        </div>
      </div>

      
    </>
  );
}

export default TargetsHome;
