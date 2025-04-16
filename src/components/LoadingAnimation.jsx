import React from "react";
import styles from "./Loading.module.css";

function LoadingAnimation({ gif }) {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className={`col-3 ${styles.loadContainer}`}>
          {/* <Spinner size="lg" color={"var(--primary-color)"} borderWidth="3px"/> */}

          <img src={gif} alt="Loading..." />
        </div>
      </div>
    </div>
  );
}

export default LoadingAnimation;
