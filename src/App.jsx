import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login';
import ProtectedRoute from './ProtectedRoute';
import "./App.css"

function App() {
  const { islogin, setIslogin } = useAuth();
  

  const [role, setRole] = useState(null);
  const [dept, setDept] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [orgadmin, setOrgadmin] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('access_token');

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
        setRole(user.role.role_name);

        switch (user.department) {
          case 1:
            setDept('procurement');
            break;
          case 2:
            setDept('production');
            break;
          case 3:
            setDept('sales');
            break;
          case 4:
            setDept('stores');
            break;
          case 5:
            setDept('finance');
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
          element={islogin ? <Navigate to="/" /> : <Login />}
        />
        <Route element={<ProtectedRoute token={token} />}>
          <Route
            path="/*"
            element={
              <Dashboard
                admin={admin}
                role={role}
                dept={dept}
                setAdmin={() => {setAdmin(true); setDept(null)}}
                orgadmin={orgadmin}
              />
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/"/>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
