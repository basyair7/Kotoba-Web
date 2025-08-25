import { JSX } from "preact";

interface WordProps {
  jp: string;
  furigana: string;
  romaji: string;
  indonesia: string;
  theme?: "light" | "dark"; // tambahkan prop theme
  className?: string;        // opsional, untuk custom styling dari parent
}

export default function WordCard({
  jp,
  furigana,
  romaji,
  indonesia,
  theme = "light",
  className = "",
}: WordProps): JSX.Element {
  const bgColor = theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black";
  const romajiColor = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const idColor = theme === "dark" ? "text-green-400" : "text-green-700";

  return (
    <div class={`p-4 rounded-2xl shadow my-2 ${bgColor} ${className}`}>
      {/* Kanji + Furigana */}
      <h2 class="text-2xl font-bold">
        {furigana ? (
          <ruby>
            {jp}
            <rt class="text-sm text-gray-500">{furigana}</rt>
          </ruby>
        ) : (
          jp
        )}
      </h2>

      {/* Romaji */}
      {romaji && <p class={`italic ${romajiColor}`}>{romaji}</p>}

      {/* Arti Indonesia */}
      <p class={`${idColor}`}>{indonesia}</p>
    </div>
  );
}
