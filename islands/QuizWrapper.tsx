// deno-lint-ignore-file
// islands/QuizWrapper.tsx
import { useState, useEffect } from "preact/hooks";
import QuizGame from "./QuizGame.tsx";
import firebaseConfig from "../database/firebaseKeys/serviceAccount.ts";
import { useTheme } from "../hooks/useTheme.ts";
import ThemeToggle from "../components/ThemeToggle.tsx";

const labels = {
  id: {
    title: "🎮 Kuis Kotoba",
    kotoba: "📚 Daftar Kotoba",
    langSelect: "Bahasa:",
  },
  en: {
    title: "🎮 Kotoba Quiz",
    kotoba: "📚 Kotoba List",
    langSelect: "Language:",
  },
  jp: {
    title: "🎮 言葉クイズ",
    kotoba: "📚 言葉リスト",
    langSelect: "言語：",
  },
};

export default function QuizWrapper() {
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<"id" | "en" | "jp">(
    () => (localStorage.getItem("lang") as "id" | "en" | "jp") || "id"
  );

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <div class={`p-6 min-h-screen transition-colors duration-300 
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h1 class="text-3xl font-bold mb-4">{labels[lang].title}</h1>
      
      {/* toggle mode button */}
      <div class="flex gap-4 mb-6">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        <a
          href="/"
          class="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
        >
          {labels[lang].kotoba}
        </a>

        {/* <a href={`https://wa.me/${firebaseConfig.number}`} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors duration-200" target="-blank"
        >
          電話：バシャイル
        </a> */}
        <div className="flex items-center gap-2">
          <select 
            class={`border p-2 rounded ${
             theme === "dark"
             ? "bg-gray-700 text-white border-gray-600"
             : "bg-white text-black"}`
            }
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

      <QuizGame theme={theme} lang={lang}/>
    </div>
  );
}
