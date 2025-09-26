import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [islogin, setIslogin] = useState(
    localStorage.getItem("accessToken") ? true : false
  );

  let token = localStorage.getItem("accessToken") || null;
  let reftoken = localStorage.getItem("refreshToken") || null;

  const VITE_API = import.meta.env.VITE_API_URL;
  const BASE_URL = VITE_API || "/api";

  // API Initialization
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const formApi = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const getPdf = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "Application/pdf",
    },
    responseType: "blob",
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  getPdf.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  formApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
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
    formData: (url, formdata) => formApi.post(url, formdata),
    getpdf: (url, params = {}) => getPdf.get(url, { params }),
  };

  // Remove the old useEffect - we now use startRefreshCycle() when tokens are saved

  const removeLogin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedDivision");
    localStorage.removeItem("showDivisions");
    setIslogin(false);
    token = null;
    reftoken = null;

    // setReftoken(null)
    // setToken(null)
  };

  const saveToken = (newToken) => {
    localStorage.setItem("accessToken", newToken);
    token = newToken;
    setIslogin(true);
  };

  const saveRefreshToken = (refToken) => {
    localStorage.setItem("refreshToken", refToken);
    reftoken = refToken;
  };

  // Function to save both tokens and start refresh cycle
  const saveTokens = (accessToken, refreshToken) => {
    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      token = accessToken;
      reftoken = refreshToken;
      setIslogin(true);
      
      // Start the refresh cycle
      console.log("Tokens saved, starting refresh cycle");
      startRefreshCycle();
    }
  };

  // Function to start the refresh cycle
  const startRefreshCycle = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (accessToken && refreshToken) {
      console.log("Starting token refresh cycle");
      
      // Set up periodic refresh
      const interval = setInterval(
        async () => {
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              console.log("No refresh token found, stopping refresh cycle");
              clearInterval(interval);
              return;
            }

            const response = await axios.post(
              `${VITE_API}/auth/refresh`,
              { refreshToken: refreshToken }
            );

            console.log("Token refresh successful");
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            token = response.data.accessToken;
            reftoken = response.data.refreshToken;
          } catch (error) {
            console.error("Token refresh failed:", error);
            clearInterval(interval);
            removeLogin();
          }
        },
        5 * 60 * 1000 // Refresh every 5 minutes
      );
    }
  };
  const removeToken = async () => {
    try {
      const res = await axios.post(`${VITE_API}/api/v1/logout`, config);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      token = null;
      // setToken(null)
      setIslogin(false);
    } catch (e) {
      // console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        saveToken,
        removeToken,
        saveRefreshToken,
        saveTokens,
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
