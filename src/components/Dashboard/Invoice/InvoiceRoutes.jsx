import React from "react";
import { Routes, Route } from "react-router-dom";
import InvoicesPage from "./InvoicePage"; // This will list all invoices
// import InvoiceDetailsPage from "./InvoiceDetailsPage"; // Optional for viewing one invoice

function InvoiceRoutes() {
  return (
    <Routes>
      <Route index element={<InvoicesPage />} />
      {/* Future expansion:
      <Route path=":id" element={<InvoiceDetailsPage />} /> */}
    </Routes>
  );
}

export default InvoiceRoutes;
