import React from "react";

function SalesReports({ navigate }) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i class="bi bi-chevron-right"></i> Sales-Reports
      </p>

      {/* content From Here */}
    </>
  );
}

export default SalesReports;
