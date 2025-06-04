import React from 'react'
import styles from "./Settings.module.css";

function MinimumOrderRules({navigate}) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/settings")}>Settings</span>{" "}
        <i class="bi bi-chevron-right"></i> Minimum Order Rules
      </p>
    </>
  )
}

export default MinimumOrderRules
