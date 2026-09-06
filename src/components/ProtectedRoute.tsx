import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">{t("loading")}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
