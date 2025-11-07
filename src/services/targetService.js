import axiosInstance from './apiService';

/**
 * Target Service - Handles all target-related API calls
 */
class TargetService {
  
  /**
   * Create a new target
   * @param {Object} targetData - Target creation data
   * @returns {Promise} API response
   */
  async createTarget(targetData) {
    try {
      const response = await axiosInstance.post('/targets', targetData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all targets with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  async getAllTargets(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await axiosInstance.get(`/targets?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single target by ID
   * @param {number} targetId - Target ID
   * @returns {Promise} API response
   */
  async getTargetById(targetId) {
    try {
      const response = await axiosInstance.get(`/targets/${targetId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update target
   * @param {number} targetId - Target ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} API response
   */
  async updateTarget(targetId, updateData) {
    try {
      const response = await axiosInstance.put(`/targets/${targetId}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete target
   * @param {number} targetId - Target ID
   * @returns {Promise} API response
   */
  async deleteTarget(targetId) {
    try {
      const response = await axiosInstance.delete(`/targets/${targetId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get teams for dropdown
   * @param {string|number} divisionId - Division ID (optional)
   * @returns {Promise} API response
   */
  async getTeams(divisionId = null) {
    try {
      // New dropdown endpoint
      const response = await axiosInstance.get('/targets/dropdowns/teams');
      const data = await response.json();
      console.log('Teams dropdown API response:', data);
      
      // Accept several possible shapes robustly
      const possibleTeams =
        (Array.isArray(data) ? data : null) ||
        data?.teams ||
        data?.data?.teams ||
        data?.data ||
        [];
      const teams = Array.isArray(possibleTeams) ? possibleTeams : [];
      console.log('Extracted teams:', teams);
      
      return { teams };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get employees for dropdown
   * @param {string|number} divisionId - Division ID (optional)
   * @returns {Promise} API response
   */
  async getEmployees(divisionId = null) {
    try {
      // New dropdown endpoint
      const response = await axiosInstance.get('/targets/dropdowns/employees');
      const data = await response.json();
      console.log('Employees dropdown API response:', data);
      
      // Accept several possible shapes robustly
      const possibleEmployees =
        (Array.isArray(data) ? data : null) ||
        data?.employees ||
        data?.data?.employees ||
        data?.data ||
        [];
      const employees = Array.isArray(possibleEmployees) ? possibleEmployees : [];
      console.log('Extracted employees:', employees);
      
      return { employees };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get assignment types for filter dropdown
   * @returns {Promise} API response
   */
  async getAssignmentTypes() {
    try {
      const response = await axiosInstance.get('/targets/assignment-types');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get target types for filter dropdown
   * @returns {Promise} API response
   */
  async getTargetTypes() {
    try {
      const response = await axiosInstance.get('/targets/target-types');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const status = error.response.status;
      return new Error(`${status}: ${message}`);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error: No response from server');
    } else {
      // Something else happened
      return new Error(`Request error: ${error.message}`);
    }
  }
}

export default new TargetService();



