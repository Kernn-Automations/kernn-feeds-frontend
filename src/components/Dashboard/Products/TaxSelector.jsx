import React, { useEffect, useState } from "react";
import { useAuth } from "@/Auth";

function TaxSelector({ selectedTaxes, setSelectedTaxes }) {
  const { axiosAPI } = useAuth();
  const [allTaxes, setAllTaxes] = useState([]);
  const [newTaxId, setNewTaxId] = useState("");

  useEffect(() => {
    async function fetchTaxes() {
      try {
        const res = await axiosAPI.get("/tax");
        setAllTaxes(res.data.taxes || []);
      } catch (err) {
        console.error("Failed to fetch taxes:", err);
      }
    }
    fetchTaxes();
  }, []);

  const handleSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    if (!selectedTaxes.includes(selectedId)) {
      setSelectedTaxes((prev) => [...prev, selectedId]);
    }
    setNewTaxId(""); // Reset select
  };

  const removeTax = (index) => {
    setSelectedTaxes((prev) => prev.filter((_, i) => i !== index));
  };

  const availableTaxes = allTaxes.filter((t) => !selectedTaxes.includes(t.id));

  return (
    <>
      <label>Taxes:</label>

      {selectedTaxes.map((taxId, index) => {
        const tax = allTaxes.find((t) => t.id === taxId);
        return (
          <div
            key={taxId}
            className="d-flex justify-content-between align-items-center mb-2"
          >
            <span>{tax?.name}</span>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeTax(index)}
            >
              Remove
            </button>
          </div>
        );
      })}

      {availableTaxes.length > 0 && (
        <select
          className=""
          value={newTaxId}
          onChange={handleSelect}
        >
          <option value="" disabled>
            -- Select Tax --
          </option>
          {availableTaxes.map((tax) => (
            <option key={tax.id} value={tax.id}>
              {tax.name}
            </option>
          ))}
        </select>
      )}
      {availableTaxes.length === 0 && <p className="fw-bold">All taxes are Selected </p>}
    </>
  );
}

export default TaxSelector;
