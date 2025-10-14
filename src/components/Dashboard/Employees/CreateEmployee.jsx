import React, { useEffect, useState } from "react";
import styles from "./Employees.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function CreateEmployee({ navigate }) {
  const { axiosAPI } = useAuth();

  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    mobile: "",
  });

  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successful, setSuccessful] = useState();

  const closeModal = () => setIsModalOpen(false);

  const adminRole = roles.find((r) => r.name.toLowerCase() === "admin");
  const isAdminSelected = selectedRoles.includes(adminRole?.id);


  // Load roles
  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        const rolesRes = await axiosAPI.get("/employees/roles");
        setRoles(rolesRes.data.roles || []);
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

  // Fetch supervisors unless Admin is selected
  useEffect(() => {
    async function fetchSupervisors() {
      const lastRoleId = selectedRoles[selectedRoles.length - 1];
      const lastRole = roles.find((r) => r.id === lastRoleId);

      if (!lastRole || lastRole.name.toLowerCase() === "admin") {
        setSupervisors([]);
        return;
      }

      try {
        const res = await axiosAPI.get(`/employees/supervisors/${lastRoleId}`);
        setSupervisors(res.data.supervisors || []);
        console.log(res)
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load supervisors.");
        setIsModalOpen(true);
      }
    }

    if (selectedRoles.length > 0) {
      fetchSupervisors();
    }
  }, [selectedRoles, roles]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addRole = (roleId) => {
    if (roleId) {
      const parsedId = parseInt(roleId);
      if (!selectedRoles.includes(parsedId)) {
        setSelectedRoles((prev) => [...prev, parsedId]);
      }
    }
  };

  const removeRole = (index) => {
    const updatedRoles = selectedRoles.filter((_, i) => i !== index);
    setSelectedRoles(updatedRoles);

    if (
      updatedRoles.every((roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return role?.name.toLowerCase() === "admin";
      })
    ) {
      setSelectedSupervisor(undefined);
    }
  };

  const availableRoles = roles.filter((r) => !selectedRoles.includes(r.id));

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.employeeId ||
      !form.mobile ||
      selectedRoles.length === 0 ||
      (!isAdminSelected && !selectedSupervisor)
    ) {
      setError("Please fill all the required fields.");
      setIsModalOpen(true);
      return;
    }

    const payload = {
      ...form,
      roleIds: selectedRoles,
      supervisorId: isAdminSelected ? null : parseInt(selectedSupervisor),
    };

    try {
      setLoading(true);
      const res = await axiosAPI.post("/employees/add", payload);
      setSuccessful(res.data.message);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create employee.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/employees")}>Employees</span>{" "}
        <i className="bi bi-chevron-right"></i> Create Employee
      </p>

      <div className="row m-0 p-3 justify-content-center">
        <div className={`col-8 ${styles.longform}`}>
          <label>Full Name:</label>
          <input name="name" value={form.name} onChange={handleFormChange} />

          <label className="mt-3">Employee ID:</label>
          <input
            name="employeeId"
            value={form.employeeId}
            onChange={handleFormChange}
          />

          <label className="mt-3">Email:</label>
          <input name="email" value={form.email} onChange={handleFormChange} />

          <label className="mt-3">Mobile:</label>
          <input
            name="mobile"
            value={form.mobile}
            onChange={handleFormChange}
          />

          {selectedRoles.map((roleId, index) => {
            const role = roles.find((r) => r.id === roleId);
            return (
              <div
                key={roleId}
                className={`d-flex justify-content-between align-items-center pt-2 mb-2 ${styles.longform}`}
              >
                <span>{role?.name}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeRole(index)}
                >
                  Remove
                </button>
              </div>
            );
          })}
          {availableRoles.length > 0 && (
            <>
              <label className="mt-3">Roles:</label>
              <select onChange={(e) => addRole(e.target.value)} defaultValue="">
                <option value="null">-- Add Role --</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Warehouse selection removed as it's no longer needed */}

          {!isAdminSelected && supervisors.length > 0 && (
            <>
              <label className="mt-3">Supervisor:</label>
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
              >
                <option value="">-- Select Supervisor --</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {!loading && !successful && (
            <div className="row m-0 p-3 justify-content-center">
              <div className="col-9">
                <button className="submitbtn" onClick={handleSubmit}>
                  Create
                </button>
                <button
                  className="cancelbtn"
                  onClick={() => navigate("/employees")}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {successful && (
            <div className="row m-0 p-3 justify-content-center">
              <div className="col-4">
                <button
                  className="submitbtn"
                  onClick={() => navigate("/employees")}
                >
                  {successful}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default CreateEmployee;
