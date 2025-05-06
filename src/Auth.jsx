import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [islogin, setIslogin] = useState(
    localStorage.getItem("access_token") ? true : false
  );
  // const [token, setToken] = useState( localStorage.getItem("access_token") || null);
  // const [reftoken, setReftoken] = useState(localStorage.getItem("refresh_token") || null);

  let token = localStorage.getItem("access_token") || null;
  let reftoken = localStorage.getItem("refresh_token") || null;

  const VITE_API = import.meta.env.VITE_API_URL;

  // API Initialization
  const api = axios.create({
    baseURL: VITE_API, // Change to your actual API URL
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token"); // Assuming token is stored in local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const axiosAPI = {
    get: (url, params = {}) => api.get(url, { params }),
    post: (url, data) => api.post(url, data),
    put: (url, data) => api.put(url, data),
    delete: (url) => api.delete(url),
  };



  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const accesstokenfromst = localStorage.getItem("access_token");
        const reftokenfromst = localStorage.getItem("refresh_token");
        console.log("old token", accesstokenfromst);
        console.log("old ref", reftokenfromst);
        // console.log("My token", config.headers.Authorization);

        let config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        };

        const response = await axios.post(
          `${VITE_API}/auth/refresh`,
          {
            refreshToken: reftokenfromst,
          },
          config
        );
        console.log("refreshed :", response);

        const newAccessToken = response.data.accessToken;
        const newRef = response.data.refreshToken;

        console.log("current token : ", newAccessToken);
        console.log("current token : ", newRef);

        token = response.data.accessToken;
        reftoken = response.data.refreshToken;

        // setToken(response.data.accessToken)
        // setReftoken(response.data.refreshToken)

        localStorage.setItem("access_token", response.data.accessToken);
        localStorage.setItem("refresh_token", response.data.refreshToken);
      } catch (error) {
        console.log("refesh error : ", error);
        // removeLogin();
        setIslogin(false);
        token = null;
        reftoken = null;
        removeLogin();
        // setToken(null)
        // setReftoken(null)
      }

      console.log("new token : ", token);
      console.log("newref token : ", reftoken);
      //  console.log("My token", config.headers.Authorization);
    };

    refreshAccessToken();

    const interval = setInterval(() => {
      refreshAccessToken();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const removeLogin = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setIslogin(false);
    token = null;
    reftoken = null;

    // setReftoken(null)
    // setToken(null)
  };

  const saveToken = (newToken) => {
    localStorage.setItem("access_token", newToken);

    token = newToken;
    // setToken(newToken)
    setIslogin(true);
  };
  const saveRefreshToken = (refToken) => {
    localStorage.setItem("refresh_token", refToken);
    reftoken = refToken;
    // setReftoken(refToken)
  };
  const removeToken = async () => {
    try {
      const res = await axios.post(
        `${VITE_API}/api/v1/logout`,
        config
      );

      console.log(res);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      token = null;
      // setToken(null)
      setIslogin(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        saveToken,
        removeToken,
        saveRefreshToken,
        removeLogin,
        islogin,
        setIslogin,
        axiosAPI,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
