import React from "react";
import styles from "./Products.module.css";
import DeleteProductViewModal from "./DeleteProductViewModal";

function ProductHome({ navigate }) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <button className="homebtn" onClick={() => navigate("/products/add")}>
            + Add
          </button>
          <DeleteProductViewModal/>
          <button
            className="homebtn"
            onClick={() => navigate("/products/modify")}
          >
            Modify
          </button>
        </div>
      </div>
    </>
  );
}

export default ProductHome;
