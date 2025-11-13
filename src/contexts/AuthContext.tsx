import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";

interface User {
  username: string;
  role: "admin" | "employee";
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage with session expiry
    const storedUser = localStorage.getItem("solar_user");
    const sessionExpiry = localStorage.getItem("solar_session_expiry");
    const token = authService.getToken();
    
    if (storedUser && sessionExpiry && token) {
      const expiryTime = parseInt(sessionExpiry);
      const currentTime = new Date().getTime();
      
      // Check if session has expired (30 minutes)
      if (currentTime < expiryTime) {
        setUser(JSON.parse(storedUser));
      } else {
        // Session expired, clear storage
        localStorage.removeItem("solar_user");
        localStorage.removeItem("solar_session_expiry");
        authService.logout();
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try API login first
      await authService.login({ email: username, password });
      const roles = await authService.myRoles();
      const role: "admin" | "employee" = roles.includes("admin") ? "admin" : "employee";
      
      const loggedInUser: User = { username, role };
      setUser(loggedInUser);
      
      const expiryTime = new Date().getTime() + 30 * 60 * 1000;
      localStorage.setItem("solar_user", JSON.stringify(loggedInUser));
      localStorage.setItem("solar_session_expiry", expiryTime.toString());
      
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/my-projects");
      }
      return true;
    } catch (error: any) {
      console.log("API login failed, trying local authentication:", error.message);
      
      // Fallback to local demo authentication
      const demoUsers = [
        { email: "admin@example.com", password: "Admin@123", role: "admin" as const },
        { email: "employee@example.com", password: "Employee@123", role: "employee" as const }
      ];
      
      const matchedUser = demoUsers.find(
        u => u.email === username && u.password === password
      );
      
      if (matchedUser) {
        const loggedInUser: User = { 
          username: matchedUser.email, 
          role: matchedUser.role 
        };
        setUser(loggedInUser);
        
        // Store session with mock token
        const expiryTime = new Date().getTime() + 30 * 60 * 1000;
        localStorage.setItem("solar_user", JSON.stringify(loggedInUser));
        localStorage.setItem("solar_session_expiry", expiryTime.toString());
        localStorage.setItem("token", "demo-token-" + Date.now());
        localStorage.setItem("userId", matchedUser.role === "admin" ? "admin-1" : "employee-1");
        localStorage.setItem("isAdmin", String(matchedUser.role === "admin"));
        
        if (matchedUser.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/my-projects");
        }
        return true;
      }
      
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("solar_user");
    localStorage.removeItem("solar_session_expiry");
    authService.logout();
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};