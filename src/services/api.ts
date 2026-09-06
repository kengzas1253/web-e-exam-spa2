import { auth } from "../firebase/firebase";
import type { Exam, Me, SessionDetails, Student, TeacherDashboard } from "../types/exam";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("You must be signed in.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }
  return payload as T;
}

async function publicRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? "Request failed.");
  return payload as T;
}

export const api = {
  health: () => publicRequest<{ status: string }>("/health"),
  me: () => request<Me>("/api/me"),
  updateProfile: (profile: Pick<Student, "title" | "first_name" | "last_name" | "grade_level" | "class_group" | "student_no">) =>
    request<{ student: Student }>("/api/me/profile", { method: "PUT", body: JSON.stringify(profile) }),
  exams: () => request<{ exams: Exam[] }>("/api/exams"),
  exam: (examId: string) => request<{ exam: Exam }>(`/api/exams/${examId}`),
  startExam: (examId: string) =>
    request<{ session: SessionDetails }>(`/api/exams/${examId}/start`, { method: "POST" }),
  getSession: (sessionId: string) => request<{ session: SessionDetails }>(`/api/sessions/${sessionId}`),
  saveAnswer: (sessionId: string, questionId: string, choiceId: string) =>
    request<{ status: string }>(`/api/sessions/${sessionId}/answers`, {
      method: "POST",
      body: JSON.stringify({ questionId, choiceId }),
    }),
  submit: (sessionId: string) =>
    request<{ session: SessionDetails }>(`/api/sessions/${sessionId}/submit`, { method: "POST" }),
  violation: (sessionId: string, eventType: "TAB_HIDDEN" | "WINDOW_BLUR" | "EXIT_FULLSCREEN" | "SCREEN_CAPTURE", metadata?: unknown) =>
    request<{ action: "WARNING" | "LOCKED"; violationCount: number }>(`/api/sessions/${sessionId}/violations`, {
      method: "POST",
      body: JSON.stringify({ eventType, metadata }),
    }),
  teacherDashboard: () => request<TeacherDashboard>("/api/teacher/dashboard"),
  createExam: (exam: Pick<Exam, "exam_name" | "subject" | "grade_level"> & Partial<Pick<Exam, "description" | "duration_minutes" | "question_count" | "max_violations">>) =>
    request<{ exam: Exam }>("/api/teacher/exams", { method: "POST", body: JSON.stringify(exam) }),
  updateExam: (examId: string, exam: Partial<Pick<Exam, "exam_name" | "subject" | "grade_level" | "description" | "duration_minutes" | "question_count" | "max_violations">>) =>
    request<{ exam: Exam }>(`/api/teacher/exams/${examId}`, { method: "PUT", body: JSON.stringify(exam) }),
  deleteExam: (examId: string) => request<{ status: string }>(`/api/teacher/exams/${examId}`, { method: "DELETE" }),
  createQuestion: (examId: string, question: { question_text: string; choices: string[]; correct_index: number; score: number }) =>
    request<{ status: string }>(`/api/teacher/exams/${examId}/questions`, { method: "POST", body: JSON.stringify(question) }),
  updateQuestion: (examId: string, questionId: string, question: { question_text: string; choices: string[]; correct_index: number; score: number }) =>
    request<{ status: string }>(`/api/teacher/exams/${examId}/questions/${questionId}`, { method: "PUT", body: JSON.stringify(question) }),
  deleteQuestion: (examId: string, questionId: string) =>
    request<{ status: string }>(`/api/teacher/exams/${examId}/questions/${questionId}`, { method: "DELETE" }),
  unlockSession: (sessionId: string) => request<{ status: string }>(`/api/teacher/sessions/${sessionId}/unlock`, { method: "POST" }),
};
