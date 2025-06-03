import React from 'react'
import styles from "./Settings.module.css";

function DropoffRules({navigate}) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/settings")}>Settings</span>{" "}
        <i class="bi bi-chevron-right"></i> Drop-off Rules
      </p>
    </>
  )
}

export default DropoffRules
