import React, { useEffect, useState } from "react";
import styles from "./Employees.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function UpdateEmployee({ employee, setOnUpdate, onTrigger }) {
  const { axiosAPI } = useAuth();
  console.log(employee)
  const [form, setForm] = useState({
    name: employee.name,
    employeeId: employee.employeeId,
    email: employee.email,
    mobile: employee.mobile,
    warehouseId: employee.warehouseId,
  });

  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(employee.roles?.map((role) => role.id));
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(Number(employee.supervisorId));
  const [warehouses, setWarehouses] = useState([]);


  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successful, setSuccessful] = useState();

  const closeModal = () => setIsModalOpen(false);

  const adminRole = roles.find((r) => r.name.toLowerCase() === "admin");
  const isAdminSelected = selectedRoles.includes(adminRole?.id);

  const warehouseRequired = roles.some(
    (r) =>
      selectedRoles.includes(r.id) &&
      ["business officer", "warehouse manager", "area business manager"].includes(r.name.toLowerCase())
  );

  // Load roles and warehouses
  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        const [rolesRes, warehousesRes] = await Promise.all([
          axiosAPI.get("/employees/roles"),
          axiosAPI.get("/warehouse"),
        ]);
        setRoles(rolesRes.data.roles || []);
        setWarehouses(warehousesRes.data.warehouses || []);
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
        console.log(`/employees/supervisors/${lastRoleId}`)
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

    // Reset warehouse & supervisor if the conditions no longer apply
    if (
      !updatedRoles.some((roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return ["business officer", "warehouse manager"].includes(
          role?.name.toLowerCase()
        );
      })
    ) {
      setForm((prev) => ({ ...prev, warehouseId: "" }));
    }

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
      !form.email ||
      !form.mobile ||
      selectedRoles.length === 0 ||
      (warehouseRequired && !form.warehouseId) ||
      (!isAdminSelected && !selectedSupervisor)
    ) {
      setError("Please fill all the required fields.");
      setIsModalOpen(true);
      return;
    }

    const payload = {
      ...form,
      warehouseId: warehouseRequired ? parseInt(form.warehouseId) : null,
      roleIds: selectedRoles,
      supervisorId: isAdminSelected ? null : parseInt(selectedSupervisor),
    };
    console.log(payload)
    try {
      setLoading(true);
      const res = await axiosAPI.put(`/employees/${employee.id}`, payload);
      setSuccessful(res.data.message);
      onTrigger();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to Update employee.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

          {warehouseRequired && (
            <>
              <label className="mt-3">Warehouse:</label>
              <select
                name="warehouseId"
                value={form.warehouseId}
                onChange={handleFormChange}
              >
                <option value="">-- Select Warehouse --</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </>
          )}

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
                  Update
                </button>
                <button
                  className="cancelbtn"
                  onClick={() => setOnUpdate(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {successful && (
            <div className="row m-0 p-3 justify-content-center">
              <div className="col-12">
                <button
                  className="submitbtn"
                  onClick={() => setOnUpdate(null)}
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

export default UpdateEmployee;
