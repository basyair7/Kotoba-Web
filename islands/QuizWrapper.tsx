// deno-lint-ignore-file
// islands/QuizWrapper.tsx
import { useState } from "preact/hooks";
import QuizGame from "./QuizGame.tsx";
import firebaseConfig from "../database/firebaseKeys/serviceAccount.ts";
import { useTheme } from "../hooks/useTheme.ts";
import ThemeToggle from "../components/ThemeToggle.tsx";

export default function QuizWrapper() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div class={`p-6 min-h-screen transition-colors duration-300 
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h1 class="text-3xl font-bold mb-4">🎮 Kotoba Quiz</h1>
      
      {/* toggle mode button */}
      <div class="flex gap-4 mb-6">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

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
