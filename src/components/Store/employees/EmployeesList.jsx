import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Dashboard/Purchases/Purchases.module.css";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

export default function EmployeesList() {
  const navigate = useNavigate();
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [employees, setEmployees] = useState([
    { id: "EMP001", name: "Rajesh Kumar", mobile: "9876543210", email: "rajesh@example.com", sales: 45 },
    { id: "EMP002", name: "Priya Sharma", mobile: "9876543211", email: "priya@example.com", sales: 38 },
    { id: "EMP003", name: "Amit Singh", mobile: "9876543212", email: "amit@example.com", sales: 32 },
    { id: "EMP004", name: "Sneha Patel", mobile: "9876543213", email: "sneha@example.com", sales: 28 },
    { id: "EMP005", name: "Vikram Mehta", mobile: "9876543214", email: "vikram@example.com", sales: 22 },
    { id: "EMP006", name: "Anjali Desai", mobile: "9876543215", email: "anjali@example.com", sales: 35 },
    { id: "EMP007", name: "Rahul Verma", mobile: "9876543216", email: "rahul@example.com", sales: 29 },
    { id: "EMP008", name: "Kavita Nair", mobile: "9876543217", email: "kavita@example.com", sales: 26 },
    { id: "EMP009", name: "Suresh Reddy", mobile: "9876543218", email: "suresh@example.com", sales: 31 },
    { id: "EMP010", name: "Meera Joshi", mobile: "9876543219", email: "meera@example.com", sales: 24 },
    { id: "EMP011", name: "Arjun Malhotra", mobile: "9876543220", email: "arjun@example.com", sales: 27 },
    { id: "EMP012", name: "Divya Iyer", mobile: "9876543221", email: "divya@example.com", sales: 33 },
    { id: "EMP013", name: "Nikhil Kapoor", mobile: "9876543222", email: "nikhil@example.com", sales: 19 },
    { id: "EMP014", name: "Pooja Shah", mobile: "9876543223", email: "pooja@example.com", sales: 41 },
    { id: "EMP015", name: "Rohit Agarwal", mobile: "9876543224", email: "rohit@example.com", sales: 36 }
  ]);

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(employees.length / limit));
    setPageNo(1); // Reset page number when limit changes
  }, [limit, employees.length]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pageNo - 1) * limit;
    const endIndex = startIndex + limit;
    return employees.slice(startIndex, endIndex);
  };

  return (
    <>
      <p className="path">
        <span>Employees</span>
      </p>

      <div className="row m-0 p-3">
        <div className="col-12">
          <div className="row m-0 mb-3 justify-content-end">
            <div className={`${styles.entity}`} style={{ marginRight: 0 }}>
              <label htmlFor="">Entity :</label>
              <select
                name=""
                id=""
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <table className={`table table-bordered borderedtable`}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Mobile Number</th>
                <th>Email No.</th>
                <th>No. of Sales</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData().length === 0 ? (
                <tr>
                  <td colSpan={7}>NO DATA FOUND</td>
                </tr>
              ) : (
                getPaginatedData().map((employee, index) => {
                  const actualIndex = (pageNo - 1) * limit + index + 1;
                  return (
                    <tr
                      key={index}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{actualIndex}</td>
                      <td>{employee.id}</td>
                      <td>{employee.name}</td>
                      <td>{employee.mobile}</td>
                      <td>{employee.email}</td>
                      <td>{employee.sales}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/store/employees/${employee.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="row m-0 p-0 pt-3 justify-content-between">
            <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
              {pageNo > 1 && (
                <button onClick={() => setPageNo(pageNo - 1)}>
                  <span>
                    <FaArrowLeftLong />
                  </span>{" "}
                  Previous
                </button>
              )}
            </div>
            <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
              {pageNo < totalPages && (
                <button onClick={() => setPageNo(pageNo + 1)}>
                  Next{" "}
                  <span>
                    <FaArrowRightLong />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}















