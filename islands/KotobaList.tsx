// deno-lint-ignore-file
import { useEffect, useState } from "preact/hooks";
import WordCard from "../components/WordCard.tsx";
import dbModels from "../models/dbModels.ts";

interface KotobaListProps {
  theme?: "light" | "dark";
}

export default function KotobaList({ theme = "light" }: KotobaListProps) {
  const [data, setData] = useState<any>({});
  const [KaList, setKaList] = useState<string[]>([]);
  const [selectedKa, setSelectedKa] = useState<string>("");
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); 
  const perPage = 8;

  const bgColor = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";
  const textColor = theme === "dark" ? "text-white" : "text-black";

  useEffect(() => {
    async function fetchData() {
      const allData = await dbModels.getAll();
      if (allData) {
        setData(allData);
        const keys = Object.keys(allData);
        setKaList(["全部", ...keys]);
        setSelectedKa("全部");
      }
    }
    fetchData();
  }, []);

  if (!selectedKa)
    return (
      <div class={`min-h-screen flex justify-center ${bgColor} ${textColor} pt-4`}>
        読み込み中...
      </div>
    );


  // Collect words and include Ka info
  let words: any[] = [];
  if (selectedKa === "全部") {
    words = Object.entries(data).flatMap(([KaName, Ka]: any) =>
      Object.values(Ka).map((w: any) => ({ ...w, Ka: KaName }))
    );
  } else {
    words = Object.values(data[selectedKa] || {}).map((w: any) => ({
      ...w,
      Ka: selectedKa,
    }));
  }

  // Filter by search
  const filteredWords = words.filter((w: any) => {
    const q = searchQuery.toLowerCase();
    return (
      w.kanji?.toLowerCase().includes(q) ||
      w.furigana?.toLowerCase().includes(q) ||
      w.romaji?.toLowerCase().includes(q) ||
      w.indonesia?.toLowerCase().includes(q) // "indonesia" = Indonesian meaning
    );
  });

  const totalPages = Math.ceil(filteredWords.length / perPage);
  const start = page * perPage;
  const currentWords = filteredWords.slice(start, start + perPage);

  const cardBg = theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black";
  const buttonBg = theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black";
  const selectBg = theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black";
  const inputBg = theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black";

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && page > 0) {
        setPage((p) => p - 1);
      } else if (e.key === "ArrowRight" && page < totalPages - 1) {
        setPage((p) => p + 1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page, totalPages]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div class={`max-w-5xl mx-auto p-4 ${bgColor} min-h-screen`}>
      {/* Dropdown for 課を選択 */}
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label class="font-bold">課を選択：</label>
        <select
          class={`border p-2 rounded w-full sm:w-auto ${selectBg}`}
          value={selectedKa}
          onChange={(e) => {
            setSelectedKa((e.target as HTMLSelectElement).value);
            setPage(0);
            setSearchQuery("");
          }}
        >
          {KaList.map((Ka) => (
            <option value={Ka} key={Ka}>
              {Ka}
            </option>
          ))}
        </select>
      </div>

      {/* Search box */}
      <div class="mb-4">
        <input
          type="text"
          placeholder="Search kotoba (kanji, hiragana, romaji, meaning)..."
          class={`border p-2 rounded w-full ${inputBg}`}
          value={searchQuery}
          onInput={(e) => {
            setSearchQuery((e.target as HTMLInputElement).value);
            setPage(0);
          }}
        />
      </div>

      {/* Responsive grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentWords.map((w: any) => (
          <div class="flex flex-col h-full">
            <WordCard
              jp={w.kanji}
              furigana={w.furigana}
              romaji={w.romaji}
              indonesia={w.indonesia}
              theme={theme}
              className={`${cardBg} flex flex-col h-full justify-between`}
            />
            {/* Show Ka info below each card */}
            {selectedKa === "全部" && (
              <p class="text-xs text-gray-400 mt-1">From: {w.Ka}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-6">
        <button
          class={`px-4 py-2 rounded disabled:opacity-50 ${buttonBg}`}
          disabled={page === 0}
          onClick={() => {setPage((p) => p - 1); scrollToTop();}}
        >
          ◀ Back
        </button>
        <span class="px-2">
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <button
          class={`px-4 py-2 rounded disabled:opacity-50 ${buttonBg}`}
          disabled={page >= totalPages - 1}
          onClick={() => {setPage((p) => p + 1); scrollToTop();}}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
