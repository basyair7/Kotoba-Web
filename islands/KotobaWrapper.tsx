// deno-lint-ignore-file
// islands/KotobaWrapper.tsx
import { useState, useEffect } from "preact/hooks";
import KotobaList from "./KotobaList.tsx";
import { useTheme } from "../hooks/useTheme.ts";
import ThemeToggle from "../components/ThemeToggle.tsx";

const labels = {
  id: {
    title: "📚 Daftar Kotoba",
    quiz: "🎮 Kuis Kotoba",
    langSelect: "Bahasa:",
  },
  en: {
    title: "📚 Kotoba List",
    quiz: "🎮 Kotoba Quiz",
    langSelect: "Language:",
  },
  jp: {
    title: "📚 言葉リスト",
    quiz: "🎮 言葉クイズ",
    langSelect: "言語：",
  },
};

export default function KotobaWrapper() {
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<"id" | "en" | "jp">(
    () => (localStorage.getItem("lang") as "id" | "en" | "jp") || "id",
  );

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <div
      class={`p-4 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h1 class="text-3xl font-bold mb-4">{labels[lang].title}</h1>

      <div class="flex flex-wrap gap-4 mb-6 items-center">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        <a
          href="/quiz"
          class="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
        >
          {labels[lang].quiz}
        </a>

        <div class="flex items-center gap-2">
          {/* <span>{labels[lang].langSelect}</span> */}
          <select
            class={`border p-2 rounded ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black"
            }`}
            value={lang}
            onChange={(e) =>
              setLang((e.target as HTMLSelectElement).value as "id" | "en" | "jp")
            }
          >
            <option value="id">🇮🇩 Indonesia</option>
            {/* <option value="en">🇬🇧 English</option> */}
            <option value="jp">🇯🇵 日本語</option>
          </select>
        </div>
      </div>

      <KotobaList theme={theme} lang={lang} />
    </div>
  );
}
