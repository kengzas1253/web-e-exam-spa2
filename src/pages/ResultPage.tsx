import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import type { SessionDetails } from "../types/exam";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function ResultPage() {
  const { t } = useTranslation();
  const { examId = "" } = useParams();
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const sessionId = sessionStorage.getItem(`exam:${examId}:session`);

  useEffect(() => {
    if (sessionId) api.getSession(sessionId).then((result) => setDetails(result.session));
  }, [sessionId]);

  if (!details) return <p className="text-sm text-muted-foreground">{t("result.loading")}</p>;

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>{t("result.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold">{details.exam.exam_name}</p>
        <p>{t("result.status")}: {details.session.status}</p>
        {details.exam.show_score ? (
          <p className="text-3xl font-bold">{details.session.score} / {details.session.total_score}</p>
        ) : (
          <p className="text-muted-foreground">{t("result.hidden")}</p>
        )}
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          to="/exams"
        >
          {t("result.back")}
        </Link>
      </CardContent>
    </Card>
  );
}
