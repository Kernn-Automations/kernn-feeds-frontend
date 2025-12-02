import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Input from "./Input";
import styles from "./Login.module.css";

import {
  isAdmin,
  isStaffManager,
  hasBothAdminAndStaff,
  isStaffEmployee,
  isSuperAdmin,
} from "../utils/roleUtils";


function Login() {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState({});
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Login.jsx - useEffect triggered:", {
      login,
      user,
      showDivisions: user.user?.showDivisions,
    });

    const currentUser = user.user || user; // Handle both user.user and direct user
    if (!currentUser || !currentUser.id) return; // Don't proceed if no user data
    
    const wantsDivision = currentUser?.showDivisions || isAdmin(currentUser);
    const isStoreManagerUser = isStoreManager(currentUser);
    const onlyStaff = isStoreManagerUser && !isAdmin(currentUser);
    const bothRoles = hasBothAdminAndStaff(currentUser);
    const isAdminUser = isAdmin(currentUser);
    const isSuperAdminUser = isSuperAdmin(currentUser);
    const isStoreEmployeeUser = isStoreEmployee(currentUser);

    console.log("Login.jsx - Role detection:", {
      isStoreManagerUser,
      isAdminUser,
      isSuperAdminUser,
      isStoreEmployeeUser,
      onlyStaff,
      bothRoles,
      roles: currentUser?.roles
    });

    // Store managers ALWAYS get store management access - navigate to /store
    // This should be checked FIRST, before any other role checks
    if (login && isStoreManagerUser) {
      console.log("Login.jsx - Store manager detected, redirecting to /store");
      const token = localStorage.getItem("accessToken");
      if (token) {
        localStorage.setItem("activeView", "staff");
        navigate("/store");
        return; // Important: return early to prevent other logic from running
      } else {
        const timer = setTimeout(() => {
          const tokenCheck = localStorage.getItem("accessToken");
          if (tokenCheck) {
            localStorage.setItem("activeView", "staff");
            navigate("/store");
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }

    // Store employees get limited store access - navigate to /store
    if (login && isStoreEmployeeUser) {
      console.log("Login.jsx - Store employee detected, redirecting to /store");
      const token = localStorage.getItem("accessToken");
      if (token) {
        localStorage.setItem("activeView", "employee");
        navigate("/store");
        return; // Important: return early
      } else {
        const timer = setTimeout(() => {
          const tokenCheck = localStorage.getItem("accessToken");
          if (tokenCheck) {
            localStorage.setItem("activeView", "employee");
            navigate("/store");
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }

    // Show popup for admins and superadmins (so they can choose store management or admin view)
    // Only show this if they are NOT store managers
    if (login && (isAdminUser || isSuperAdminUser) && !isStoreManagerUser) {
      console.log("Login.jsx - Admin/SuperAdmin detected (not store manager), showing role choice");
      // Show chooser popup
      setShowRoleChoice(true);
      return;
    }

    // Handle regular users who don't match special role conditions
    // IMPORTANT: Exclude store managers and employees from this check
    if (login && currentUser && !isAdminUser && !isSuperAdminUser && !isStoreManagerUser && !isStoreEmployeeUser) {
      const token = localStorage.getItem("accessToken");
      
      if (wantsDivision) {
        console.log(
          "Login.jsx - User needs division selection, redirecting to /divs"
        );
        console.log(
          "Login.jsx - Reason: showDivisions=",
          currentUser?.showDivisions,
          "roles=",
          currentUser?.roles
        );
        if (token) {
          console.log("Login.jsx - Token found, navigating to /divs");
          navigate("/divs");
        } else {
          console.log("Login.jsx - Token not found, waiting...");
          const timer = setTimeout(() => {
            const tokenCheck = localStorage.getItem("accessToken");
            if (tokenCheck) {
              console.log(
                "Login.jsx - Token found after delay, navigating to /divs"
              );
              navigate("/divs");
            }
          }, 100);
          return () => clearTimeout(timer);
        }
      } else {
        console.log(
          "Login.jsx - User does not need division selection, redirecting to /dashboard"
        );
        // User doesn't need division selection, go to dashboard
        if (token) {
          navigate("/");
        } else {
          const timer = setTimeout(() => {
            const tokenCheck = localStorage.getItem("accessToken");
            if (tokenCheck) {
              navigate("/");
            }
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [login, user, navigate]);

  return (
    <>
      <div className={`container-fluid ${styles.cont}`}>
        {!login && (
          <>
            <div className={styles.logincontainer}>
              <Header />
              <main className={styles.formWrapper}>
                <Input setLogin={setLogin} setUser={setUser} />
              </main>
              <Footer />
            </div>
          </>
        )}

        {/* {login && !user.user?.showDivisions && <WelcomePage data={user} />} */}

        {showRoleChoice && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="role-choice-overlay"
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                width: "90%",
                maxWidth: 420,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              <h4 style={{ marginBottom: 12 }}>Choose a view</h4>
              <p style={{ marginBottom: 20 }}>
                You have admin privileges. Select how you want to continue:
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "space-between",
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    localStorage.setItem("activeView", "staff");
                    setShowRoleChoice(false);
                    navigate("/store");
                  }}
                  style={{ flex: 1 }}
                >
                  Store Management
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    localStorage.setItem("activeView", "admin");
                    setShowRoleChoice(false);
                    navigate("/divs");
                  }}
                  style={{ flex: 1 }}
                >
                  Admin Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Login;
