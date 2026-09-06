import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AppLayout } from "../layouts/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { ExamsPage } from "../pages/ExamsPage";
import { InstructionsPage } from "../pages/InstructionsPage";
import { StartExamPage } from "../pages/StartExamPage";
import { ResultPage } from "../pages/ResultPage";
import { LockedPage } from "../pages/LockedPage";
import { StudentProfilePage } from "../pages/StudentProfilePage";
import { TeacherDashboardPage } from "../pages/TeacherDashboardPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/exams" replace /> },
          { path: "/profile", element: <StudentProfilePage /> },
          { path: "/teacher", element: <TeacherDashboardPage /> },
          { path: "/teacher/scores", element: <TeacherDashboardPage scoresOnly /> },
          { path: "/exams", element: <ExamsPage /> },
          { path: "/exams/:examId/instructions", element: <InstructionsPage /> },
          { path: "/exams/:examId/start", element: <StartExamPage /> },
          { path: "/exams/:examId/result", element: <ResultPage /> },
          { path: "/locked", element: <LockedPage /> },
        ],
      },
    ],
  },
]);
