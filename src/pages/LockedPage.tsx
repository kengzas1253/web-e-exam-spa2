import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../components/ui/card";

export function LockedPage() {
  const { t } = useTranslation();

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-4 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-destructive text-destructive-foreground">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold">{t("locked.title")}</h1>
        <p className="text-muted-foreground">{t("locked.message")}</p>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          to="/exams"
        >
          {t("locked.back")}
        </Link>
      </CardContent>
    </Card>
  );
}
