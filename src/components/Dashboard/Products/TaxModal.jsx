import React from "react";
import styles from "./Products.module.css";

function TaxModal({ tax }) {
  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Taxes</h3>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Date :</label>
          <input type="date" value={tax.createdAt.slice(0, 10)} />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Tax Name :</label>
          <input type="text" value={tax.name} required />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Percentage :</label>
          <input type="number" value={tax.percentage} />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Description :</label>
          <textarea name="" id="" value={tax.description}></textarea>
        </div>
      </div>
    </>
  );
}

export default TaxModal;
