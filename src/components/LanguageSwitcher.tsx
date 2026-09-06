import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  function changeLanguage(language: "th" | "en") {
    localStorage.setItem("language", language);
    void i18n.changeLanguage(language);
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <span className="sr-only">{t("language")}</span>
      <button
        type="button"
        className={i18n.language === "th" ? "font-semibold text-primary" : "text-muted-foreground"}
        onClick={() => changeLanguage("th")}
      >
        {t("thai")}
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        type="button"
        className={i18n.language === "en" ? "font-semibold text-primary" : "text-muted-foreground"}
        onClick={() => changeLanguage("en")}
      >
        {t("english")}
      </button>
    </div>
  );
}
