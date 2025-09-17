// deno-lint-ignore-file
import { useEffect, useState } from "preact/hooks";
import WordCard from "../components/WordCard.tsx";
import { dbModelsFirestore, dbModelsRealtime } from "../models/dbModels.ts";

interface KotobaListProps {
  theme?: "light" | "dark";
  lang: "id" | "en" | "jp";
}

const labels = {
  id: {
    selectKa: "Pilih Bab:",
    loading: "📖 Sedang memuat...",
    search: "Cari kotoba (kanji, hiragana, romaji, arti)...",
    back: "◀ Sebelumnya",
    next: "Selanjutnya ▶",
    page: "Halaman",
    of: "dari",
    from: "Dari",
    select: "Semua"
  },
  en: {
    selectKa: "Select Lesson:",
    loading: "📖 Loading...",
    search: "Search kotoba (kanji, hiragana, romaji, meaning)...",
    back: "◀ Back",
    next: "Next ▶",
    page: "Page",
    of: "of",
    from: "From",
    select: "All"
  },
  jp: {
    selectKa: "課を選択：",
    loading: "📖 読み込み中...",
    search: "言葉を検索（漢字、ひらがな、ローマ字、意味）...",
    back: "◀ 戻る",
    next: "次 ▶",
    page: "ページ",
    of: "/",
    from: "課",
    select: "全部"
  },
};

const ALL_KEY: string = "ALL";

export default function KotobaList({ theme = "light", lang }: KotobaListProps) {
  const [data, setData] = useState<any>({});
  const [KaList, setKaList] = useState<string[]>([]);
  const [selectedKa, setSelectedKa] = useState<string>("");
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const perPage = 8;

  const bgColor = theme === "dark"
    ? "bg-gray-900 text-white"
    : "bg-white text-black";
  const textColor = theme === "dark" ? "text-white" : "text-black";

  useEffect(() => {
    async function fetchData() {
      const allData = await dbModelsRealtime.getAll();
      // const allData = await dbModelsFirestore.getAll();
      if (allData) {
        setData(allData);
        const keys = Object.keys(allData);
        setKaList([ALL_KEY, ...keys]);
        setSelectedKa(ALL_KEY);
      }
    }
    fetchData();
  }, []);

  if (!selectedKa) {
    return (
      <div
        class={`min-h-screen flex justify-center ${bgColor} ${textColor} pt-4`}
      >
        {labels[lang].loading}
      </div>
    );
  }

  // Collect words and include Ka info
  let words: any[] = [];
  if (selectedKa === ALL_KEY) {
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

  const cardBg = theme === "dark"
    ? "bg-gray-800 text-white"
    : "bg-white text-black";
  const buttonBg = theme === "dark"
    ? "bg-gray-700 text-white"
    : "bg-gray-200 text-black";
  const selectBg = theme === "dark"
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-black";
  const inputBg = theme === "dark"
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-black";

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

  // const scrollToTop = () => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  const scrollToTarget = () => {
    const el = document.getElementById("display-kotoba");
    if (el) {
      const yOffset = -20; // Adjust this value as needed
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div class={`max-w-5xl mx-auto p-4 ${bgColor} min-h-screen`}>
      {/* Dropdown for 課を選択 */}
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label class="font-bold">{labels[lang].selectKa}</label>
        <select
          class={`border p-2 rounded w-full sm:w-auto ${selectBg}`}
          value={selectedKa}
          onChange={(e) => {
            setSelectedKa((e.target as HTMLSelectElement).value);
            setPage(0);
            setSearchQuery("");
          }}
        >
          <option value={ALL_KEY}>{labels[lang].select}</option>
          {KaList.filter((Ka) => Ka !== ALL_KEY).map((Ka) => (
            <option value={Ka} key={Ka}>
              {Ka}
            </option>
          ))}
        </select>
      </div>

      {/* Search box */}
      <div class="mb-4 relative">
        <input
          type="text"
          placeholder={labels[lang].search}
          class={`border p-2 rounded w-full ${inputBg}`}
          value={searchQuery}
          onInput={(e) => {
            setSearchQuery((e.target as HTMLInputElement).value);
            setPage(0);
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            {/* Icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Responsive grid */}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        id="display-kotoba"
      >
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
            {selectedKa === ALL_KEY && (
              <p class="text-xs text-gray-400 mt-1">{labels[lang].from}: {w.Ka}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-6">
        <button
          class={`px-4 py-2 rounded disabled:opacity-50 ${buttonBg}`}
          disabled={page === 0}
          onClick={() => {
            setPage((p) => p - 1);
            scrollToTarget();
          }}
        >
          {labels[lang].back}
        </button>
        <span class="px-2">
          {labels[lang].page} {totalPages === 0 ? 0 : page + 1} {labels[lang].of} {totalPages}
        </span>
        <button
          class={`px-4 py-2 rounded disabled:opacity-50 ${buttonBg}`}
          disabled={page >= totalPages - 1}
          onClick={() => {
            setPage((p) => p + 1);
            scrollToTarget();
          }}
        >
          {labels[lang].next}
        </button>
      </div>
    </div>
  );
}
