import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Divs.module.css";
import tokenManager from "../utils/tokenManager";
import feedsLogo from "../images/feeds-croped.png";

const Divs = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingDivision, setSelectingDivision] = useState(false);
  const [divisionSelected, setDivisionSelected] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      console.log("Divs.jsx - No valid tokens found, redirecting to login");
      navigate("/login");
      return;
    }

    // Get username from localStorage - try multiple possible field names
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const userName =
          user.name ||
          user.employee_name ||
          user.username ||
          user.fullName ||
          "User";
        setUsername(userName);
      } else {
        setUsername("User");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUsername("User");
    }

    fetchDivisions();
  }, [navigate]);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const authHeader = tokenManager.getAuthHeader();
      const VITE_API = import.meta.env.VITE_API_URL;

      console.log("Divs.jsx - Fetching divisions...");
      console.log("Divs.jsx - Auth header exists:", !!authHeader);

      const response = await fetch(`${VITE_API}/divisions/user-divisions`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Divs.jsx - Response:", data);

      if (data.success) {
        setDivisions(data.data);
      } else {
        setError(data.message || "Failed to fetch divisions");
      }
    } catch (err) {
      setError("Error fetching divisions");
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionSelect = async (division) => {
    if (selectingDivision) return; // Prevent multiple calls

    console.log("Handel select called")

    try {
      setSelectingDivision(true);
      setError(""); // Clear previous errors

      const authHeader = tokenManager.getAuthHeader();
      const VITE_API = import.meta.env.VITE_API_URL;

      console.log("Divs.jsx - Selecting division:", division);
      console.log("Divs.jsx - Auth header exists:", !!authHeader);

      const response = await fetch(`${VITE_API}/divisions/select`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ divisionId: division.id }),
      });

      console.log(
        "Divs.jsx - Select division response status:",
        response.status
      );

      if (response.ok) {
        let data = {};
        // Handle 204 No Content responses
        if (response.status !== 204) {
          try {
            data = await response.json();
            console.log("Divs.jsx - Select division success:", data);
          } catch (jsonError) {
            console.log("Divs.jsx - No JSON payload (204 No Content)");
          }
        } else {
          console.log("Divs.jsx - Select division success (204 No Content)");
        }

        // Store selected division with proper fields
        const divisionData = {
          id: division.id,
          name: division.name,
          state: division.state,
          isActive: division.isActive,
          createdAt: division.createdAt,
          updatedAt: division.updatedAt,
        };
        localStorage.setItem("selectedDivision", JSON.stringify(divisionData));
        console.log(
          "Divs.jsx - Division stored in localStorage:",
          divisionData
        );

        // Set success state to prevent any further actions
        setDivisionSelected(true);

        // Navigate to dashboard
        setTimeout(() => {
          console.log("Divs.jsx - Navigating to dashboard...");
          console.log("Divs.jsx - Current tokens before navigation:", {
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
          });
          console.log("navigate to /");
          navigate("/", { replace: true });
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error("Divs.jsx - Select division failed:", errorData);
        setError(
          `Failed to select division: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error selecting division:", error);
      setError("Network error while selecting division");
    } finally {
      setSelectingDivision(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loading}>Loading divisions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (divisionSelected) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>Division selected successfully! </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <img src={feedsLogo} alt="Feeds Logo" className={styles.logo} />
        </div>

        <h1 className={styles.companyName}>FEED BAZAAR PVT LTD</h1>

        <div className={styles.welcomeMessage}>
          Welcome! <span className={styles.username}>{username}</span>
        </div>

        <p className={styles.instruction}>Choose your Division to continue</p>

        <div className={styles.divisionsList}>
          {divisions.map((division, index) => (
            <div
              key={division.id}
              className={`${styles.divisionCard} ${selectingDivision ? styles.disabled : ""}`}
              onClick={() => handleDivisionSelect(division)}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: "slideInUp 0.6s ease-out both",
              }}
            >
              <div className={styles.divisionInfo}>
                <span className={styles.divisionName}>{division.name}</span>
                {/* <span className={styles.accessText}>access : allowed</span> */}
              </div>
              {/* {selectingDivision && <div className={styles.selecting}>Selecting...</div>} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Divs;
