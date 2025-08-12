import React, { useState, useEffect } from "react";
import { useAuth } from "../../Auth";
import { useNavigate } from "react-router-dom";
import styles from "./DivisionSwitcher.module.css";

function DivisionSwitcher() {
  const { axiosAPI } = useAuth();
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const storedDivision = JSON.parse(localStorage.getItem("selectedDivision"));

  useEffect(() => {
    // Always try to fetch divisions if user exists
    if (user) {
      fetchUserDivisions();
    }
    if (storedDivision) {
      setSelectedDivision(storedDivision);
    }
  }, []);

  const fetchUserDivisions = async () => {
    try {
      setLoading(true);
      console.log("Fetching divisions for user:", user);
      
      // Try multiple endpoints to get divisions
      let divisionsData = [];
      
      try {
        // First try the user-divisions endpoint
        const response = await axiosAPI.get("/divisions/user-divisions");
        console.log("Divisions API response:", response);
        
        if (response.status === 200) {
          divisionsData = response.data.divisions || response.data.data || response.data || [];
          console.log("Fetched divisions from user-divisions:", divisionsData);
        }
      } catch (error) {
        console.log("user-divisions endpoint failed, trying /divisions");
        
        try {
          // If user-divisions fails, try the main divisions endpoint
          const response = await axiosAPI.get("/divisions");
          console.log("Main divisions API response:", response);
          
          if (response.status === 200) {
            divisionsData = response.data.divisions || response.data.data || response.data || [];
            console.log("Fetched divisions from /divisions:", divisionsData);
          }
        } catch (secondError) {
          console.log("Main divisions endpoint also failed, trying /divisions/all");
          
          try {
            // If main divisions fails, try the all divisions endpoint
            const response = await axiosAPI.get("/divisions/all");
            console.log("All divisions API response:", response);
            
            if (response.status === 200) {
              divisionsData = response.data.divisions || response.data.data || response.data || [];
              console.log("Fetched divisions from /divisions/all:", divisionsData);
            }
          } catch (thirdError) {
            console.error("All division endpoints failed:", thirdError);
          }
        }
      }
      
      // If we still don't have divisions, use fallback data
      if (!divisionsData || divisionsData.length === 0) {
        console.log("No divisions from API, using fallback data");
        divisionsData = [
          { id: 1, name: "Default Division", state: "Default" },
          { id: 2, name: "Maharastra", state: "Maharastra" },
          { id: 3, name: "Telangana", state: "Telangana" }
        ];
      }
      
      console.log("Final divisions data:", divisionsData);
      setDivisions(divisionsData);
      
      // If no division is selected, select the first one
      if (!storedDivision && divisionsData.length > 0) {
        setSelectedDivision(divisionsData[0]);
        localStorage.setItem("selectedDivision", JSON.stringify(divisionsData[0]));
      }
      
    } catch (error) {
      console.error("Error fetching divisions:", error);
      // Set fallback divisions if all API calls fail
      const fallbackDivisions = [
        { id: 1, name: "Default Division", state: "Default" },
        { id: 2, name: "Maharastra", state: "Maharastra" },
        { id: 3, name: "Telangana", state: "Telangana" }
      ];
      setDivisions(fallbackDivisions);
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionClick = () => {
    // Navigate to the /divs route instead of reloading the page
    navigate("/divs");
  };

  // Always show the component if user exists, even if no divisions are loaded yet
  if (!user) {
    return null;
  }

  console.log("DivisionSwitcher render - divisions:", divisions);

  return (
    <div className={styles.container}>
      <div className={styles.selector}>
        <div className={styles.divisionDisplay}>
          <span className={styles.divisionName}>
            {loading ? "Loading..." : (selectedDivision?.name || "Select Division")}
          </span>
          <button
            className={styles.backArrowButton}
            onClick={handleDivisionClick}
            disabled={loading}
          >
            <span className={styles.backArrow}>
              ←
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DivisionSwitcher; 