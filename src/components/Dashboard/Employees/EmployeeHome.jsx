import React from 'react'
import styles from './Employees.module.css'

function EmployeeHome({navigate}) {
  return (
    <>
      <div className="row m-0 p-3">
        <div className="col">
          <button className="homebtn" onClick={() => navigate("/employees/create-employee")}>
           Create Employee
          </button>
          {/* <button
            className="homebtn"
            onClick={() => navigate("/employees/assign-role")}
          >
            Assign Role
          </button> */}
          <button
            className="homebtn"
            onClick={() => navigate("/employees/manage-employees")}
          >
            Manage Employees
          </button>
        </div>
      </div>
    </>
  )
}

export default EmployeeHome
