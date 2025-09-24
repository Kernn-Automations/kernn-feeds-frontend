import React from "react";

function TargetReports({ navigate }) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i class="bi bi-chevron-right"></i> Target-Reports
      </p>

      {/* content From Here */}
    </>
  );
}

export default TargetReports;
