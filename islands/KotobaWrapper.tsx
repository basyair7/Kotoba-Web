// deno-lint-ignore-file
// islands/KotobaWrapper.tsx
import { useState } from "preact/hooks";
import KotobaList from "./KotobaList.tsx";
import firebaseConfig from "../database/firebaseKeys/serviceAccount.ts";

export default function KotobaWrapper() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div class={`p-4 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h1 class="text-3xl font-bold mb-4">📚 Kotoba みんなの日本語 List</h1>
      
      <div class="flex gap-4 mb-6">
        <button
          onClick={toggleTheme}
          class="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>

        <a
          href="/quiz"
          class="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
        >
          🎮 Kotoba Quiz
        </a>

        <a href={`https://wa.me/${firebaseConfig.number}`} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors duration-200" target="-blank"
        >
          電話：バシャイル
        </a>
      </div>

      <KotobaList theme={theme} />
    </div>
  );
}
