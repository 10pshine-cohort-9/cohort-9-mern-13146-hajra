import { createContext, useContext, useState, useEffect, useCallback ,useMemo} from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = (authToken, userData) => {
  localStorage.setItem("token", authToken);
  localStorage.setItem("user", JSON.stringify(userData));
  setToken(authToken);
  setUser(userData);
};

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await authService.getProfile();
      if (response?.success && response?.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

 const login = async (email, password) => {
  const response = await authService.login(email, password);
  if (response?.success && response?.data?.token) {
    const userData = response.data.user || {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      profile_picture: response.data.profile_picture || null
    };
    persistSession(response.data.token, userData);
  }
  return response;
};

const signup = async (name, email, password) => {
  const response = await authService.register(name, email, password);
  if (response?.success && response?.data?.token) {
    const userData = response.data.user || {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email
    };
    persistSession(response.data.token, userData);
  }
  return response;
};
const updateUserProfile = async (formData) => {
  const response = await authService.updateProfile(formData);
  if (response?.success && response?.data) {
    const updatedUser = response.data.user || response.data;
    const mergedUser = {
      ...user,
      ...updatedUser,
      profile_picture: updatedUser.profile_picture !== undefined ? updatedUser.profile_picture : user?.profile_picture
    };
    setUser(mergedUser);
    localStorage.setItem("user", JSON.stringify(mergedUser));
  }
  return response;
};

 const value = useMemo(() => ({
  user,
  token,
  loading,
  login,
  signup,
  logout,
  updateUserProfile,
  isAuthenticated: Boolean(token && user)
}), [user, token, loading, login, signup, logout, updateUserProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}