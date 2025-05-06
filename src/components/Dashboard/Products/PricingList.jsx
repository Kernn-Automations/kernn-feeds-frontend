import React, { useEffect, useState } from "react";

import styles from "./Products.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import PricingAddViewModal from "./PricingAddViewModal";
import PricingViewModal from "./PricingViewModal";

function PricingList({ navigate }) {
  // const [addclick, setAddclick] = useState();

  // const dummyprice = [10, 20, 30, 40, 50];
  // const [viewclick, setViewclick] = useState();
  // const onViewClick = () => {
  //   setAddclick(false);
  //   viewclick ? setViewclick(false) : setViewclick(true);
  // };
  // const [prices, setPrices] = useState([10, 20, 30, 40, 50]);

  // const [count, setCount] = useState([1]);
  // const [i, seti] = useState(1);

  // const [products, setProducts] = useState([]);
  // const [price, setPrice] = useState("");
  // const [units, setUnits] = useState("");
  // const [errors, setErrors] = useState({});

  // const handleInputChange = (setter, field) => (e) => {
  //   setter(e.target.value);
  //   setErrors((prev) => ({ ...prev, [field]: false }));
  // };

  // const onSaveClick = (e) => {
  //   e.preventDefault();
  //   console.log(products);
  //   const newErrors = {};
  //   if (!price) newErrors.price = true;
  //   if (!units) newErrors.units = true;

  //   setErrors(newErrors);
  //   if (Object.keys(newErrors).length > 0) return;

  //   setProducts((prevProducts) => [
  //     ...prevProducts,
  //     { id: prevProducts.length + 1, price: Number(price), units },
  //   ]);

  //   // Convert price to Number and remove from prices array
  //   setPrices((prevPrices) => prevPrices.filter((p) => p !== Number(price)));

  //   setPrice("");
  //   setUnits("");
  //   setErrors({});
  // };

  // const onDeleteClick = (id, price) => {
  //   console.log("delete called", price);
  //   setProducts((prevProducts) =>
  //     prevProducts.filter((product) => product.id !== id)
  //   );

  //   setPrices((prevPrices) => {
  //     if (!prevPrices.includes(price)) {
  //       return [...prevPrices, price].sort((a, b) => a - b); // Keep it sorted
  //     }
  //     return prevPrices;
  //   });
  // };

  let index = 1;

  // backend
  const [pricing, setPricing] = useState();

  const { axiosAPI } = useAuth();

  const [trigger, setTrigger] = useState();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/pricing/lists/fetch");
        console.log(res);
        setPricing(res.data.pricingLists);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger]);

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/products")}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Pricing List
      </p>

      <>
        {/* <button className="homebtn" onClick={() => setAddclick(true)}>
            + Add
          </button> */}
        <PricingAddViewModal trigger={trigger} setTrigger={setTrigger} />

        {pricing && (
          <div className="row m-0 p-3 pt-5 justify-content-center">
            <div className="col-lg-9">
              <table className="table table-bordered borderedtable">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.length === 0 && (
                    <tr>
                      <td colSpan={6}>NO DATA FOUND</td>
                    </tr>
                  )}
                  {pricing.length > 0 &&
                    pricing.map((price) => (
                      <tr
                        className="animated-row"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td>{index++}</td>
                        <td>{price.createdAt.slice(0, 10)}</td>
                        <td>{price.name}</td>
                        <td>{price.type}</td>
                        <td>
                          {price.adjustmentValue}
                          {price.adjustmentType === "Percentage" ? "%" : ""}
                        </td>
                        <td>
                          <PricingViewModal price={price} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>

      {/* 
      {(viewclick || addclick) && (
        <>
          {products &&
            products.length > 0 &&
            products.map((product) => (
              <div className="row m-0 p-3 justify-content-center">
                <div className={`col-11 ${styles.leavesfield}`}>
                  <select name="" id="" disabled value={Number(product.price)}>
                    <option value="">--select--</option>
                    {dummyprice.map((price) => (
                      <option value={price}>
                        &gt;{price} (greater than {price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Price per unit"
                    disabled
                    value={product.units}
                  />

                  <span
                    className={styles.bin}
                    onClick={() => onDeleteClick(product.id, product.price)}
                  >
                    <i class="bi bi-trash"></i>
                  </span>
                </div>
              </div>
            ))}

          <div className="row m-0 p-3 justify-content-center">
            <div className={`col-11 ${styles.leavesfield}`}>
              <select
                name=""
                id=""
                className={errors.price ? styles.errorinput : ""}
                onChange={handleInputChange(setPrice, "price")}
                value={price}
              >
                <option value={""}>--select--</option>
                {prices.map((price) => (
                  <option value={price}>
                    &gt;{price} (greater than {price})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Price per unit"
                className={errors.units ? styles.errorinput : ""}
                onChange={handleInputChange(setUnits, "units")}
                value={units}
              />
            </div>
          </div>

          {prices.length > 1 && (
            <div className="row m-0 p-3 justify-content-center">
              <div className={`col-11 ${styles.leavesfield}`}>
                <button className={styles} onClick={(e) => onSaveClick(e)}>
                  <i class="bi bi-plus-circle"></i> Add
                </button>
              </div>
            </div>
          )}

          <div className="row m-0 p-3 justify-content-center">
            <div className={`col-11 ${styles.leavesfield}`}>
              <button className="submitbtn">Submit</button>
              <button className="cancelbtn" onClick={onViewClick}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )} */}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default PricingList;
