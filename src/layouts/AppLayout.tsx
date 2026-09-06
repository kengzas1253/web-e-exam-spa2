import { BarChart3, FilePlus2, LogOut, NotebookTabs } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isTeacher = location.pathname.startsWith("/teacher");

  return (
    <div className="app-shell min-h-screen">
      <aside className="app-sidebar">
        <button className="sidebar-brand" onClick={() => navigate(isTeacher ? "/teacher" : "/exams")}>
          {t("appName")}
        </button>
        <div className="sidebar-user">{user?.email}</div>
        <nav className="sidebar-nav">
          {isTeacher ? (
            <>
              <Link className="sidebar-link" to="/teacher">
                <FilePlus2 className="h-4 w-4" />
                สร้างข้อสอบ
              </Link>
              <Link className="sidebar-link" to="/teacher/scores">
                <BarChart3 className="h-4 w-4" />
                คะแนนนักเรียน
              </Link>
            </>
          ) : (
            <Link className="sidebar-link" to="/exams">
              <NotebookTabs className="h-4 w-4" />
              {t("exams.title")}
            </Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <LanguageSwitcher />
          <Button className="h-10 w-full gap-2 bg-foreground" onClick={logout} title={t("signOut")}>
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </Button>
        </div>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
