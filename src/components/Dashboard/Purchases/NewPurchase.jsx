import React, { useState } from "react";
import styles from "./Purchases.module.css";

function NewPurchase({ navigate }) {
  const [products, setProducts] = useState([]);
  const [pid, setPid] = useState("");
  const [pname, setPname] = useState("");
  const [units, setUnits] = useState("");
  const [qty, setQty] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});


  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const onSaveClick = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!pid) newErrors.pid = true;
    if (!pname) newErrors.pname = true;
    if (!units) newErrors.units = true;
    if (!qty) newErrors.qty = true;
    if (!amount) newErrors.amount = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setProducts((prevProducts) => [
      ...prevProducts,
      { id: prevProducts.length + 1, pid, pname, units, qty, amount },
    ]);

    setPid("");
    setPname("");
    setUnits("");
    setQty("");
    setAmount("");
    setErrors({});
  };

  const onDeleteClick = (id) => {
    console.log("delete called");
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id)
    );
  };

  let sno = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/purchases")}>Purchase</span>{" "}
        <i class="bi bi-chevron-right"></i> + New Purchase Order
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Date :</label>
          <input type="date" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Time :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">User ID :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Warehouse :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Warehouse 1</option>
            <option value="">Warehouse 2</option>
            <option value="">Warehouse 3</option>
          </select>
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>TO</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Vendor Name :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Vendor ID :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Address Line 1 :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Address Line 2 :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Village/City :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">District :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">State :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Pincode :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-3 justify-content-center">
        <h5 className={styles.head}>Products</h5>
        <div className="col-lg-9">
          <table className="table table-bordered borderedtable">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Units</th>
                <th>Quantity</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {products &&
                products.length > 0 &&
                products.map((product) => (
                  <>
                    <tr>
                      <td>{sno++}</td>
                      <td>{product.pid}</td>
                      <td>{product.pname}</td>
                      <td>{product.units}</td>
                      <td>{product.qty}</td>
                      <td className={styles.del}>
                        {product.amount}{" "}
                        <button
                          type="button"
                          onClick={() => onDeleteClick(product.id)}
                        >
                          <i class="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  </>
                ))}
              <tr className={styles.tableform}>
                <td>{sno}</td>
                <td>
                  <select
                    name=""
                    id=""
                    onChange={handleInputChange(setPid, "pid")}
                    value={pid}
                    className={errors.pid ? styles.errorinput : ""}
                  >
                    <option value="">--select--</option>
                    <option value="123">#123</option>
                    <option value="124">#124</option>
                    <option value="125">#125</option>
                  </select>
                </td>
                <td>
                  <select
                    name=""
                    id=""
                    onChange={handleInputChange(setPname, "pname")}
                    value={pname}
                    className={errors.pname ? styles.errorinput : ""}
                  >
                    <option value="">--select--</option>
                    <option value="product-1">product-1</option>
                    <option value="product-2">product-2</option>
                    <option value="product-3">product-3</option>
                  </select>
                </td>
                <td>
                  <select
                    name=""
                    id=""
                    onChange={handleInputChange(setUnits, "units")}
                    value={units}
                    className={errors.units ? styles.errorinput : ""}
                  >
                    <option value="">--select--</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    required
                    placeholder="Enter Quantity"
                    onChange={handleInputChange(setQty, "qty")}
                    value={qty}
                    className={errors.qty ? styles.errorinput : ""}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    required
                    placeholder="Enter Amount"
                    onChange={handleInputChange(setAmount, "amount")}
                    value={amount}
                    className={errors.amount ? styles.errorinput : ""}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <button type="submit" onClick={onSaveClick} className={styles.addbtn}>
            + ADD Product
          </button>
        </div>

        <div className="row m-0 p-3 pt-4">
          <div className={`col-3 ${styles.longform}`}>
            <label htmlFor="">Total Amount :</label>
            <span> 1,30,000/-</span>
          </div>
        </div>
      </div>

      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-3`}>
          <button className="submitbtn">Submit</button>
          <button className="cancelbtn" onClick={() => navigate("/purchases")}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default NewPurchase;
