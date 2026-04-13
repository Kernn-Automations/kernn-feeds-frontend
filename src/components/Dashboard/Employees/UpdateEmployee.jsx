import React, { useEffect, useState } from "react";
import styles from "./Employees.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function UpdateEmployee({ employee, setOnUpdate, onTrigger }) {
  const { axiosAPI } = useAuth();
  const [form, setForm] = useState({
    name: employee.name || "",
    employeeId: employee.employeeId || "",
    email: employee.email || "",
    mobile: employee.mobile || "",
    warehouseId: employee.warehouseId || "",
  });
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(
    employee.roles?.map((role) => role.id) || [],
  );
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(
    employee.supervisorId ? Number(employee.supervisorId) : "",
  );
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successful, setSuccessful] = useState("");

  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    setForm({
      name: employee.name || "",
      employeeId: employee.employeeId || "",
      email: employee.email || "",
      mobile: employee.mobile || "",
      warehouseId: employee.warehouseId || "",
    });
    setSelectedRoles(employee.roles?.map((role) => role.id) || []);
    setSelectedSupervisor(employee.supervisorId ? Number(employee.supervisorId) : "");
  }, [employee]);

  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        const currentDivisionId = localStorage.getItem("currentDivisionId");
        let warehousesEndpoint = "/warehouse";
        if (currentDivisionId && currentDivisionId !== "1") {
          warehousesEndpoint += `?divisionId=${currentDivisionId}`;
        } else if (currentDivisionId === "1") {
          warehousesEndpoint += "?showAllDivisions=true";
        }

        const [rolesRes, warehousesRes] =
          await Promise.allSettled([
            axiosAPI.get("/employees/roles"),
            axiosAPI.get(warehousesEndpoint),
          ]);

        if (rolesRes.status !== "fulfilled" || warehousesRes.status !== "fulfilled") {
          throw rolesRes.status !== "fulfilled" ? rolesRes.reason : warehousesRes.reason;
        }

        setRoles(rolesRes.value.data.roles || []);
        setWarehouses(warehousesRes.value.data.warehouses || []);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            "Failed to load employee details.",
        );
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInitial();
  }, [axiosAPI, employee.id]);

  useEffect(() => {
    async function fetchSupervisors() {
      const lastRoleId = selectedRoles[selectedRoles.length - 1];
      const lastRole = roles.find((role) => role.id === lastRoleId);

      if (!lastRole || lastRole.name.toLowerCase() === "admin") {
        setSupervisors([]);
        return;
      }

      try {
        const response = await axiosAPI.get(`/employees/supervisors/${lastRoleId}`);
        setSupervisors(response.data.supervisors || []);
      } catch (requestError) {
        setSupervisors([]);
      }
    }

    if (selectedRoles.length) {
      fetchSupervisors();
    }
  }, [axiosAPI, roles, selectedRoles]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const processedValue =
      name === "name" ? value.toUpperCase().replace(/\s\s+/g, " ") : value;
    setForm((current) => ({ ...current, [name]: processedValue }));
  };

  const addRole = (roleId) => {
    const parsedId = Number.parseInt(roleId, 10);
    if (Number.isInteger(parsedId) && !selectedRoles.includes(parsedId)) {
      setSelectedRoles((current) => [...current, parsedId]);
    }
  };

  const removeRole = (roleId) => {
    setSelectedRoles((current) => current.filter((item) => item !== roleId));
  };

  const availableRoles = roles.filter((role) => !selectedRoles.includes(role.id));
  const isAdminSelected = selectedRoles.some((roleId) => {
    const role = roles.find((item) => item.id === roleId);
    return role?.name?.toLowerCase() === "admin";
  });

  const warehouseOptionalRoles = [
    "business officer",
    "warehouse manager",
    "area business manager",
  ];
  const warehouseRequired = !selectedRoles.some((roleId) => {
    const role = roles.find((item) => item.id === roleId);
    return warehouseOptionalRoles.includes(role?.name?.toLowerCase());
  });

  const handleSubmit = async () => {
    const parsedSupervisorId =
      selectedSupervisor !== "" && selectedSupervisor != null
        ? Number.parseInt(selectedSupervisor, 10)
        : null;

    const supervisorRequired = !isAdminSelected && supervisors.length > 0;

    if (
      !form.name ||
      !form.employeeId ||
      !form.mobile ||
      !selectedRoles.length ||
      (warehouseRequired && !form.warehouseId) ||
      (supervisorRequired &&
        (parsedSupervisorId == null || Number.isNaN(parsedSupervisorId)))
    ) {
      setError("Please fill all required fields before updating.");
      setIsModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        warehouseId: warehouseRequired ? Number.parseInt(form.warehouseId, 10) : null,
        roleIds: selectedRoles,
        supervisorId: isAdminSelected ? null : parsedSupervisorId,
      };

      const response = await axiosAPI.put(`/employees/${employee.id}`, payload);
      setSuccessful(response.data.message || "Employee updated successfully.");
      onTrigger();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Failed to update employee.",
      );
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => setOnUpdate(false)}>Manage Employees</span>{" "}
        <i className="bi bi-chevron-right"></i> Update Employee
      </p>

      <div className={styles.employeeEditPage}>
        <section className={styles.employeeEditHero}>
          <div>
            <h2>Update Employee</h2>
            <p>
              Edit profile details and assigned roles in one place.
            </p>
          </div>
          <div className={styles.employeeEditHeroMeta}>
            <span>{employee.primaryRole || employee.roles?.[0]?.name || "No Role"}</span>
            <strong>{employee.employeeId || employee.id}</strong>
          </div>
        </section>

        <div className={styles.employeeEditGrid}>
          <section className={styles.employeeEditCard}>
            <h3>Profile Details</h3>
            <div className={styles.employeeFormGrid}>
              <label>
                <span>Full Name</span>
                <input name="name" value={form.name} onChange={handleFormChange} />
              </label>
              <label>
                <span>Employee ID</span>
                <input
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                <span>Email</span>
                <input name="email" value={form.email} onChange={handleFormChange} />
              </label>
              <label>
                <span>Mobile</span>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleFormChange}
                />
              </label>
              {warehouseRequired && (
                <label>
                  <span>Warehouse</span>
                  <select
                    name="warehouseId"
                    value={form.warehouseId || ""}
                    onChange={handleFormChange}
                  >
                    <option value="">-- Select Warehouse --</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {!isAdminSelected && supervisors.length > 0 && (
                <label>
                  <span>Supervisor</span>
                  <select
                    value={selectedSupervisor || ""}
                    onChange={(event) => setSelectedSupervisor(event.target.value)}
                  >
                    <option value="">-- Select Supervisor --</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </section>

          <section className={styles.employeeEditCard}>
            <h3>Roles</h3>
            <div className={styles.employeeRolePills}>
              {selectedRoles.map((roleId) => {
                const role = roles.find((item) => item.id === roleId);
                return (
                  <span key={roleId} className={styles.employeeRolePill}>
                    {role?.name || roleId}
                    <button type="button" onClick={() => removeRole(roleId)}>
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            {availableRoles.length > 0 && (
              <label className={styles.employeeSelectField}>
                <span>Add Role</span>
                <select defaultValue="" onChange={(event) => addRole(event.target.value)}>
                  <option value="">-- Add Role --</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </section>
        </div>

        <div className={styles.employeeEditActions}>
          {!successful ? (
            <>
              <button className={styles.employeePrimaryAction} onClick={handleSubmit}>
                Update Employee
              </button>
              <button
                className={styles.employeeSecondaryAction}
                onClick={() => setOnUpdate(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className={styles.employeePrimaryAction}
              onClick={() => setOnUpdate(false)}
            >
              {successful}
            </button>
          )}
        </div>
      </div>

      {loading && <Loading />}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default UpdateEmployee;
