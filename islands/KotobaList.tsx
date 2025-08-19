// deno-lint-ignore-file
import { useEffect, useState } from "preact/hooks";
import WordCard from "../components/WordCard.tsx";
import dbModels from "../models/dbModels.ts";

interface KotobaListProps {
  theme?: "light" | "dark";
}

export default function KotobaList({ theme = "light" }: KotobaListProps) {
  const [data, setData] = useState<any>({});
  const [babList, setBabList] = useState<string[]>([]);
  const [selectedBab, setSelectedBab] = useState<string>("");
  const [page, setPage] = useState(0);
  const perPage = 8;

  useEffect(() => {
    async function fetchData() {
      const allData = await dbModels.getAll();
      if (allData) {
        setData(allData);
        const keys = Object.keys(allData);
        setBabList(keys);
        setSelectedBab(keys[0]);
      }
    }
    fetchData();
  }, []);

  if (!selectedBab) return <div class="p-4">Loading...</div>;

  const words = Object.values(data[selectedBab] || {});
  const totalPages = Math.ceil(words.length / perPage);
  const start = page * perPage;
  const currentWords = words.slice(start, start + perPage);

  const bgColor = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";
  const cardBg = theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black";
  const buttonBg = theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black";
  const selectBg = theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black";

  return (
    <div class={`max-w-5xl mx-auto p-4 ${bgColor} min-h-screen`}>
      {/* Dropdown pilih bab */}
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label class="font-bold">Pilih Bab:</label>
        <select
          class={`border p-2 rounded w-full sm:w-auto ${selectBg}`}
          value={selectedBab}
          onChange={(e) => {
            setSelectedBab((e.target as HTMLSelectElement).value);
            setPage(0);
          }}
        >
          {babList.map((bab) => (
            <option value={bab} key={bab}>
              {bab}
            </option>
          ))}
        </select>
      </div>

      {/* Grid responsif */}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentWords.map((w: any) => (
          <WordCard
            jp={w.kanji}
            furigana={w.furigana}
            romaji={w.romaji}
            id={w.id}
            theme={theme} // optional, kalau WordCard juga support theme
            className={cardBg}
          />
        ))}
      </div>

      {/* Pagination responsif */}
      <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-6">
        <button
          class={`px-4 py-2 rounded disabled:opacity-50 ${buttonBg}`}
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          ◀ Back
        </button>
        <span class="px-2">
          Page {page + 1} of {totalPages}
        </span>
        <button
          class={`px-4 py-2 rounded disabled:opacity-50 ${buttonBg}`}
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
