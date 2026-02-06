import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequireAuth() {
  const { isLoggedIn, isChecking } = useAuth();
  const location = useLocation();

  if (isChecking) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
