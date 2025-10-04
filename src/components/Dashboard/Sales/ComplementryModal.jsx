import React, { useState } from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
} from "@/components/ui/dialog";
import styles from "./Sales.module.css";

function ComplementryModal({
  openComplementryModal,
  setOpenComplementryModal,
  isComplementryAdded,
  setIsComplementryAdded,
  complimentries, // always default to array
  setComplimentries,
  products = [], // also safe default
}) {
  const [currentRow, setCurrentRow] = useState({ productId: "", bags: "" });

  // Handle input changes in the current row
  const handleRowChange = (field, value) => {
    setCurrentRow((prev) => ({ ...prev, [field]: value }));
  };

  // Add selected product to complimentries
  const handleAddProduct = () => {
    if (!currentRow.productId || !currentRow.bags) return; // simple validation

    console.log(currentRow);
    setComplimentries((prev) => [...(prev || []), { ...currentRow }]);
    setCurrentRow({ productId: "", bags: "" }); // reset for next input
    setIsComplementryAdded(true);
    console.log(complimentries);
  };

  // Remove a product from complimentries
  const handleRemoveProduct = (productId) => {
    setComplimentries((prev) =>
      (prev || []).filter((c) => c.productId !== productId)
    );
  };

  // Filter products for dropdown (exclude already added)
  const availableProducts = products.filter(
    (p) => !(complimentries || []).some((c) => c.productId === p.productId)
  );

  return (
    <DialogRoot
      placement="center"
      size="md"
      className={styles.mdl}
      open={openComplementryModal}
      onOpenChange={setOpenComplementryModal}
    >
      <DialogContent className="mdl">
        <DialogBody>
          <h5>Products Quantity</h5>

          <table className="table table-bordered mt-3 borderedtable">
            <thead>
              <tr>
                <th>Product</th>
                <th>No of Bags</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Input row */}

              {/* Already added products */}
              {(complimentries || []).map((item) => {
                const product = products.find((p) => p.productId === item.productId);
                return (
                  <tr key={item.productId}>
                    <td>{product?.productName || item.productId}</td>
                    <td>{item.bags}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveProduct(item.productId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td>
                  <select
                    value={currentRow.productId}
                    onChange={(e) =>
                      handleRowChange("productId", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="">Select Product</option>
                    {availableProducts.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.productName}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={currentRow.bags}
                    onChange={(e) => handleRowChange("bags", e.target.value)}
                    className="form-control"
                    min="1"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={handleAddProduct}
                  >
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="d-flex justify-content-end gap-2 py-3">
            <button
              className="cancelbtn"
              onClick={() => {
                setIsComplementryAdded(false);
                setOpenComplementryModal(false);
              }}
            >
              Cancel
            </button>
            <button
              className="submitbtn"
              onClick={() => setOpenComplementryModal(false)}
            >
              Done
            </button>
          </div>
        </DialogBody>

        <DialogCloseTrigger className="inputcolumn-mdl-close" asChild>
          <button onClick={() => setOpenComplementryModal(false)}>
            <i className="bi bi-x"></i>
          </button>
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}

export default ComplementryModal;
