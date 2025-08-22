import React, { useEffect, useState } from "react";
import styles from "./Employees.module.css";
import ManageEmpProfile from "./ManageEmpProfile";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import EmployeeViewModal from "./EmployeeViewModal";
import UpdateEmployee from "./UpdateEmployee";
import DeleteModal from "./DeleteModal";

function ManageEmployees({ navigate, isAdmin }) {
  const [employees, setEmployees] = useState([]);
  const { axiosAPI } = useAuth();
  const { selectedDivision, getCurrentDivisionId, isAllDivisionsSelected } = useDivision();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const [successful, setSuccessful] = useState();
  const [trigger, setTrigger] = useState(false);
  const onTrigger = () => setTrigger(!trigger);

  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        
        // Check if API URL is available
        const apiUrl = import.meta.env.VITE_API_URL;
        
        if (!apiUrl) {
          throw new Error('API URL not configured. Please check your environment variables.');
        }
        
        // ✅ Get division ID from localStorage for division filtering
        const currentDivisionId = localStorage.getItem('currentDivisionId');
        const currentDivisionName = localStorage.getItem('currentDivisionName');
        const accessToken = localStorage.getItem('accessToken');
        
        // ✅ Add division parameters to endpoint
        let endpoint = "/employees";
        if (currentDivisionId && currentDivisionId !== '1') {
          endpoint += `?divisionId=${currentDivisionId}`;
        } else if (currentDivisionId === '1') {
          endpoint += `?showAllDivisions=true`;
        }
        
        const res = await axiosAPI.get(endpoint);
        
        // Handle the actual backend response structure
        if (res.data && res.data.success && res.data.data && Array.isArray(res.data.data)) {
          setEmployees(res.data.data);
        } else if (res.data && res.data.employees && Array.isArray(res.data.employees)) {
          setEmployees(res.data.employees);
        } else if (res.data && Array.isArray(res.data)) {
          setEmployees(res.data);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.error("Failed to load employees:", err);
        
        let errorMessage = "Failed to load initial data.";
        if (err.message.includes('API URL not configured')) {
          errorMessage = "API configuration error. Please check environment variables.";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (err.response?.status === 404) {
          errorMessage = "Employees endpoint not found.";
        } else if (err.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
        
        setError(errorMessage);
        setIsModalOpen(true);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, [trigger, axiosAPI]);

  const [onUpdate, setOnUpdate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  let index = 1;
  
  // Filter employees based on status
  const filteredEmployees = employees.filter(emp => {
    if (statusFilter === 'all') return true;
    return emp.status === statusFilter;
  });
  
  // Show loading state
  if (loading) {
    return (
      <div className="p-4">
        <Loading />
        <p className="text-center mt-3">Loading employees...</p>
      </div>
    );
  }

  // Show error state if there's an error and no employees
  if (error && (!employees || employees.length === 0)) {
    return (
      <div className="p-4">
        <p className="path">
          <span onClick={() => navigate("/employees")}>Employees</span>{" "}
          <i className="bi bi-chevron-right"></i> Manage Employees
        </p>
        <div className="alert alert-danger">
          <h5>Error Loading Employees</h5>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/employees")}>Employees</span>{" "}
        <i className="bi bi-chevron-right"></i> Manage Employees
      </p>

       {/* Show sample data if no employees loaded */}
      {(!employees || employees.length === 0) && !loading && (
        <div className="alert alert-warning m-3">
          <strong>No Employee Data Available</strong>
          <br />
          This could be due to:
          <ul>
            <li>API connection issues</li>
            <li>Authentication problems</li>
            <li>No employees in the current division</li>
            <li>Backend service not running</li>
          </ul>
          <button 
            className="btn btn-primary me-2" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <button 
            className="btn btn-secondary me-2" 
            onClick={() => navigate("/employees")}
          >
            Back to Employees
          </button>
          <button 
            className="btn btn-info" 
            onClick={() => {
              // Show sample data for testing
              setEmployees([
                {
                  id: 1,
                  employeeId: 'EMP001',
                  name: 'John Doe',
                  mobile: '+1234567890',
                  email: 'john.doe@example.com',
                  roles: [{ name: 'Manager' }]
                },
                {
                  id: 2,
                  employeeId: 'EMP002',
                  name: 'Jane Smith',
                  mobile: '+1234567891',
                  email: 'jane.smith@example.com',
                  roles: [{ name: 'Sales' }]
                }
              ]);
            }}
          >
            Show Sample Data
          </button>
        </div>
      )}

      {!onUpdate && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-10">
            {/* Filter Controls */}
            <div className="mb-3">
              <label className="form-label me-2">Filter by Status:</label>
              <select 
                className="form-select d-inline-block w-auto" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Employees</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              <span className="ms-3">
                Showing {filteredEmployees.length} of {employees.length} employees
              </span>
            </div>
            <table className={`table table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Emp ID</th>
                  <th>Employee Name</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Warehouse</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                                                  {(!filteredEmployees || filteredEmployees.length === 0) && (
                   <tr>
                     <td colSpan={isAdmin ? 9 : 8}>
                       {loading ? 'Loading...' : 'NO DATA FOUND'}
                     </td>
                   </tr>
                 )}
                 {filteredEmployees && filteredEmployees.length > 0 &&
                   filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{emp.employeeId || emp.id || "-"}</td>
                      <td>{emp.name || emp.employeeName || "-"}</td>
                      <td>{emp.mobile || emp.phone || "-"}</td>
                      <td>{emp.email || "-"}</td>
                                             <td>
                         {emp.primaryRole || 
                          (Array.isArray(emp.roles) && emp.roles.length > 0 ? emp.roles[0] : "-")}
                       </td>
                       <td>
                         <span className={`badge ${emp.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                           {emp.status || "-"}
                         </span>
                       </td>
                       <td>{emp.warehouse?.name || "-"}</td>
                       {isAdmin && (
                         <td className={styles.delcol}>
                           <button onClick={() => setOnUpdate(emp)}>
                             Update
                           </button>
                           <DeleteModal
                             employee={emp}
                             changeTrigger={onTrigger}
                           />
                         </td>
                       )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {onUpdate && (
        <UpdateEmployee
          employee={onUpdate}
          setOnUpdate={setOnUpdate}
          onTrigger={onTrigger}
        />
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default ManageEmployees;
