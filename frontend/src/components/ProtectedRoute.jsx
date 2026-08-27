import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import MainLayout from "../layouts/MainLayout";
import Loader from "./common/Loader";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}