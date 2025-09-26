import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import CreateTargetModal from "./CreateTargetModal";

function TargetReports({ navigate }) {
  const { axiosAPI } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || "";

  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const closeError = () => setIsErrorOpen(false);
  const refresh = () => setTrigger((t) => !t);

  useEffect(() => {
    fetchActiveTargetsWithAssignments();
  }, [trigger]);

  const fetchActiveTargetsWithAssignments = async () => {
    try {
      setLoading(true);
      // 1) Fetch active targets (via axiosAPI, proxied in dev)
      const res = await axiosAPI.get("/targets/targets", { status: "active" });
      const rows = Array.isArray(res.data?.targets)
        ? res.data.targets
        : Array.isArray(res.data)
        ? res.data
        : [];

      // 2) For each target, fetch assignments via NEW endpoint using absolute backend URL
      const enriched = await Promise.all(
        rows.map(async (t) => {
          try {
            const url = `${API_BASE}/targets/${t.id}/assignments`;
            const ar = await axiosAPI.get(url);
            const assignments = Array.isArray(ar.data?.assignments)
              ? ar.data.assignments
              : Array.isArray(ar.data)
              ? ar.data
              : [];
            return { ...t, __assignments: assignments };
          } catch (_e) {
            return { ...t, __assignments: [] };
          }
        })
      );

      setTargets(enriched);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to fetch targets");
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const renderParticulars = (row) => {
    const assignments = Array.isArray(row?.__assignments) ? row.__assignments : [];

    if (assignments.length) {
      const names = assignments
        .map((a) => {
          if (a.assignmentType === "team" && a.team) return a.team.name;
          if (a.assignmentType === "employee" && a.employee) return a.employee.name;
          if (a.team) return a.team.name;
          if (a.employee) return a.employee.name;
          return null;
        })
        .filter(Boolean);
      if (names.length) return names.join(", ");
    }

    const teamNames = Array.isArray(row?.assignedTeams)
      ? row.assignedTeams.map((t) => t.name).filter(Boolean)
      : [];
    const employeeNames = Array.isArray(row?.assignedEmployees)
      ? row.assignedEmployees.map((e) => e.name).filter(Boolean)
      : [];
    const names = [...teamNames, ...employeeNames];
    return names.length ? names.join(", ") : "-";
  };

  const renderTargetNumber = (row) => {
    if (row?.budgetNumber != null) return row.budgetNumber;
    return "-";
  };

  const renderTargetUnit = (row) => {
    return row?.budgetUnit || "-";
  };

  const renderAssignedOn = (row) => {
    return row?.startDate || row?.createdAt || "-";
  };

  const renderDeadline = (row) => {
    return row?.endDate || "-";
  };

  const renderCurrentlyMet = (row) => {
    const assignments = Array.isArray(row?.__assignments) ? row.__assignments : [];
    if (assignments.length) {
      const sumProgress = assignments
        .map((a) => (a.currentProgress != null ? Number(a.currentProgress) : 0))
        .reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
      if (sumProgress > 0) return sumProgress;
    }
    return "-";
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i class="bi bi-chevron-right"></i> Target-Reports
      </p>

      <div className="row m-0 p-3">
        <div className="col d-flex align-items-center justify-content-between">
          <h5 className="m-0">Active Targets</h5>
          <CreateTargetModal onCreated={refresh} />
        </div>
      </div>

      {loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-10">
            <div className="text-center">
              <Loading />
              <p className="mt-2 text-muted">Loading active targets...</p>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-md-10">
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Particulars</th>
                  <th>Target Number</th>
                  <th>Target Unit</th>
                  <th>Assigned On</th>
                  <th>Deadline</th>
                  <th>Currently Met</th>
                </tr>
              </thead>
              <tbody>
                {targets.length === 0 && (
                  <tr className="animated-row">
                    <td colSpan={7}>NO DATA FOUND</td>
                  </tr>
                )}
                {targets.map((row, idx) => (
                  <tr
                    key={row.id || row.targetCode || idx}
                    className="animated-row"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <td>{idx + 1}</td>
                    <td>{renderParticulars(row)}</td>
                    <td>{renderTargetNumber(row)}</td>
                    <td>{renderTargetUnit(row)}</td>
                    <td>{renderAssignedOn(row)}</td>
                    <td>{renderDeadline(row)}</td>
                    <td>{renderCurrentlyMet(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isErrorOpen && (
        <ErrorModal isOpen={isErrorOpen} message={error} onClose={closeError} />
      )}
    </>
  );
}

export default TargetReports;
