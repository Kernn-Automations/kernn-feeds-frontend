import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Input from "./Input";
import WelcomePage from "./WelComePage";
import styles from "./Login.module.css";

function Login() {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Login.jsx - useEffect triggered:", {
      login,
      user,
      showDivisions: user.user?.showDivisions,
    });

    if (
      login &&
      (user.user?.showDivisions ||
        user.user?.roles?.includes("admin") ||
        user.user?.roles?.includes("super_admin"))
    ) {
      console.log(
        "Login.jsx - User needs division selection, redirecting to /divs"
      );
      console.log(
        "Login.jsx - Reason: showDivisions=",
        user.user?.showDivisions,
        "roles=",
        user.user?.roles
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
    } else if (login && !user.user?.showDivisions) {
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
        hasUser: !!user.user,
        showDivisions: user.user?.showDivisions,
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
      </div>
    </>
  );
}

export default Login;
