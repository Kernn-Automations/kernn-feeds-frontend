import React, { useState, useEffect } from "react";
import { useAuth } from "@/Auth";
import styles from "./Targets.module.css";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import targetService from "@/services/targetService";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";

function CreateTargetModal({ isOpen, onClose, onSuccess }) {
  const { axiosAPI } = useAuth();
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    targetType: 'sales',
    assignmentType: 'team',
    budgetNumber: '',
    budgetUnit: 'rupees',
    timeFrame: 'months',
    timeFrameValue: '',
    startDate: '',
    endDate: '',
    description: '',
    teamIds: [],
    employeeIds: []
  });

  // Dropdown options
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  // Load dropdown data
  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  // Load employees when assignment type changes to employee
  useEffect(() => {
    if (formData.assignmentType === 'employee') {
      loadEmployees();
    }
  }, [formData.assignmentType]);

  /**
   * Load dropdown data (teams and employees)
   */
  const loadDropdownData = async () => {
    try {
      setLoading(true);
      const teamsResponse = await targetService.getTeams();
      setTeams(teamsResponse.teams || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      setError("Failed to load dropdown data");
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load employees for current division
   */
  const loadEmployees = async () => {
    try {
      const currentDivisionId = localStorage.getItem('currentDivisionId') || '1';
      const employeesResponse = await targetService.getEmployees(currentDivisionId);
      setEmployees(employeesResponse.employees || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      setError("Failed to load employees");
      setIsErrorModalOpen(true);
    }
  };

  /**
   * Handle form field changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }

    // Reset selections when assignment type changes
    if (field === 'assignmentType') {
      setFormData(prev => ({
        ...prev,
        teamIds: [],
        employeeIds: []
      }));
    }
  };

  /**
   * Handle multi-select changes
   */
  const handleMultiSelectChange = (field, selectedOptions) => {
    const values = Array.from(selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.budgetNumber || formData.budgetNumber <= 0) newErrors.budgetNumber = true;
    if (!formData.timeFrameValue || formData.timeFrameValue <= 0) newErrors.timeFrameValue = true;
    if (!formData.startDate) newErrors.startDate = true;
    if (!formData.endDate) newErrors.endDate = true;
    
    // Validate assignment selection
    if (formData.assignmentType === 'team' && formData.teamIds.length === 0) {
      newErrors.teamIds = true;
    }
    if (formData.assignmentType === 'employee' && formData.employeeIds.length === 0) {
      newErrors.employeeIds = true;
    }

    // Validate date range
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for API
      const targetData = {
        name: formData.name.trim(),
        targetType: formData.targetType,
        assignmentType: formData.assignmentType,
        budgetNumber: parseFloat(formData.budgetNumber),
        budgetUnit: formData.budgetUnit,
        timeFrame: formData.timeFrame,
        timeFrameValue: parseInt(formData.timeFrameValue),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim()
      };

      // Add assignment IDs
      if (formData.assignmentType === 'team') {
        targetData.teamIds = formData.teamIds;
      } else {
        targetData.employeeIds = formData.employeeIds;
      }

      await targetService.createTarget(targetData);
      
      // Reset form
      setFormData({
        name: '',
        targetType: 'sales',
        assignmentType: 'team',
        budgetNumber: '',
        budgetUnit: 'rupees',
        timeFrame: 'months',
        timeFrameValue: '',
        startDate: '',
        endDate: '',
        description: '',
        teamIds: [],
        employeeIds: []
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error creating target:", error);
      setError(error.message || "Failed to create target");
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Budget unit options
   */
  const budgetUnits = [
    { value: 'rupees', label: 'Rupees (₹)' },
    { value: 'tons', label: 'Tons' },
    { value: 'bags', label: 'Bags' },
    { value: 'count', label: 'Count' }
  ];

  return (
    <>
      <DialogRoot open={isOpen} onOpenChange={onClose} placement="center" size="xl">
        <DialogContent className="mdl">
          <DialogBody>
            <h3 className="px-3 pb-3 mdl-title">Create New Target</h3>
            
            <div className="container-fluid">
              {/* Basic Information */}
              <div className="row">
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>Target Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter target name"
                      className={errors.name ? styles.errorField : ''}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>Target Type *</label>
                    <select
                      value={formData.targetType}
                      onChange={(e) => handleInputChange('targetType', e.target.value)}
                    >
                      <option value="sales">Sales Target</option>
                      <option value="customer">Customer Target</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignment Type */}
              <div className="row">
                <div className="col-12">
                  <div className="inputcolumn-mdl">
                    <label>Assignment Type *</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="assignmentType"
                          id="assignmentTeam"
                          value="team"
                          checked={formData.assignmentType === 'team'}
                          onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="assignmentTeam">
                          Assign to Teams
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="assignmentType"
                          id="assignmentEmployee"
                          value="employee"
                          checked={formData.assignmentType === 'employee'}
                          onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="assignmentEmployee">
                          Assign to Employees
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Selection */}
              <div className="row">
                <div className="col-12">
                  {formData.assignmentType === 'team' ? (
                    <div className="inputcolumn-mdl">
                      <label>Select Teams *</label>
                      <select
                        multiple
                        value={formData.teamIds.map(id => id.toString())}
                        onChange={(e) => handleMultiSelectChange('teamIds', e.target.selectedOptions)}
                        className={errors.teamIds ? styles.errorField : ''}
                        style={{ minHeight: '120px' }}
                      >
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple teams</small>
                    </div>
                  ) : (
                    <div className="inputcolumn-mdl">
                      <label>Select Employees *</label>
                      <select
                        multiple
                        value={formData.employeeIds.map(id => id.toString())}
                        onChange={(e) => handleMultiSelectChange('employeeIds', e.target.selectedOptions)}
                        className={errors.employeeIds ? styles.errorField : ''}
                        style={{ minHeight: '120px' }}
                      >
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} ({employee.employeeId})
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple employees</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Information */}
              <div className="row">
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>Budget Amount *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budgetNumber}
                      onChange={(e) => handleInputChange('budgetNumber', e.target.value)}
                      placeholder="Enter budget amount"
                      className={errors.budgetNumber ? styles.errorField : ''}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>Budget Unit *</label>
                    <select
                      value={formData.budgetUnit}
                      onChange={(e) => handleInputChange('budgetUnit', e.target.value)}
                    >
                      {budgetUnits.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Time Frame */}
              <div className="row">
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>Time Frame Value *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.timeFrameValue}
                      onChange={(e) => handleInputChange('timeFrameValue', e.target.value)}
                      placeholder="Enter duration"
                      className={errors.timeFrameValue ? styles.errorField : ''}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>Time Frame Unit *</label>
                    <select
                      value={formData.timeFrame}
                      onChange={(e) => handleInputChange('timeFrame', e.target.value)}
                    >
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="row">
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={errors.startDate ? styles.errorField : ''}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="inputcolumn-mdl">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={errors.endDate ? styles.errorField : ''}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="row">
                <div className="col-12">
                  <div className="inputcolumn-mdl">
                    <label>Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter target description (optional)"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!loading && (
                <div className="row pt-3 mt-3">
                  <div className="col-12 text-center">
                    <button
                      type="button"
                      className="submitbtn me-3"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      Create Target
                    </button>
                    <button
                      type="button"
                      className="cancelbtn"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="row pt-3 mt-3">
                  <div className="col-12 text-center">
                    <Loading />
                  </div>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>

      {/* Error Modal */}
      {isErrorModalOpen && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          message={error}
          onClose={() => {
            setIsErrorModalOpen(false);
            setError(null);
          }}
        />
      )}
    </>
  );
}

export default CreateTargetModal;



