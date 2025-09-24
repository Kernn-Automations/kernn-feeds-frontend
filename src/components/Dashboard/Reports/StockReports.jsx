import React from 'react'

function StockReports({navigate}) {
  return (
     <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i class="bi bi-chevron-right"></i> Stock-Reports
      </p>


      {/* content From Here */}
    </>
  )
}

export default StockReports
