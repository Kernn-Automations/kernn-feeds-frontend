import React, { useEffect, useMemo, useState } from "react";
import styles from "./Employees.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import UpdateEmployee from "./UpdateEmployee";
import DeleteModal from "./DeleteModal";
import EmployeeViewModal from "./EmployeeViewModal";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function ManageEmployees({ navigate, isAdmin }) {
  const { axiosAPI } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [onUpdate, setOnUpdate] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState(null);

  const canEditEmployees = isAdmin;

  const closeModal = () => setIsModalOpen(false);
  const onTrigger = () => setTrigger((current) => !current);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (onUpdate && employees.length) {
      const refreshedEmployee = employees.find((employee) => employee.id === onUpdate.id);
      if (refreshedEmployee) {
        setOnUpdate(refreshedEmployee);
      }
    }
  }, [employees, onUpdate]);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true);
        const response = await axiosAPI.get("/employees", {
          page,
          limit,
          search,
          status: statusFilter,
        });

        const rows = response?.data?.data || [];
        setEmployees(Array.isArray(rows) ? rows : []);
        setPagination(response?.data?.pagination || null);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message || "Failed to load employees.",
        );
        setIsModalOpen(true);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, [axiosAPI, page, limit, search, statusFilter, trigger]);

  const totals = useMemo(() => {
    const active = employees.filter((employee) => employee.status === "Active").length;
    const inactive = employees.filter((employee) => employee.status !== "Active").length;
    const roles = new Set(
      employees.map((employee) => employee.primaryRole).filter(Boolean),
    );

    return {
      visible: employees.length,
      active,
      inactive,
      roles: roles.size,
    };
  }, [employees]);

  if (loading && !employees.length && !onUpdate) {
    return (
      <div className="p-4">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/employees")}>Employees</span>{" "}
        <i className="bi bi-chevron-right"></i> Manage Employees
      </p>

      {!onUpdate && (
        <div className={styles.employeeWorkspace}>
          <section className={styles.employeeHero}>
            <div>
              <h2>Manage Employees</h2>
              <p>
                Search, review, and update employee access without loading the
                whole organization at once.
              </p>
            </div>
            <div className={styles.employeeHeroStats}>
              <div className={styles.employeeHeroStat}>
                <span>Visible Rows</span>
                <strong>{totals.visible}</strong>
              </div>
              <div className={styles.employeeHeroStat}>
                <span>Active On Page</span>
                <strong>{totals.active}</strong>
              </div>
              <div className={styles.employeeHeroStat}>
                <span>Roles On Page</span>
                <strong>{totals.roles}</strong>
              </div>
            </div>
          </section>

          <section className={styles.employeeControlBar}>
            <div className={styles.employeeControlField}>
              <label>Search Employees</label>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, emp id, mobile, or email"
              />
            </div>

            <div className={styles.employeeControlField}>
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1);
                  setStatusFilter(event.target.value);
                }}
              >
                <option value="all">All Employees</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            <div className={styles.employeeControlField}>
              <label>Rows Per Page</label>
              <select
                value={limit}
                onChange={(event) => {
                  setPage(1);
                  setLimit(Number(event.target.value));
                }}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className={styles.employeeTableCard}>
            <div className={styles.employeeTableHeader}>
              <div>
                <h3>Employee Directory</h3>
                <p>
                  {pagination?.total || employees.length} employees matched this
                  view.
                </p>
              </div>
              {pagination && (
                <div className={styles.employeePaginationMeta}>
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              )}
            </div>

            <div className={styles.employeeTableWrap}>
              <table className={styles.employeeTable}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Team</th>
                    <th>Warehouse</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!employees.length && (
                    <tr>
                      <td colSpan="8" className={styles.employeeEmptyState}>
                        No employees matched this filter.
                      </td>
                    </tr>
                  )}

                  {employees.map((employee, index) => (
                    <tr key={employee.id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>
                        <div className={styles.employeeIdentity}>
                          <strong>{employee.name || "-"}</strong>
                          <span>{employee.employeeId || employee.id}</span>
                          {employee.email && <small>{employee.email}</small>}
                        </div>
                      </td>
                      <td>{employee.primaryRole || "-"}</td>
                      <td>
                        <div className={styles.employeeContact}>
                          <span>{employee.mobile || "-"}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.employeeBadge} ${
                            employee.status === "Active"
                              ? styles.employeeBadgeSuccess
                              : styles.employeeBadgeMuted
                          }`}
                        >
                          {employee.status || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.employeeBadge} ${
                            employee.teamStatus === "IN"
                              ? styles.employeeBadgeSuccess
                              : styles.employeeBadgeInfo
                          }`}
                        >
                          {employee.teamStatus || "NOT IN"}
                        </span>
                      </td>
                      <td>{employee.warehouse?.name || "-"}</td>
                      <td>
                        <div className={styles.employeeActionRow}>
                          <EmployeeViewModal employee={employee} />
                          {canEditEmployees && (
                            <button
                              className={styles.employeeSecondaryAction}
                              onClick={() => setOnUpdate(employee)}
                            >
                              Update
                            </button>
                          )}
                          {canEditEmployees && (
                            <DeleteModal employee={employee} changeTrigger={onTrigger} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className={styles.employeePaginationBar}>
                <button
                  className={styles.employeeSecondaryAction}
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total}
                </span>
                <button
                  className={styles.employeeSecondaryAction}
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {onUpdate && (
        <UpdateEmployee
          employee={onUpdate}
          setOnUpdate={setOnUpdate}
          onTrigger={onTrigger}
        />
      )}

      {loading && employees.length > 0 && <Loading />}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default ManageEmployees;
