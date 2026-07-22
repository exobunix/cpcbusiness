export const getToken = () => localStorage.getItem("cpc_token");
export const setToken = (token: string) => localStorage.setItem("cpc_token", token);
export const clearToken = () => {
  localStorage.removeItem("cpc_token");
  localStorage.removeItem("cpc_user");
};
export const isAuthenticated = () => !!getToken();

export const getAuthToken = getToken;

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const setUser = (user: StoredUser) =>
  localStorage.setItem("cpc_user", JSON.stringify(user));

export const getUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem("cpc_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getUserRole = (): string => getUser()?.role ?? "client";

export const isAdmin = () => getUserRole() === "admin";

export const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});
