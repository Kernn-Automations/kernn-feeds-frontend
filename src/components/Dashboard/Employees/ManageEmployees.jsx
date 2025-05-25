import React, { useEffect, useState } from "react";
import styles from "./Employees.module.css";
import ManageEmpProfile from "./ManageEmpProfile";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import EmployeeViewModal from "./EmployeeViewModal";

function ManageEmployees({ navigate }) {
  const [employees, setEmployees] = useState();

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [successful, setSuccessful] = useState();

  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/employees");

        // console.log(res);
        setEmployees(res.data.employees);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load initial data."
        );
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, []);

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/employees")}>Employees</span>{" "}
        <i class="bi bi-chevron-right"></i> Manage Employees
      </p>

      {employees && (
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                  <tr>
                    <td>NO DATA FOUND</td>
                  </tr>
                )}
                {employees.length > 0 &&
                  employees.map((emp) => (
                    <tr
                    key={emp.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.mobile}</td>
                      <td>{emp.email}</td>
                      <td>
                        <EmployeeViewModal employee={emp} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default ManageEmployees;
