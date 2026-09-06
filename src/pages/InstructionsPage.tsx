import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import { api } from "../services/api";
import type { Exam } from "../types/exam";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert } from "../components/ui/alert";

export function InstructionsPage() {
  const { t } = useTranslation();
  const { examId = "" } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.exam(examId)
      .then((result) => setExam(result.exam))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load exam."));
  }, [examId]);

  async function startExam() {
    setStarting(true);
    setError("");
    try {
      const result = await api.startExam(examId);
      sessionStorage.setItem(`exam:${examId}:session`, result.session.session.session_id);
      navigate(`/exams/${examId}/start`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start exam.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {error && <Alert className="border-destructive text-destructive">{error}</Alert>}
      {exam && (
        <Card>
          <CardHeader>
            <CardTitle>{exam.exam_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-muted-foreground">{exam.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border p-3"><div className="text-sm text-muted-foreground">{t("instructions.duration")}</div><div className="font-semibold">{exam.duration_minutes} {t("exams.minutes")}</div></div>
              <div className="rounded-md border p-3"><div className="text-sm text-muted-foreground">{t("instructions.questions")}</div><div className="font-semibold">{exam.question_count}</div></div>
              <div className="rounded-md border p-3"><div className="text-sm text-muted-foreground">{t("instructions.maxViolations")}</div><div className="font-semibold">{exam.max_violations}</div></div>
            </div>
            <Alert className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" />
              <span>{t("instructions.antiCheat")}</span>
            </Alert>
            <Button onClick={startExam} disabled={starting} className="w-full sm:w-auto">
              {starting ? t("instructions.starting") : t("instructions.start")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
