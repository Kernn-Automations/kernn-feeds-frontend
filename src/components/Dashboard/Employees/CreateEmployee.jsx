import React from "react";
import styles from "./Employees.module.css";

function CreateEmployee({ navigate }) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate(-1)}>Employees</span>{" "}
        <i class="bi bi-chevron-right"></i> Create-Employee
      </p>

      <div className="row m-0 p-3 pb-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Department :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Department 1</option>
            <option value="">Department 2</option>
            <option value="">Departments 3</option>
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Role :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">Role 1</option>
            <option value="">Role 2</option>
            <option value="">Role 3</option>
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">State :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">State 1</option>
            <option value="">State 2</option>
            <option value="">State 3</option>
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">District :</label>
          <select name="" id="">
            <option value="">--select--</option>
            <option value="">District 1</option>
            <option value="">District 2</option>
            <option value="">District 3</option>
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">First Name :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Last Name :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Surname :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Mobile Number :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row m-0 p-3 py-0 justify-content-center">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Email ID :</label>
          <input type="text" />
        </div>
      </div>
      <div className="row m-0 p-3 justify-content-center">
        <div className={`col-3 ${styles.btnscol}`}>
          <button className="submitbtn" onClick>Submit</button>
          <button className="cancelbtn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
    </>
  );
}

export default CreateEmployee;
