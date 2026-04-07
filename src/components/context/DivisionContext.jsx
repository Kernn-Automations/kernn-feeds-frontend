import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { normalizeRoleName } from "@/utils/roleUtils";
import { useAuth } from "../../Auth";

const DivisionContext = createContext();

// Division ID constants
export const DIVISION_IDS = {
  ALL_DIVISIONS: 1,
  MAHARASHTRA: 2,
  TELANGANA: 11,
  PUNE: 12
};

export const useDivision = () => {
  const ctx = useContext(DivisionContext);
  if (!ctx) throw new Error("useDivision must be inside DivisionProvider");
  return ctx;
};

export function DivisionProvider({ children }) {
  const { axiosAPI, islogin } = useAuth();
  const [divisions, setDivisions] = useState([]);
  const hasLoadedRef = useRef(false); // Track if divisions have been loaded
  const selectedDivisionRef = useRef(null);
  
  // Initialize selectedDivision from localStorage if available
  const [selectedDivision, setSelectedDivision] = useState(() => {
    try {
      const stored = localStorage.getItem("selectedDivision");
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed;
    } catch (error) {
      console.error("Error parsing selectedDivision from localStorage:", error);
      return null;
    }
  });
  
  // Initialize showAllDivisions from localStorage if available
  const [showAllDivisions, setShowAllDivisions] = useState(() => {
    try {
      const stored = localStorage.getItem("selectedDivision");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only set to true if explicitly "All Divisions" is selected
        const result = parsed?.isAllDivisions === true || parsed?.id === "all" || false;
        return result;
      }
      return false;
    } catch (error) {
      console.error("Error parsing showAllDivisions from localStorage:", error);
      return false;
    }
  });
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Prevent multiple simultaneous calls

  const load = useCallback(async () => {
    if (!islogin || isLoading || hasLoadedRef.current) return; // Prevent loading if already loaded
    setIsLoading(true);
    setLoading(true);
    try {
      const resp = await axiosAPI.get("/divisions/user-divisions");
      const list = resp.data.divisions || resp.data.data || [];
      
      // Add "All Divisions" option if user is Admin or Super Admin (but NOT Business Officer, Warehouse Manager, etc.)
      let divisionsWithAll = [...list];
      
      // Check if user is Admin or Super Admin and has multiple divisions
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData && userData.roles && Array.isArray(userData.roles)) {
          const isAdminOrSuperAdmin = userData.roles.some(role => {
            const roleName = normalizeRoleName(role);
            return roleName === "admin" || roleName === "super admin" || roleName === "super_admin" || roleName === "superadmin";
          });
          
          // Check for restricted roles that should NOT have All Divisions access
          const hasRestrictedRole = userData.roles.some(role => {
            const roleName = normalizeRoleName(role);
            return roleName.includes("business officer") || 
                   roleName.includes("business office") ||
                   roleName.includes("warehouse manager") ||
                   roleName.includes("area business manager");
          });
          
          // Always include All Divisions for admins (without restricted roles), even if only one division is present
          if (isAdminOrSuperAdmin && !hasRestrictedRole) {
            divisionsWithAll = [
              { 
                id: "all", 
                name: "All Divisions", 
                state: "All", 
                isAllDivisions: true,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              ...list
            ];
          } else {
            // Ensure non-admin users and restricted roles never see an All Divisions option
            divisionsWithAll = divisionsWithAll.filter(d => d?.id !== "all" && !d?.isAllDivisions);
          }
        }
      } catch (error) {
        console.error("Error checking user roles:", error);
      }
      
      setDivisions(divisionsWithAll);
      setShowAllDivisions(resp.data.showDivisions ?? false);
      
      // Only set a default division if there's no selectedDivision AND no stored division in localStorage
      if (divisionsWithAll.length && selectedDivision == null) {
        const storedDivision = localStorage.getItem("selectedDivision");
        if (!storedDivision) {
          // If no stored division, set to the first REAL division (not "All Divisions")
          const firstRealDivision = divisionsWithAll.find(div => div.id !== "all");
          if (firstRealDivision) {
            setSelectedDivision(firstRealDivision);
          }
        }
      }
      
      hasLoadedRef.current = true; // Mark as loaded
    } catch (err) {
      console.error("DivisionContext load:", err);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [islogin, isLoading, axiosAPI]);

  // Reset function for when user logs out
  const reset = useCallback(() => {
    setDivisions([]);
    setSelectedDivision(null);
    setShowAllDivisions(false);
    hasLoadedRef.current = false;
  }, []);

  // Reset when user logs out
  useEffect(() => {
    if (!islogin) {
      reset();
    }
  }, [islogin, reset]);

              // Update localStorage when selectedDivision changes
      useEffect(() => {
        if (selectedDivision) {
      selectedDivisionRef.current = selectedDivision;
      
      localStorage.setItem("selectedDivision", JSON.stringify(selectedDivision));
      
                // Update showAllDivisions based on the selected division
          // Only set showAllDivisions to true if "All Divisions" is actually selected
      // AND user is NOT a restricted role (Business Officer, Warehouse Manager, etc.)
      let isAllDivs = selectedDivision?.isAllDivisions === true || selectedDivision?.id === "all";
      
      // Check if user has restricted roles that should NEVER use showAllDivisions
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData && userData.roles && Array.isArray(userData.roles)) {
          const hasRestrictedRole = userData.roles.some(role => {
            const roleName = normalizeRoleName(role);
            return roleName.includes("business officer") || 
                   roleName.includes("business office") ||
                   roleName.includes("warehouse manager") ||
                   roleName.includes("area business manager");
          });
          
          // If user has restricted role, NEVER set showAllDivisions to true
          if (hasRestrictedRole && isAllDivs) {
            isAllDivs = false;
          }
        }
      } catch (error) {
        console.error("Error checking user roles in DivisionContext:", error);
      }
      
          setShowAllDivisions(isAllDivs);
      
      // Trigger a custom event to notify components that division has changed
      window.dispatchEvent(new CustomEvent('divisionChanged', { 
        detail: { divisionId: selectedDivision.id, division: selectedDivision } 
      }));
      
      // Also trigger a refresh event for all components
      window.dispatchEvent(new CustomEvent('refreshData', { 
        detail: { divisionId: selectedDivision.id, division: selectedDivision } 
      }));
    }
  }, [selectedDivision]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    selectedDivisionRef.current = selectedDivision;
  }, [selectedDivision]);
  
  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("selectedDivision");
        if (stored) {
          const parsed = JSON.parse(stored);
          const currentSelectedDivision = selectedDivisionRef.current;
          
          // Only update if it's different from current state
          if (JSON.stringify(parsed) !== JSON.stringify(currentSelectedDivision)) {
            setSelectedDivision(parsed);
          }
        }
      } catch (error) {
        console.error("Error syncing with localStorage:", error);
      }
    };
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to refresh data when division changes
  const refreshData = () => {
    // Dispatch event to notify all components to refresh their data
    window.dispatchEvent(new CustomEvent('refreshData', { 
      detail: { divisionId: selectedDivision?.id } 
    }));
  };

  return (
    <DivisionContext.Provider value={{
      divisions,
      selectedDivision,
      setSelectedDivision,
      showAllDivisions,
      setShowAllDivisions,
      reload: load,
      reset,
      loading,
      refreshData,
      DIVISION_IDS
    }}>
      {children}
    </DivisionContext.Provider>
  );
}
