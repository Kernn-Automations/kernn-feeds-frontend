import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Settings.module.css";
import settingsService from "../../../services/settingsService";
import Loading from "../../Loading";
import ErrorModal from "../../ErrorModal";

const IndentRevertingSettings = ({ navigate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [settings, setSettings] = useState({
    audit_lock_day: 0,
      role_revert_periods: {
      store_manager: 0,
      division_head: 0,
      zbm: 0,
      rbm: 0,
      abm: 0,
      admin: 0,
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getSettings();
      // Parse nested structure: data.setting.value
      const settingsData = data.setting?.value || data;
      
      // Filter out super_admin from role_revert_periods if present
      const rolePeriods = settingsData.role_revert_periods || {};
      const filteredRolePeriods = Object.keys(rolePeriods)
        .filter(key => key !== 'super_admin')
        .reduce((obj, key) => {
          obj[key] = rolePeriods[key];
          return obj;
        }, {});

      setSettings(prev => ({
        ...prev,
        ...settingsData,
        role_revert_periods: {
          ...prev.role_revert_periods, // Keep defaults
          ...filteredRolePeriods
        }
      }));
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Failed to fetch settings");
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditLockDayChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setSettings(prev => ({
      ...prev,
      audit_lock_day: value
    }));
  };

  const handleRoleRevertPeriodChange = (role, value) => {
    const period = parseInt(value) || 0;
    setSettings(prev => ({
      ...prev,
      role_revert_periods: {
        ...prev.role_revert_periods,
        [role]: period
      }
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage("");
      
      await settingsService.updateSettings(settings);
      
      setSuccessMessage("Settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Refresh to ensure we have latest data
      fetchSettings();
    } catch (err) {
      console.error("Error updating settings:", err);
      setError(err.message || "Failed to update settings");
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setError(null);
  };

  if (loading && !settings.audit_lock_day && !Object.keys(settings.role_revert_periods).some(k => settings.role_revert_periods[k])) {
    return <Loading />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="row m-0">
        <div className="col-12 p-3">
          <div className="d-flex align-items-center mb-4">
            <button 
              className="btn btn-secondary me-3" 
              onClick={() => navigate("/settings")}
            >
              <i className="bi bi-arrow-left"></i> Back
            </button>
            <h2 className="m-0">Indent Reverting Settings</h2>
          </div>

          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">General Settings</h5>
            </div>
            <div className="card-body">
              <div className="form-group mb-3">
                <label className="form-label fw-bold">Audit Lock Day (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.audit_lock_day}
                  onChange={handleAuditLockDayChange}
                  min="0"
                />
                <small className="text-muted">Number of days before audit locks</small>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Role Revert Periods (Hours)</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.keys(settings.role_revert_periods).map(role => (
                  <div className="col-md-6 mb-3" key={role}>
                    <div className="form-group">
                      <label className="form-label fw-bold text-capitalize">
                        {role.replace(/_/g, " ")}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={settings.role_revert_periods[role]}
                        onChange={(e) => handleRoleRevertPeriodChange(role, e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4 mb-5">
            <button 
              className="btn btn-primary px-4 py-2"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
      
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        errorMessage={error}
      />
    </div>
  );
};

export default IndentRevertingSettings;
