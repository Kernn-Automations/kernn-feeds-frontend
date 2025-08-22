import React, { useState, useEffect } from "react";
import { useAuth } from "../../Auth";
import Loading from "../Loading";
import ErrorModal from "../ErrorModal";
import styles from "./DivisionManager.module.css";

function DivisionManager() {
  const { axiosAPI } = useAuth();
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDivision, setNewDivision] = useState({ name: "", state: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      console.log("Fetching divisions...");
      
      // Try different endpoints as per the backend routes
      let response;
      try {
        // First try the main divisions endpoint
        response = await axiosAPI.get("/divisions");
        console.log("Divisions response (main):", response);
      } catch (mainError) {
        console.log("Main endpoint failed, trying /divisions/all");
        // If main endpoint fails, try the alternative
        response = await axiosAPI.get("/divisions/all");
        console.log("Divisions response (all):", response);
      }
      
      if (response.status === 200) {
        // Handle different possible response structures
        const divisionsData = response.data.divisions || response.data.data || response.data || [];
        console.log("Divisions data:", divisionsData);
        
        let processedDivisions = [];
        if (Array.isArray(divisionsData)) {
          processedDivisions = divisionsData;
        } else if (typeof divisionsData === 'object' && divisionsData !== null) {
          // If it's an object, try to extract divisions from it
          const extractedDivisions = Object.values(divisionsData).find(item => Array.isArray(item)) || [];
          processedDivisions = extractedDivisions;
        } else {
          processedDivisions = [];
        }

        console.log("Processed divisions:", processedDivisions);

        // Try to fetch statistics for each division, but don't fail if the endpoint doesn't exist
        const divisionsWithStats = await Promise.all(
          processedDivisions.map(async (division) => {
            console.log(`Fetching statistics for division ${division.id} (${division.name})`);
            try {
              // Try to fetch statistics for this division
              const statsResponse = await axiosAPI.get(`/divisions/${division.id}/statistics`);
              console.log(`Statistics response for division ${division.id}:`, statsResponse.data);
              
              // Handle the exact backend response structure
              const statsData = statsResponse.data?.data?.statistics || statsResponse.data?.statistics || {};
              console.log(`Extracted stats data for division ${division.id}:`, statsData);
              
              const divisionWithStats = {
                ...division,
                userCount: statsData.employees || statsData.users || statsData.userCount || 0,
                warehouseCount: statsData.warehouses || statsData.warehouseCount || 0,
                customerCount: statsData.customers || 0,
                productCount: statsData.products || 0,
                salesOrderCount: statsData.salesOrders || 0,
                purchaseOrderCount: statsData.purchaseOrders || 0,
              };
              
              console.log(`Final division with stats for ${division.id}:`, divisionWithStats);
              return divisionWithStats;
            } catch (statsError) {
              console.log(`No statistics available for division ${division.id}:`, statsError.message);
              console.log(`Stats error details:`, statsError.response?.data || statsError);
              
              // If statistics endpoint doesn't exist or fails, try to get counts from the division object itself
              const divisionWithFallbackStats = {
                ...division,
                userCount: division.userCount || division.usersCount || division.totalUsers || division.users || division.employees || division._count?.users || 0,
                warehouseCount: division.warehouseCount || division.warehousesCount || division.totalWarehouses || division.warehouses || division._count?.warehouses || 0,
                customerCount: division.customerCount || division.customers || 0,
                productCount: division.productCount || division.products || 0,
                salesOrderCount: division.salesOrderCount || division.salesOrders || 0,
                purchaseOrderCount: division.purchaseOrderCount || division.purchaseOrders || 0,
              };
              
              console.log(`Division with fallback stats for ${division.id}:`, divisionWithFallbackStats);
              return divisionWithFallbackStats;
            }
          })
        );

        console.log("Final divisions with stats:", divisionsWithStats);
        setDivisions(divisionsWithStats);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch divisions";
      setError(errorMessage);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh statistics
  const refreshStatistics = async () => {
    if (divisions.length === 0) return;
    
    try {
      setLoading(true);
      console.log("Refreshing statistics...");
      
      const divisionsWithRefreshedStats = await Promise.all(
        divisions.map(async (division) => {
          console.log(`Refreshing statistics for division ${division.id} (${division.name})`);
          try {
            // Try to fetch statistics for this division
            const statsResponse = await axiosAPI.get(`/divisions/${division.id}/statistics`);
            console.log(`Refreshed statistics response for division ${division.id}:`, statsResponse.data);
            
            // Handle the exact backend response structure
            const statsData = statsResponse.data?.data?.statistics || statsResponse.data?.statistics || {};
            console.log(`Extracted refreshed stats data for division ${division.id}:`, statsData);
            
            const divisionWithStats = {
              ...division,
              userCount: statsData.employees || statsData.users || statsData.userCount || 0,
              warehouseCount: statsData.warehouses || statsData.warehouseCount || 0,
              customerCount: statsData.customers || 0,
              productCount: statsData.products || 0,
              salesOrderCount: statsData.salesOrders || 0,
              purchaseOrderCount: statsData.purchaseOrders || 0,
            };
            
            console.log(`Final refreshed division with stats for ${division.id}:`, divisionWithStats);
            return divisionWithStats;
          } catch (statsError) {
            console.log(`Failed to refresh statistics for division ${division.id}:`, statsError.message);
            return division; // Return the division as is if refresh fails
          }
        })
      );

      console.log("Final divisions with refreshed stats:", divisionsWithRefreshedStats);
      setDivisions(divisionsWithRefreshedStats);
    } catch (error) {
      console.error("Error refreshing statistics:", error);
      setError("Failed to refresh statistics");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user count from division object
  const getUserCount = (division) => {
    // Check for different possible field names for user count
    return division.userCount || 
           division.usersCount || 
           division.totalUsers || 
           division.users || 
           division.employees ||
           division._count?.users ||
           division.statistics?.users ||
           0;
  };

  // Helper function to get warehouse count from division object
  const getWarehouseCount = (division) => {
    // Check for different possible field names for warehouse count
    return division.warehouseCount || 
           division.warehousesCount || 
           division.totalWarehouses || 
           division.warehouses || 
           division._count?.warehouses ||
           division.statistics?.warehouses ||
           0;
  };

  // Helper function to get customer count from division object
  const getCustomerCount = (division) => {
    return division.customerCount || division.customers || 0;
  };

  // Helper function to get product count from division object
  const getProductCount = (division) => {
    return division.productCount || division.products || 0;
  };

  // Helper function to get sales order count from division object
  const getSalesOrderCount = (division) => {
    return division.salesOrderCount || division.salesOrders || 0;
  };

  // Helper function to get purchase order count from division object
  const getPurchaseOrderCount = (division) => {
    return division.purchaseOrderCount || division.purchaseOrders || 0;
  };

  const handleCreateDivision = async (e) => {
    e.preventDefault();
    if (!newDivision.name || !newDivision.state) {
      setError("Please fill in all fields");
      setIsModalOpen(true);
      return;
    }

    try {
      setCreating(true);
      console.log("Creating division:", newDivision);
      
      // Try different endpoints as per the backend routes
      let response;
      try {
        // First try the main create endpoint
        response = await axiosAPI.post("/divisions", newDivision);
        console.log("Create division response (main):", response);
      } catch (mainError) {
        console.log("Main create endpoint failed, trying /divisions/create");
        // If main endpoint fails, try the alternative
        response = await axiosAPI.post("/divisions/create", newDivision);
        console.log("Create division response (create):", response);
      }
      
      if (response.status === 201 || response.status === 200) {
        setNewDivision({ name: "", state: "" });
        setShowCreateForm(false);
        // Show success message
        setError("Division created successfully!");
        setIsModalOpen(true);
        fetchDivisions(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating division:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create division";
      setError(errorMessage);
      setIsModalOpen(true);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDivision = async (divisionId) => {
    if (!window.confirm("Are you sure you want to delete this division?")) {
      return;
    }

    try {
      const response = await axiosAPI.delete(`/divisions/${divisionId}`);
      if (response.status === 200) {
        setError("Division deleted successfully!");
        setIsModalOpen(true);
        fetchDivisions(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting division:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete division";
      setError(errorMessage);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(""); // Clear error when modal is closed
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Division Management</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.refreshButton}
              onClick={refreshStatistics}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Statistics"}
            </button>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "Create New Division"}
          </button>
          </div>
        </div>

        {showCreateForm && (
          <div className={styles.createForm}>
            <h3>Create New Division</h3>
            <form onSubmit={handleCreateDivision}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Division Name:</label>
                <input
                  type="text"
                  id="name"
                  value={newDivision.name}
                  onChange={(e) =>
                    setNewDivision({ ...newDivision, name: e.target.value })
                  }
                  placeholder="Enter division name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="state">State:</label>
                <input
                  type="text"
                  id="state"
                  value={newDivision.state}
                  onChange={(e) =>
                    setNewDivision({ ...newDivision, state: e.target.value })
                  }
                  placeholder="Enter state"
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Division"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.divisionsList}>
          <h3>Existing Divisions</h3>
          {divisions.length === 0 ? (
            <p className={styles.noDivisions}>No divisions found.</p>
          ) : (
            <div className={styles.divisionsGrid}>
              {divisions.map((division) => (
                <div key={division.id} className={styles.divisionCard}>
                  <div className={styles.divisionInfo}>
                    <h4>{division.name}</h4>
                    <p>{division.state}</p>
                    <div className={styles.stats}>
                      <p><strong>Employees:</strong> {getUserCount(division)}</p>
                      <p><strong>Customers:</strong> {getCustomerCount(division)}</p>
                      <p><strong>Products:</strong> {getProductCount(division)}</p>
                      <p><strong>Warehouses:</strong> {getWarehouseCount(division)}</p>
                      <p><strong>Sales Orders:</strong> {getSalesOrderCount(division)}</p>
                      <p><strong>Purchase Orders:</strong> {getPurchaseOrderCount(division)}</p>
                    </div>
                  </div>
                  <div className={styles.divisionActions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteDivision(division.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal
          isOpen={isModalOpen}
          message={error}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default DivisionManager; 