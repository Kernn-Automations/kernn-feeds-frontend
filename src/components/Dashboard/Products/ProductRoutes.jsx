import React from "react";
import styles from "./Products.module.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import AddProduct from "./AddProduct";
import ModifyProduct from "./ModifyProduct";
import ProductHome from "./ProductHome";
import PricingList from "./PricingList";
import Taxes from "./Taxes";
function ProductRoutes() {
  const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route index element={<ProductHome navigate={navigate} />} />
        <Route path="/add" element={<AddProduct navigate={navigate} />} />
        <Route path="/modify" element={<ModifyProduct navigate={navigate} />} />
        <Route
          path="/pricing-list"
          element={<PricingList navigate={navigate} />}
        />
        <Route path="/taxes" element={<Taxes navigate={navigate} />} />
      </Routes>
    </>
  );
}

export default ProductRoutes;
