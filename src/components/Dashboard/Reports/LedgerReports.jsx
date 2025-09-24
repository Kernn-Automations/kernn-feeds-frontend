import React from 'react'

function LedgerReports({navigate}) {
  return (
     <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i class="bi bi-chevron-right"></i> Ledger-Reports
      </p>


      {/* content From Here */}
    </>
  )
}

export default LedgerReports
