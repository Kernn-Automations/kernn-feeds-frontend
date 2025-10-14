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
      let endpoint = '/teams';
      
      // Add division parameter if provided
      if (divisionId) {
        endpoint += `?divisionId=${divisionId}`;
      } else {
        // Check if we should show all divisions
        const currentDivisionId = localStorage.getItem('currentDivisionId');
        if (currentDivisionId === '1' || currentDivisionId === 'all') {
          endpoint += '?showAllDivisions=true';
        } else if (currentDivisionId && currentDivisionId !== '1') {
          endpoint += `?divisionId=${currentDivisionId}`;
        }
      }
      
      const response = await axiosInstance.get(endpoint);
      const data = response.data;
      console.log('Teams API response:', data);
      
      // Handle the actual API response structure
      // For teams: data.data.teams (nested structure)
      const teams = data?.data?.teams || [];
      console.log('Extracted teams:', teams);
      
      return { teams: Array.isArray(teams) ? teams : [] };
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
      let endpoint = '/employees';
      
      // Add division parameter if provided
      if (divisionId) {
        endpoint += `?divisionId=${divisionId}`;
      } else {
        // Check if we should show all divisions
        const currentDivisionId = localStorage.getItem('currentDivisionId');
        if (currentDivisionId === '1' || currentDivisionId === 'all') {
          endpoint += '?showAllDivisions=true';
        } else if (currentDivisionId && currentDivisionId !== '1') {
          endpoint += `?divisionId=${currentDivisionId}`;
        }
      }
      
      const response = await axiosInstance.get(endpoint);
      const data = response.data;
      console.log('Employees API response:', data);
      
      // Handle the actual API response structure
      // For employees: data.data (direct array)
      const employees = data?.data || [];
      console.log('Extracted employees:', employees);
      
      return { employees: Array.isArray(employees) ? employees : [] };
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



