import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth";
// import Dashboard from './components/Dashboard/Dashboard';
// import Login from './components/Login';
// import ProtectedRoute from './ProtectedRoute';
import "./App.css";
import { logEvent } from "./utils/logger";

import { lazy, Suspense } from "react";
import PageSkeleton from "./components/SkeletonLoaders/PageSkeleton";
import DashboardSkeleton from "./components/SkeletonLoaders/DashboardSkeleton";
import LoginSkeleton from "./components/SkeletonLoaders/LoginSkeleton";

// Lazy-loaded components
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const Login = lazy(() => import("./components/Login"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));

function App() {
  const { islogin, setIslogin } = useAuth();

  const [role, setRole] = useState(null);
  const [dept, setDept] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [orgadmin, setOrgadmin] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("access_token");

  // Loggers
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Load logs from localStorage on mount
    const storedLogs = JSON.parse(localStorage.getItem("logs")) || [];
    setLogs(storedLogs);

    // Event Listeners
    const handleClick = (e) => {
      if (e.target.tagName === "BUTTON") {
        console.log("if called");
        logEvent("Click", `Clicked on ${e.target.textContent}`);
      } else {
        console.log("else called");
        logEvent("Click", `Clicked on ${e.target.tagName}`);
      }
      setLogs(JSON.parse(localStorage.getItem("logs")));
      console.log(e);
    };

    const handleError = (e) => {
      logEvent("Error", e.message);
      setLogs(JSON.parse(localStorage.getItem("logs")));
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("error", handleError);
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem("logs");
  };

  // ✅ Correct way to set islogin
  useEffect(() => {
    setIslogin(!!token);
  }, [token, setIslogin]);

  // ✅ Handle role, dept, and admin state when islogin and user are available
  useEffect(() => {
    if (islogin && user) {
      if (
        // user.email === 'harikrishna@kernn.ai' ||
        // user.email === 'founder@kernn.ai' ||
        // user.email === 'cto@kernn.ai' ||
        // user.email === 'tanishka@kernn.ai'
        false
      ) {
        setAdmin(true);
        setOrgadmin(true);
      } else {
        setAdmin(false);
        setOrgadmin(false);
        setRole(user?.roles[0].name);

        switch (user?.department) {
          case 1:
            setDept("procurement");
            break;
          case 2:
            setDept("production");
            break;
          case 3:
            setDept("sales");
            break;
          case 4:
            setDept("stores");
            break;
          case 5:
            setDept("finance");
            break;
          default:
            setDept(null);
        }
      }
    }
  }, [islogin, user]);

  console.log(user);

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            islogin ? (
              <Navigate to="/" />
            ) : (
              <Suspense fallback={<LoginSkeleton />}>
                <Login />
              </Suspense>
            )
          }
        />
        <Route element={<ProtectedRoute token={token} />}>
          <Route
            path="/*"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Dashboard
                  admin={admin}
                  role={role}
                  dept={dept}
                  setAdmin={() => {
                    setAdmin(true);
                    setDept(null);
                  }}
                  orgadmin={orgadmin}
                />
              </Suspense>
            }
          />
          <Route path="/admin" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
