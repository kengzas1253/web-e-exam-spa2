import { useEffect, useRef } from "react";
import { api } from "../services/api";

type Options = {
  sessionId?: string;
  enabled: boolean;
  onLocked: () => void;
  onWarning: (message: string) => void;
};

export function useAntiCheat({ sessionId, enabled, onLocked, onWarning }: Options) {
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    async function report(eventType: "TAB_HIDDEN" | "WINDOW_BLUR" | "EXIT_FULLSCREEN" | "SCREEN_CAPTURE") {
      if (!sessionId || sendingRef.current) return;
      sendingRef.current = true;
      try {
        const result = await api.violation(sessionId, eventType, {
          userAgent: navigator.userAgent,
          path: window.location.pathname,
        });
        if (result.action === "LOCKED") {
          onLocked();
        } else {
          onWarning(`Warning ${result.violationCount}: exam focus was interrupted.`);
        }
      } finally {
        sendingRef.current = false;
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") void report("TAB_HIDDEN");
    };
    const onBlur = () => void report("WINDOW_BLUR");
    const onFullscreen = () => {
      if (!document.fullscreenElement) void report("EXIT_FULLSCREEN");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.key === "PrintScreen" || (event.ctrlKey && (key === "p" || key === "s" || key === "c"))) {
        event.preventDefault();
        void report("SCREEN_CAPTURE");
      }
    };
    const onBlockedAction = (event: Event) => {
      event.preventDefault();
      void report("SCREEN_CAPTURE");
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("copy", onBlockedAction);
    document.addEventListener("contextmenu", onBlockedAction);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("copy", onBlockedAction);
      document.removeEventListener("contextmenu", onBlockedAction);
    };
  }, [enabled, onLocked, onWarning, sessionId]);
}
