import React from "react";
import styles from "./HomePage.module.css";
import Productbox from "./Productbox";
import KYCApproval from "./KYCApproval";
import ProductBarchart from "./ProductBarchart";
import PaymentApprovals from "./PaymentApprovals";
import ProductLineChart from "./ProductLineChart";

function HomePage() {
  const hour = new Date().getHours();
  let wish;
  const user = JSON.parse(localStorage.getItem("user"));

  if (hour < 12) {
    wish = "Good Morning 🌅";
  } else if (hour < 18) {
    wish = "Good Afternoon ☀️";
  } else {
    wish = "Good Evening 🌙";
  }

  return (
    <>
      <div className="row m-0 p-0">
        <div className="col p-3">
          <h2 className={styles.wish}>
            Hello, {wish} {user.employee_name} !!
          </h2>
        </div>
      </div>
      <div className="row m-0 p-5 justify-content-around">
        <Productbox />
        <KYCApproval />
        <ProductBarchart />
        <PaymentApprovals />
        <ProductLineChart/>
      </div>
    </>
  );
}

export default HomePage;
