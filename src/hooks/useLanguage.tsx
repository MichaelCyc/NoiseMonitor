import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { readLanguage, translate } from "../lib/i18n";
import type { Language } from "../lib/i18n";

type LanguageContextValue = {
  language: Language;
  locale: string;
  setLanguage: (next: Language) => boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState(readLanguage);
  const setLanguage = useCallback((next: Language) => {
    updateLanguage(next);
    try {
      localStorage.setItem("sonora-language", next);
      return true;
    } catch {
      return false;
    }
  }, []);
  const value = useMemo(
    () => ({
      language,
      locale: language === "en" ? "en-US" : "zh-CN",
      setLanguage,
      t: (key: string, values?: Record<string, string | number>) =>
        translate(language, key, values),
    }),
    [language, setLanguage],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = value.t("声境 Sonora · 实时噪声监测");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        value.t(
          "声境 Sonora：通过麦克风实时了解环境声量，查看分贝趋势与测量记录。音频仅在设备本地处理。",
        ),
      );
  }, [language, value]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage requires a LanguageProvider");
  return value;
}
