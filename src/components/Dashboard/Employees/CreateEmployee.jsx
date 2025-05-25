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
    warehouseId: "",
  });

  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState();
  const [warehouses, setWarehouses] = useState([]);

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
        const [rolesRes, warehousesRes] = await Promise.all([
          axiosAPI.get("/employees/roles"),
          axiosAPI.get("/warehouse"),
        ]);

        // console.log(rolesRes);
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

  useEffect(() => {
    // console.log(selectedRoles);
    async function fetch() {
      // console.log(selectedRoles[selectedRoles.length - 1]);
      try {
        setLoading(true);
        const res = await axiosAPI.get(
          `/employees/supervisors/${selectedRoles[selectedRoles.length - 1]}`
        );

        // console.log(res);
        setSupervisors(res.data.supervisors);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load initial data."
        );
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    if (selectedRoles.length > 0) fetch();
  }, [selectedRoles]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addRole = (roleId) => {
    const parsedId = parseInt(roleId);
    if (!selectedRoles.includes(parsedId)) {
      setSelectedRoles((prev) => [...prev, parsedId]);
    }
  };

  const removeRole = (index) => {
    setSelectedRoles((prev) => prev.filter((_, i) => i !== index));
  };

  const availableRoles = roles.filter((r) => !selectedRoles.includes(r.id));

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.employeeId ||
      !form.email ||
      !form.mobile ||
      !form.warehouseId ||
      !selectedSupervisor ||
      selectedRoles.length === 0
    ) {
      setError("Please Fill all the fields");
      setIsModalOpen(true);
      return;
    }

    // console.log("submitting");

    const payload = {
      ...form,
      roleIds: selectedRoles,
      supervisorId: parseInt(selectedSupervisor),
      warehouseId: parseInt(form.warehouseId),
    };

    // console.log(payload);
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
                <option value="" disabled>
                  -- Add Role --
                </option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {supervisors && (
            <>
              {" "}
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
                <button
                  className="submitbtn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  create
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
        </div>
        {successful && (
          <div className="row m-0 p-3  justify-content-center">
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

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default CreateEmployee;
