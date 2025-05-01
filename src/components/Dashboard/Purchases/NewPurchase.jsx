import React, { useEffect, useState } from "react";
import styles from "./Purchases.module.css";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import success from "../../../images/animations/SuccessAnimation.gif";

function NewPurchase({ navigate }) {
  const [products, setProducts] = useState([]);
  const [pid, setPid] = useState("");
  const [pname, setPname] = useState("");
  const [units, setUnits] = useState("");
  const [qty, setQty] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});

  const [total, setTotal] = useState(0);

  const { axiosAPI } = useAuth();
  const [warehouses, setWarehouses] = useState();
  const [suppliers, setSuppliers] = useState();

  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axiosAPI.get("/warehouse");
        const res2 = await axiosAPI.get("/suppliers");
        console.log(res);
        setWarehouses(res.data.warehouses);
        setSuppliers(res2.data.suppliers);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, []);

  const [apiproducts, setApiproducts] = useState([]);
  const [product, setProduct] = useState([]);

  // Date and time and user
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const now = new Date();

    const options = { timeZone: "Asia/Kolkata" };
    const indianTime = new Date(now.toLocaleString("en-US", options));

    const year = indianTime.getFullYear();
    const month = String(indianTime.getMonth() + 1).padStart(2, "0");
    const day = String(indianTime.getDate()).padStart(2, "0");
    const hours = String(indianTime.getHours()).padStart(2, "0");
    const minutes = String(indianTime.getMinutes()).padStart(2, "0");

    setCurrentDate(`${year}-${month}-${day}`); // Format: YYYY-MM-DD
    setCurrentTime(`${hours}:${minutes}`);
  }, []);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axiosAPI.get("/products/list");
        console.log(res);
        setApiproducts(res.data.products);
      } catch (e) {
        console.log(e);
      }
    }

    fetch();
  }, []);

  const handleInputChange = (e) => {
    const newQty = e.target.value;
    setQty(newQty);
    setAmount(Number(product.basePrice) * Number(newQty || 1));
    setErrors((prev) => ({ ...prev, [qty]: false }));
  };

  const handleProductChange = (e) => {
    console.log(e);
    const selectedId = e.target.value;
    const product = apiproducts.find(
      (p) => p.SKU === selectedId || p.name === selectedId
    );
    setProduct(product);
    setPid(product.SKU);
    setPname(product.name);
    setUnits(product.unit);
    setAmount(product.basePrice);
    setErrors((prev) => ({ ...prev, [pid]: false }));
    setErrors((prev) => ({ ...prev, [pname]: false }));
    setErrors((prev) => ({ ...prev, [units]: false }));
    setErrors((prev) => ({ ...prev, [amount]: false }));
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
      { id: prevProducts.length + 1, pid, pname, units, qty, amount, product },
    ]);

    setTotal((prevTotal) => prevTotal + Number(amount));

    setPid("");
    setPname("");
    setUnits("");
    setQty("");
    setAmount("");
    setErrors({});
  };

  const onDeleteClick = (id) => {
    console.log("delete called");
    const product = products.find((p) => p.id === id);

    setTotal((prevTotal) => prevTotal - Number(product.amount));

    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id)
    );
  };

  // Form Subbmission
  const [warehouse, setWarehouse] = useState();
  const [supplier, setSupplier] = useState();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successmsg, setSuccessmsg] = useState();

  const onSubmit = async () => {
    console.log(warehouse, supplier);
    console.log(products);

    const items = [];

    products.map((pd) =>
      items.push({
        productId: pd.product.id,
        quantity: pd.qty,
        purchasePrice: pd.product.purchasePrice,
      })
    );
    console.log(items);
    try {
      setLoading(true);
      console.log({
        warehouseId: warehouse,
        supplierId: supplier,
        items: items,
      });
      const res = await axiosAPI.post("/purchases", {
        warehouseId: warehouse,
        supplierId: supplier,
        items: items,
      });
      console.log(res);
      setSuccessmsg(res.data.message);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/purchases');
      }, 2100);
    } catch (e) {
      console.log(e);
      setError(e.response.data.message);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  let sno = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/purchases")}>Purchase</span>{" "}
        <i class="bi bi-chevron-right"></i> + New Purchase Order
      </p>

      {!loading && !showSuccess && (
        <>
          <div className="row m-0 p-3">
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Date :</label>
              <input type="date" value={currentDate} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Time :</label>
              <input type="text" value={currentTime} />
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">User ID :</label>
              <input type="text" value={user.employeeId} />
            </div>
          </div>

          <div className="row m-0 p-3">
            <h5 className={styles.head}>TO</h5>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Warehouse :</label>
              <select
                name=""
                id=""
                onChange={(e) => setWarehouse(e.target.value)}
              >
                <option value={null}>--select--</option>
                {warehouses &&
                  warehouses.map((warehouse) => (
                    <option value={warehouse.id}>{warehouse.name}</option>
                  ))}
              </select>
            </div>
            <div className={`col-3 ${styles.longform}`}>
              <label htmlFor="">Vendor :</label>
              <select
                name=""
                id=""
                onChange={(e) => setSupplier(e.target.value)}
              >
                <option value={null}>--select--</option>
                {suppliers &&
                  suppliers.map((supplier) => (
                    <option value={supplier.id}>{supplier.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="row m-0 p-3 justify-content-center">
            <h5 className={styles.head}>Products</h5>
            <div className="col-lg-9">
              <table className="table table-bordered borderedtable">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product SKU</th>
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
                        onChange={(e) => handleProductChange(e)}
                        value={pid}
                        className={errors.pid ? styles.errorinput : ""}
                      >
                        <option value="">--select--</option>
                        {apiproducts &&
                          apiproducts.map((prod) => (
                            <option value={prod.SKU}>{prod.SKU}</option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <select
                        name=""
                        id=""
                        onChange={(e) => handleProductChange(e)}
                        value={pname}
                        className={errors.pname ? styles.errorinput : ""}
                      >
                        <option value="">--select--</option>
                        {apiproducts &&
                          apiproducts.map((prod) => (
                            <option value={prod.name}>{prod.name}</option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        placeholder="Units"
                        value={units}
                        className={errors.amount ? styles.errorinput : ""}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        placeholder="Enter Quantity"
                        onChange={(e) => handleInputChange(e)}
                        value={qty}
                        className={errors.qty ? styles.errorinput : ""}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        placeholder="Enter Amount"
                        value={amount}
                        className={errors.amount ? styles.errorinput : ""}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <button
                type="submit"
                onClick={onSaveClick}
                className={styles.addbtn}
              >
                + ADD Product
              </button>
            </div>

            <div className="row m-0 p-3 pt-4">
              <div className={`col-3 ${styles.longform}`}>
                <label htmlFor="">Total Amount :</label>
                <span> {total}/-</span>
              </div>
            </div>
          </div>

          <div className="row m-0 p-3 pt-4 justify-content-center">
            <div className={`col-3`}>
              <button className="submitbtn" onClick={onSubmit}>
                Submit
              </button>
              <button
                className="cancelbtn"
                onClick={() => navigate("/purchases")}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}


      {showSuccess && <LoadingAnimation gif={success} msg={successmsg} />}
      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
      {loading && <Loading />}
    </>
  );
}

export default NewPurchase;
