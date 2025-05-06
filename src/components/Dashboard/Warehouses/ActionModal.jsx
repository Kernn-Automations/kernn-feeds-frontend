import React, { useEffect, useState } from "react";
import styles from "./Warehouse.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";
import MapViewModal from "./MapViewModal";
function ActionModal({ warehouse, managers }) {
  const onSubmit = (e) => e.preventDefault();

  const location = {
    lat : Number(warehouse.latitude),
    lng : Number(warehouse.longitude)
  }

  const setLocation = () => {};
  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Warehouse</h3>
      <form action="" onSubmit={onSubmit}>
      <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Warehouse ID :</label>
            <input
              type="text"
              value={warehouse.id}
              required
            />
          </div>
        </div>{" "}
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Warehouse Name :</label>
            <input
              type="text"
              value={warehouse.name}
              required
            />
          </div>
        </div>{" "}
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Plot / H.No :</label>
            <input
              type="text"
              value={warehouse.plot}
              required
            />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Street :</label>
            <input
              type="text"
              value={warehouse.street}
              required
            />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Area :</label>
            <input
              type="text"
              value={warehouse.area}
              required
            />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">City/Village :</label>
            <input
              type="text"
              value={warehouse.city}
              required
            />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">District :</label>
            <input
              type="text"
              value={warehouse.district}
              required
            />
          </div>
          <div className="row justify-content-center">
            <div className={`col-4  inputcolumn-mdl`}>
              <label htmlFor="">State :</label>
              <input
                type="text"
                value={warehouse.state}
                required
              />
            </div>
          </div>
          <div className="row justify-content-center">
            <div className={`col-4  inputcolumn-mdl`}>
              <label htmlFor="">Country :</label>
              <input
                type="text"
                value={warehouse.country}
                required
              />
            </div>
          </div>
          <div className="row justify-content-center">
            <div className={`col-4  inputcolumn-mdl`}>
              <label htmlFor="">Pincode :</label>
              <input
                type="text"
                value={warehouse.pincode}
                required
              />
            </div>
          </div>
          <div className="row justify-content-center">
            <div className={`col-4  inputcolumn-mdl`}>
              <label htmlFor="">Manager :</label>
              <select
                name=""
                id=""
                value={warehouse.managerId}
                required
              >
                <option value="null">--select--</option>
                {managers &&
                  managers.map((manager) => (
                    <option value={manager.id}>{manager.name}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Locate on Map :</label>
            <MapViewModal defaultLocation={location} setDefaultLocation={setLocation}/>
          </div>
        </div>
        {/* <div className="row pt-3 mt-3 justify-content-center">
          <div className={`col-5`}>
            <button
              type="submit"
              className={`submitbtn`}
              data-bs-dismiss="modal"
            >
              Submit
            </button>
            <DialogActionTrigger asChild>
              <button
                type="button"
                className={`cancelbtn`}
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </DialogActionTrigger>
          </div>
        </div> */}
      </form>
    </>
  );
}

export default ActionModal;
