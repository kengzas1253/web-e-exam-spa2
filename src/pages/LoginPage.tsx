import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  GraduationCap,
  Lock,
  LogIn,
  Mail,
  UserRoundCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "../components/ui/alert";
import { api } from "../services/api";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { auth } from "../firebase/firebase";
import { isCompleteStudentProfile, loadStudentProfile, saveStudentProfile } from "../utils/studentProfileStorage";

export function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.health().then(() => setApiError("")).catch(() => setApiError(t("login.apiDisconnected")));
  }, [t]);

  if (user) return <Navigate to="/exams" replace />;

  async function afterLogin() {
    const me = await api.me();
    if (me.role === "teacher") {
      navigate("/teacher", { replace: true });
      return;
    }
    const currentUser = auth.currentUser;
    const cachedProfile = loadStudentProfile(currentUser?.uid, currentUser?.email);
    if (isCompleteStudentProfile(me.student)) {
      saveStudentProfile(me.student, currentUser?.uid, currentUser?.email);
    } else if (isCompleteStudentProfile(cachedProfile)) {
      await api.updateProfile(cachedProfile);
    } else {
      navigate("/profile", { replace: true });
      return;
    }
    const from =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname ?? "/exams";
    navigate(from, { replace: true });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      await afterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleLogin() {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      await afterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <main className="login-card">
        <header className="login-header">
          <div className="login-icon-wrap">
            <div className="login-icon">
              <UserRoundCheck size={40} strokeWidth={2.4} />
            </div>
          </div>
          <h1 className="login-title">{t("login.title")}</h1>
          <p className="login-subtitle">
            <GraduationCap size={16} />
            {t("login.subtitle")}
          </p>
          <div className="mt-4 flex justify-center">
            <LanguageSwitcher />
          </div>
        </header>

        <div className="login-divider" />

        <form onSubmit={onSubmit} className="login-form">
          {error && (
            <Alert className="border-destructive text-destructive">
              {error}
            </Alert>
          )}
          {apiError && (
            <Alert className="border-destructive text-destructive">
              {apiError}
            </Alert>
          )}

          <div className="login-field">
            <label htmlFor="email" className="login-label">
              <Mail size={16} />
              {t("login.email")}
            </label>
            <input
              id="email"
              className="login-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              <Lock size={16} />
              {t("login.password")}
            </label>
            <input
              id="password"
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-primary-button"
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? t("login.signingIn") : t("login.signIn")}
          </button>
        </form>

        <div className="login-or">{t("login.or")}</div>

        <button
          type="button"
          className="login-google-button"
          onClick={onGoogleLogin}
          disabled={loading}
        >
          <span className="login-google-g">G</span>
          {t("login.google")}
        </button>

        <footer className="login-footer">
          <div className="login-footer-main">
            <span>© 2026 {t("login.footerRights")}</span>
            <span className="login-school">{t("login.school")}</span>
          </div>
          <div className="login-updated">
            <CalendarDays size={14} />
            <span>{t("login.lastUpdated")}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
