import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../../Auth";

const DivisionContext = createContext();

export const useDivision = () => {
  const ctx = useContext(DivisionContext);
  if (!ctx) throw new Error("useDivision must be inside DivisionProvider");
  return ctx;
};

export function DivisionProvider({ children }) {
  const { axiosAPI, islogin } = useAuth();
  const [divisions, setDivisions]     = useState([]);
  
  // Initialize selectedDivision from localStorage if available
  const [selectedDivision, setSel] = useState(() => {
    try {
      const stored = localStorage.getItem("selectedDivision");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error parsing selectedDivision from localStorage:", error);
      return null;
    }
  });
  
  const [showAllDivisions, setShowAll]= useState(false);
  const [loading, setLoading]         = useState(false);

  const load = async () => {
    if (!islogin) return;
    setLoading(true);
    try {
      const resp = await axiosAPI.get("/divisions/user-divisions");
      const list = resp.data.divisions || resp.data.data || [];
      setDivisions(list);
      setShowAll(resp.data.showDivisions ?? false);
      if (list.length && selectedDivision == null) {
        setSel(list[0]);
      }
    } catch (err) {
      console.error("DivisionContext load:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update localStorage when selectedDivision changes
  useEffect(() => {
    if (selectedDivision) {
      localStorage.setItem("selectedDivision", JSON.stringify(selectedDivision));
    }
  }, [selectedDivision]);

  useEffect(() => {
    load();
  }, [islogin]);

  return (
    <DivisionContext.Provider value={{
      divisions,
      selectedDivision,
      setSelectedDivision: setSel,
      showAllDivisions,
      reload: load,
      loading,
    }}>
      {children}
    </DivisionContext.Provider>
  );
}