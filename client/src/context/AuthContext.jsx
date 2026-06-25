import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem("username");
    const displayName = localStorage.getItem("displayName");
    return username ? { username, displayName } : null;
  });

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    const { user: u } = res.data;
    localStorage.setItem("accessPassword", password);
    localStorage.setItem("username", u.username);
    localStorage.setItem("displayName", u.displayName);
    setUser({ username: u.username, displayName: u.displayName });
    return u;
  };

  const logout = () => {
    localStorage.removeItem("accessPassword");
    localStorage.removeItem("username");
    localStorage.removeItem("displayName");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
