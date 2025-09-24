import React from "react";

function EmployeeReports({ navigate }) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i class="bi bi-chevron-right"></i> Employee-Reports
      </p>

      {/* content From Here */}
    </>
  );
}

export default EmployeeReports;
