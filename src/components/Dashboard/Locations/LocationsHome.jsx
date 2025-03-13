import React, { useState } from "react";
import LocationViewModal from "./LocationViewModal";
import styles from "./Location.module.css";
import { IoSearch } from "react-icons/io5";

function LocationsHome() {
  const [type, setType] = useState("employee");

  return (
    <>
      <div className="row m-0 p-3 pt-5">
        <div className="col-3 formcontent">
          <label htmlFor="">Location Type :</label>
          <select name="" id="" onChange={(e) => setType(e.target.value)}>
            <option value="employee">Employee</option>
            <option value="truck">Truck</option>
          </select>
        </div>
      </div>
      <div className="row m-0 p-3 justify-content-end">
        <div className={`col-4 ${styles.search}`}>
          <input type="text" placeholder="Search..." />
          <span className={styles.searchicon}>
            <IoSearch />
          </span>
        </div>
      </div>

      <div className="row m-0 p-3 justify-content-center">
        <div className="col-md-10">
          {type === "employee" && (
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Warehouse ID</th>
                  <th>Warehouse Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>EMP2034</td>
                  <td>Employee 1</td>
                  <td>#4545</td>
                  <td>Warehouse 1</td>
                  <td>
                    <LocationViewModal />
                  </td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>EMP2035</td>
                  <td>Employee 2</td>
                  <td>#4546</td>
                  <td>Warehouse 2</td>
                  <td>
                    <LocationViewModal />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          {type === "truck" && (
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Truck Number</th>
                  <th>GPS Tracker ID</th>
                  <th>Warehouse ID</th>
                  <th>Warehouse Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>TS02AB2332</td>
                  <td>tracker 1</td>
                  <td>#4545</td>
                  <td>Warehouse 1</td>
                  <td>
                    <LocationViewModal />
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>TS03TR0032</td>
                  <td>Tracker 2</td>
                  <td>#4546</td>
                  <td>Warehouse 2</td>
                  <td>
                    <LocationViewModal />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default LocationsHome;
