import React from "react";

function StockHome({ navigate }) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          {/* New Buttons */}
          <button
            className="homebtn"
            onClick={() => navigate("/stock-transfer/transfer")}
          >
            Stock Transfer
          </button>
          <button
            className="homebtn"
            onClick={() => navigate("/stock-transfer/list")}
          >
            Transfer List
          </button>
        </div>
      </div>
    </>
  );
}

export default StockHome;
