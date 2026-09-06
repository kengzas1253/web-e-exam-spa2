import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { useAntiCheat } from "../hooks/useAntiCheat";
import type { SessionDetails } from "../types/exam";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { MathText } from "../components/MathText";

type SaveState = "idle" | "saving" | "saved" | "failed";

export function StartExamPage() {
  const { t } = useTranslation();
  const { examId = "" } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [warning, setWarning] = useState("");
  const [locked, setLocked] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const saveTimers = useRef<Record<string, number>>({});
  const autoSubmittedRef = useRef(false);

  const sessionId = details?.session.session_id;

  const load = useCallback(async () => {
    const existingSessionId = sessionStorage.getItem(`exam:${examId}:session`);
    const result = existingSessionId ? await api.getSession(existingSessionId) : await api.startExam(examId);
    sessionStorage.setItem(`exam:${examId}:session`, result.session.session.session_id);
    setLocked(result.session.session.status === "LOCKED");
    setDetails(result.session);
    setAnswers(result.session.answers);
  }, [examId]);

  useEffect(() => {
    load().catch((err) => setWarning(err instanceof Error ? err.message : "Unable to load exam session."));
  }, [load]);

  useEffect(() => {
    if (!details) return;
    const tick = () => {
      const ms = new Date(details.session.end_time).getTime() - Date.now();
      setRemainingMs(Math.max(0, ms));
      if (ms <= 0 && details.session.status === "IN_PROGRESS" && !locked && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        api.submit(details.session.session_id).finally(() => navigate(`/exams/${examId}/result`, { replace: true }));
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [details, examId, locked, navigate]);

  useAntiCheat({
    sessionId,
    enabled: details?.session.status === "IN_PROGRESS" && !locked,
    onLocked: () => {
      setLocked(true);
      setWarning("");
    },
    onWarning: setWarning,
  });

  useEffect(() => {
    if (!locked || !sessionId) return;

    const interval = window.setInterval(async () => {
      try {
        const result = await api.getSession(sessionId);
        setDetails(result.session);
        setAnswers(result.session.answers);
        if (result.session.session.status !== "LOCKED") setLocked(false);
      } catch {
        // Keep the lock popup visible until the session can be checked again.
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [locked, sessionId]);

  const timerText = useMemo(() => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingMs]);

  function selectAnswer(questionId: string, choiceId: string) {
    if (!sessionId) return;
    setAnswers((current) => ({ ...current, [questionId]: choiceId }));
    window.clearTimeout(saveTimers.current[questionId]);
    setSaveState("saving");
    saveTimers.current[questionId] = window.setTimeout(async () => {
      try {
        await api.saveAnswer(sessionId, questionId, choiceId);
        setSaveState("saved");
      } catch {
        setSaveState("failed");
      }
    }, 400);
  }

  async function submit() {
    if (!sessionId) return;
    const result = await api.submit(sessionId);
    setDetails(result.session);
    navigate(`/exams/${examId}/result`, { replace: true });
  }

  if (!details) {
    return <div className="text-sm text-muted-foreground">{t("exam.loading")}</div>;
  }

  return (
    <div className="space-y-5">
      {locked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="max-w-md border-destructive">
            <CardContent className="space-y-4 p-8 text-center">
              <h2 className="text-2xl font-semibold text-destructive">ข้อสอบถูกล็อก</h2>
              <p className="text-muted-foreground">คุณออกจากหน้าสอบ ย่อหน้าต่าง หรือสลับแท็บ ระบบล็อกข้อสอบแล้ว ต้องให้ครูปลดล็อกเท่านั้น</p>
              <p className="text-sm text-muted-foreground">ระบบจะตรวจสอบการปลดล็อกอัตโนมัติ</p>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{details.exam.exam_name}</h1>
            <p className="text-sm text-muted-foreground">{t("exam.saveStatus")}: {t(`exam.${saveState === "idle" ? "ready" : saveState}`)}</p>
          </div>
          <div className="rounded-md border bg-white px-4 py-2 text-xl font-semibold tabular-nums">{timerText}</div>
        </div>
      </div>
      {warning && <Alert className="border-secondary">{warning}</Alert>}
      <div className="space-y-4">
        {details.questions.map((question, index) => (
          <Card key={question.question_id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div className="space-y-3">
                  <p className="font-medium"><MathText text={question.question_text} /></p>
                  {question.image_url && <img src={question.image_url} alt="" className="max-h-80 rounded-md border object-contain" />}
                </div>
              </div>
              <div className="grid gap-2">
                {question.choices.map((choice) => (
                  <label
                    key={choice.choice_id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border bg-white p-3 transition hover:border-primary"
                  >
                    <input
                      type="radio"
                      className="mt-1"
                      name={question.question_id}
                      checked={answers[question.question_id] === choice.choice_id}
                      onChange={() => selectAnswer(question.question_id, choice.choice_id)}
                    />
                    <span><MathText text={choice.choice_text} /></span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={submit}>{t("exam.submit")}</Button>
      </div>
    </div>
  );
}
