import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Input from "./Input";
import WelcomePage from "./WelComePage";
import styles from "./Login.module.css";
import { isAdmin, isStaffManager, hasBothAdminAndStaff } from "../utils/roleUtils";

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

    const currentUser = user.user;
    const wantsDivision = currentUser?.showDivisions || isAdmin(currentUser);
    const onlyStaff = isStaffManager(currentUser) && !isAdmin(currentUser);
    const bothRoles = hasBothAdminAndStaff(currentUser);

    if (login && bothRoles) {
      // Show chooser popup
      setShowRoleChoice(true);
      return;
    }

    if (login && onlyStaff) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        localStorage.setItem("activeView", "staff");
        navigate("/store");
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

    if (login && wantsDivision) {
      console.log(
        "Login.jsx - User needs division selection, redirecting to /divs"
      );
      console.log(
        "Login.jsx - Reason: showDivisions=",
        currentUser?.showDivisions,
        "roles=",
        currentUser?.roles
      );
      // Wait for token to be available before redirecting
      const token = localStorage.getItem("accessToken");
      if (token) {
        console.log("Login.jsx - Token found, navigating to /divs");
        navigate("/divs");
      } else {
        console.log("Login.jsx - Token not found, waiting...");
        // Wait a bit for token to be stored
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
    } else if (login && !currentUser?.showDivisions) {
      console.log(
        "Login.jsx - User does not need division selection, redirecting to /dashboard"
      );
      // User doesn't need division selection, go to dashboard
      // Add a small delay to ensure state is properly set
      const timer = setTimeout(() => {
        navigate("/");
      }, 200);
      return () => clearTimeout(timer);
    } else {
      console.log("Login.jsx - No action taken:", {
        login,
        hasUser: !!currentUser,
        showDivisions: currentUser?.showDivisions,
      });
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

        {login && !user.user?.showDivisions && <WelcomePage data={user} />}

        {showRoleChoice && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
            <div style={{ background: "#fff", borderRadius: 8, padding: 24, width: "90%", maxWidth: 420, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <h4 style={{ marginBottom: 12 }}>Choose a view</h4>
              <p style={{ marginBottom: 20 }}>You have Admin and Staff Manager roles. Continue as:</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    localStorage.setItem("activeView", "staff");
                    setShowRoleChoice(false);
                    navigate("/store");
                  }}
                  style={{ flex: 1 }}
                >
                  Staff Manager View
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
                  Admin View
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
