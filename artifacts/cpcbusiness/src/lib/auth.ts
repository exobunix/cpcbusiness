export const getToken = () => localStorage.getItem("cpc_token");
export const setToken = (token: string) => localStorage.setItem("cpc_token", token);
export const clearToken = () => {
  localStorage.removeItem("cpc_token");
  localStorage.removeItem("cpc_user");
};
export const isAuthenticated = () => !!getToken();

export const getAuthToken = getToken;

export interface StoredUser {
  id: number | string;
  name: string;
  email: string;
  role: string;
  company?: string;
  status?: string;
  createdAt?: string;
}

export const setUser = (user: StoredUser) => {
  localStorage.setItem("cpc_user", JSON.stringify(user));
  registerUserLocally(user);
};

export const getUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem("cpc_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getRegisteredUsersLocally = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem("cpc_registered_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const registerUserLocally = (user: StoredUser) => {
  try {
    const existing = getRegisteredUsersLocally();
    if (!existing.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      const updated = [
        {
          id: user.id || Date.now(),
          name: user.name,
          email: user.email,
          role: user.role || "client",
          company: user.company || "Registered Client",
          status: "active",
          createdAt: user.createdAt || new Date().toISOString(),
        },
        ...existing,
      ];
      localStorage.setItem("cpc_registered_users", JSON.stringify(updated));
    }
  } catch (e) {}
};

export const getUserRole = (): string => getUser()?.role ?? "client";

export const isAdmin = () => getUserRole() === "admin";

export const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});
