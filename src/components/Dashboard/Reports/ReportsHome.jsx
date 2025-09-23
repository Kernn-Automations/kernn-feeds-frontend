import React from "react";

function ReportsHome({ navigate }) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <button
            className="homebtn"
            onClick={() => navigate("/reports/customer-reports")}
          >
            Customer Reports
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/reports/employee-reports")}
          >
            Employee Reports
          </button>
        </div>
      </div>
    </>
  );
}

export default ReportsHome;
