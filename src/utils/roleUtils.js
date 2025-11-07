// src/utils/roleUtils.js

export const normalizeRoleName = (role) => {
  if (!role) return "";
  if (typeof role === "string") return role.toLowerCase();
  if (typeof role === "object") {
    const name = role.name || role.role || String(role);
    return (name || "").toLowerCase();
  }
  return String(role).toLowerCase();
};

export const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch (e) {
    return {};
  }
};

export const isAdmin = (userLike) => {
  const user = userLike || getUserFromStorage();
  const roles = user?.roles || [];
  return roles.some((r) => {
    const n = normalizeRoleName(r);
    return n === "admin" || n === "super admin" || n === "super_admin" || n === "superadmin" || n.includes("admin");
  });
};

export const isStaffManager = (userLike) => {
  const user = userLike || getUserFromStorage();
  const roles = user?.roles || [];
  return roles.some((r) => {
    const n = normalizeRoleName(r);
    return n === "staff_manager" || n === "staff manager" || n.includes("staff");
  });
};

export const hasBothAdminAndStaff = (userLike) => {
  const user = userLike || getUserFromStorage();
  return isAdmin(user) && isStaffManager(user);
};

export const isStaffEmployee = (userLike) => {
  const user = userLike || getUserFromStorage();
  const roles = user?.roles || [];
  return roles.some((r) => {
    const n = normalizeRoleName(r);
    return n === "employee" || n === "staff_employee" || n === "staff employee" || n.includes("employee");
  });
};

export const isSuperAdmin = (userLike) => {
  const user = userLike || getUserFromStorage();
  const roles = user?.roles || [];
  return roles.some((r) => {
    const n = normalizeRoleName(r);
    return n === "super admin" || n === "super_admin" || n === "superadmin";
  });
};


