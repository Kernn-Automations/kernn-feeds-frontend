import React, { useState } from "react";
import styles from "./Employees.module.css";
import ManageEmpProfile from "./ManageEmpProfile";

function ManageEmployees({ navigate }) {
  const [viewclick, setViewclick] = useState();

  const onViewClick = () =>
    viewclick ? setViewclick(false) : setViewclick(true);

  const emps = [
    {
      sn: 1,
      id: 2301,
      name: "Jhon",
      num: 876543219,
      em: "jhon@gmail.com",
      role: "",
    },
    {
      sn: 2,
      id: 2321,
      name: "Jack",
      num: 872543219,
      em: "jack@gmail.com",
      role: "",
    },
    {
      sn: 3,
      id: 3451,
      name: "Jimmy",
      num: 976543219,
      em: "jimmy@gmail.com",
      role: "",
    },
    {
      sn: 4,
      id: 9871,
      name: "jony",
      num: 876543219,
      em: "jony@gmail.com",
      role: "",
    },
  ];
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/employees")}>Employees</span>{" "}
        <i class="bi bi-chevron-right"></i> Manage Employees
      </p>

      {!viewclick && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-10">
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Emp ID</th>
                  <th>Employee Name</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th colSpan={2}>Action</th>
                </tr>
              </thead>
              <tbody>
                {emps.map((emp) => (
                  <tr>
                    <td>{emp.sn}</td>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.num}</td>
                    <td>{emp.em}</td>
                    <td>{emp.role}</td>
                    <td>
                      <button onClick={onViewClick} className={styles.submit}>
                        View
                      </button>
                    </td>
                    <td>
                      <button className="cancelbtn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewclick && <ManageEmpProfile/>}
    </>
  );
}

export default ManageEmployees;
