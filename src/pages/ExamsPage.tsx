import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarClock, Pencil } from "lucide-react";
import { api } from "../services/api";
import { auth } from "../firebase/firebase";
import type { Exam, Student } from "../types/exam";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert } from "../components/ui/alert";
import { isCompleteStudentProfile, loadStudentProfile, saveStudentProfile } from "../utils/studentProfileStorage";

export function ExamsPage() {
  const { t } = useTranslation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const me = await api.me();
        if (me.role === "teacher") {
          window.location.href = "/teacher";
          return;
        }
        const currentUser = auth.currentUser;
        const cachedProfile = loadStudentProfile(currentUser?.uid, currentUser?.email);
        let student = me.student;

        if (isCompleteStudentProfile(student)) {
          saveStudentProfile(student, currentUser?.uid, currentUser?.email);
        } else if (isCompleteStudentProfile(cachedProfile)) {
          const result = await api.updateProfile(cachedProfile);
          student = result.student;
        } else {
          window.location.href = "/profile";
          return;
        }

        const examsResult = await api.exams();
        setStudent(student ?? null);
        setExams(examsResult.exams);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load exams.");
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t("exams.title")}</h1>
        {student && (
          <div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground">
            <p>{student.name} · {student.class_name} · เลขที่ {student.student_no}</p>
            <Link
              className="inline-flex h-8 items-center gap-1 rounded-md border px-3 text-sm font-medium text-foreground transition hover:bg-muted"
              to="/profile"
            >
              <Pencil className="h-4 w-4" />
              แก้ไข
            </Link>
          </div>
        )}
      </div>
      {error && <Alert className="border-destructive text-destructive">{error}</Alert>}
      <div className="grid gap-4 md:grid-cols-2">
        {exams.map((exam) => (
          <Card key={exam.exam_id}>
            <CardHeader>
              <CardTitle>{exam.exam_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{exam.description || exam.subject}</p>
              <div className="flex items-center gap-2 text-sm">
                <CalendarClock className="h-4 w-4" />
                {exam.duration_minutes} {t("exams.minutes")} · {exam.question_count} {t("exams.questions")}
              </div>
              <Link
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                to={`/exams/${exam.exam_id}/instructions`}
              >
                {t("exams.openInstructions")}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {!error && exams.length === 0 && <p className="text-sm text-muted-foreground">{t("exams.empty")}</p>}
    </div>
  );
}
