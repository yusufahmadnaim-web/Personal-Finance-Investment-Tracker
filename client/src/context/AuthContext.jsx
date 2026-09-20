import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the "box" that will hold our shared data
const AuthContext = createContext();

// 2. Create a Provider component — this wraps around your whole app
//    and makes the auth data available to everything inside it
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // Whenever the token changes, keep it in sync with localStorage
  // so a page refresh doesn't log the user out
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  function login(newToken, userData) {
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = { token, user, login, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. A custom hook — this is just a shortcut so components can write
//    `useAuth()` instead of `useContext(AuthContext)` every time
export function useAuth() {
  return useContext(AuthContext);
}