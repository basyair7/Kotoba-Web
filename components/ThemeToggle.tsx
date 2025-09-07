// deno-lint-ignore-file
// components/ThemeToggle.tsx

export default function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <button
      onClick={toggleTheme}
      class={`flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200 ${
        theme === "dark"
          ? "bg-yellow-400 text-black"
          : "bg-gray-700 text-white"
      }`}
    >
      {theme === "dark"
        ? (
          <>
            {/* ☀️ Sun icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="5" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </svg>
            Light Mode
          </>
        )
        : (
          <>
            {/* 🌙 Moon icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
              />
            </svg>
            Dark Mode
          </>
        )}
    </button>
  );
}
