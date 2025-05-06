import React from "react";
import styles from "./Products.module.css";

function PricingModal({ price }) {
  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Pricing</h3>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Date :</label>
          <input type="date" value={price.createdAt.slice(0, 10)}/>
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Pricing Name :</label>
          <input type="text" value={price.name} required />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Pricing Type :</label>
          <select name="" id="" value={price.type}>
            <option value="null">--select--</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Adjustment Type :</label>
          <select name="" id="" value={price.adjustmentType}>
            <option value="null">--select--</option>
            <option value="Fixed">Fixed</option>
            <option value="Percentage">Percentage</option>
          </select>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Adjustment Value :</label>
          <input type="text" value={price.adjustmentValue} required />
        </div>
      </div>
      <div className="row pb-4 justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Currency :</label>
          <input type="text" value={price.currency} required disabled />
        </div>
      </div>
    </>
  );
}

export default PricingModal;
