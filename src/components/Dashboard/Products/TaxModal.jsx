import React from "react";

function TaxModal({ tax }) {
  if (!tax) return <p>No tax data available.</p>;

  return (
    <div className="px-3">
      <h4 className="pb-2">Tax Details</h4>
      <div className="row mb-2">
        <div className="col-6"><strong>Name:</strong> {tax.name}</div>
        <div className="col-6"><strong>Percentage:</strong> {tax.percentage}%</div>
      </div>

      <div className="row mb-2">
        <div className="col-6"><strong>HSN Code:</strong> {tax.hsnCode || "—"}</div>
        <div className="col-6"><strong>Nature:</strong> {tax.taxNature}</div>
      </div>

      <div className="row mb-2">
        <div className="col-6"><strong>Applicable On:</strong> {tax.applicableOn}</div>
        <div className="col-6">
          <strong>Status:</strong>{" "}
          <span className={tax.status === "Active" ? "text-success" : "text-danger"}>
            {tax.status}
          </span>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-6">
          <strong>Is Cess:</strong> {tax.isCess ? "Yes" : "No"}
        </div>
        <div className="col-6">
          <strong>Cess %:</strong> {tax.isCess ? `${tax.cessPercentage}%` : "—"}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-6">
          <strong>Additional Duty:</strong> {tax.isAdditionalDuty ? "Yes" : "No"}
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-12">
          <strong>Description:</strong>
          <div>{tax.description || "—"}</div>
        </div>
      </div>
    </div>
  );
}

export default TaxModal;
