import React from "react";

function DiscountHome({ navigate }) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <button
            className="homebtn"
            onClick={() => navigate("/discounts/bill-to-bill")}
          >
            Bill-to-Bill
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/discounts/monthly")}
          >
            Monthly Discount
          </button>
         
        </div>
      </div>
    </>
  );
}

export default DiscountHome;
