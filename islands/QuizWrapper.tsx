// deno-lint-ignore-file
// islands/QuizWrapper.tsx
import { useState } from "preact/hooks";
import QuizGame from "./QuizGame.tsx";
import firebaseConfig from "../database/firebaseKeys/serviceAccount.ts";

export default function QuizWrapper() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div class={`p-6 min-h-screen transition-colors duration-300 
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h1 class="text-3xl font-bold mb-4">🎮 Kotoba Quiz</h1>
      
      {/* toggle mode button */}
      <div class="flex gap-4 mb-6">
        <button
          onClick={toggleTheme}
          class="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>

        <a
          href="/"
          class="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
        >
          📚 Kotoba List
        </a>

        <a href={`https://wa.me/${firebaseConfig.number}`} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors duration-200" target="-blank"
        >
          電話：バシャイル
        </a>
      </div>

      <QuizGame theme={theme} />
    </div>
  );
}
