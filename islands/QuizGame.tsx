// routes/QuizGame.tsx
import { useEffect, useState } from "preact/hooks";
import dbModels from "../models/dbModels.ts";

interface Word {
  id: string;
  kanji: string;
  furigana: string;
  bab: string;
}

interface QuizGameProps {
  theme?: "light" | "dark";
}

export default function QuizGame({ theme = "light" }: QuizGameProps) {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBab, setSelectedBab] = useState<string>("all");
  const [babList, setBabList] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>(""); // teks feedback
  const [answered, setAnswered] = useState(false); // mencegah klik ganda

  useEffect(() => {
    fetchWords();
  }, []);

  async function fetchWords() {
    const allData = await dbModels.getAll();
    const parsed: Word[] = [];
    const babs: Set<string> = new Set();

    Object.entries(allData).forEach(([bab, items]) => {
      babs.add(bab);
      Object.entries(items as Record<string, any>).forEach(([id, value]) => {
        parsed.push({
          kanji: value?.kanji ?? "???",
          furigana: value?.furigana ?? "",
          id: value?.id ?? "(belum ada terjemahan)",
          bab,
        });
      });
    });

    parsed.sort(() => Math.random() - 0.5);
    setAllWords(parsed);
    setBabList(Array.from(babs));
    setLoading(false);
    setWords(parsed);
    generateOptions(parsed, 0);
  }

  function handleBabChange(e: Event) {
    const bab = (e.target as HTMLSelectElement).value;
    setSelectedBab(bab);
    const filtered = bab === "all" ? allWords : allWords.filter(w => w.bab === bab);
    setWords(filtered);
    setCurrentIndex(0);
    generateOptions(filtered, 0);
    setScore(0);
    setFeedback("");
    setAnswered(false);
  }

  function generateOptions(wordList: Word[], index: number) {
    if (wordList.length === 0) return;
    const correctWord = wordList[index];
    const shuffled = [...wordList]
      .filter((_, i) => i !== index)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    shuffled.push(correctWord);
    setOptions(shuffled.sort(() => 0.5 - Math.random()));
  }

  function handleAnswer(selected: Word) {
    if (answered) return; // mencegah klik ganda
    setAnswered(true);

    const correctWord = words[currentIndex];

    if (selected.id === correctWord.id) {
      setScore(prev => prev + 1);
      setFeedback("正解! 🎉");
    } else {
      setFeedback(`不正解！ 正しい答え: ${correctWord.id}`);
    }

    // pindah ke soal berikutnya setelah 1,5 detik
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < words.length) {
        setCurrentIndex(nextIndex);
        generateOptions(words, nextIndex);
        setFeedback("");
        setAnswered(false);
      } else {
        alert(`ゲーム終了！ 最終スコア: ${selected.id === correctWord.id ? score + 1 : score}/${words.length}`);
      }
    }, 1500);
  }

  if (loading) return <div>読み込み中...</div>;
  if (words.length === 0) return <div>データがありません。</div>;

  const currentWord = words[currentIndex];

  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-black";
  const buttonBg = theme === "dark" ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600";

  return (
    <div class={`p-6 max-w-xl mx-auto ${bgColor} ${textColor} rounded-lg shadow-md`}>
      <h1 class="text-2xl font-bold mb-4">言葉を当てる</h1>

      {/* Dropdown filter bab */}
      <div class="mb-4">
        <label class="mr-2 font-semibold"></label>
        <select
          value={selectedBab}
          onChange={handleBabChange}
          class={`p-2 border rounded ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : ""}`}
        >
          <option value="all">全部</option>
          {babList.map(b => (
            <option value={b} key={b}>{b}</option>
          ))}
        </select>
      </div>

      <p class="mb-2">問題 {currentIndex + 1} / 全{words.length}問</p>
      <p class="mb-4 font-semibold">Score: {score}</p>

      <div class="mb-4">
        <p class="text-lg">
          {" "}
          <span class="font-bold">
            {currentWord.kanji} {currentWord.furigana == "" ? "" : "「"+ currentWord.furigana + "」"}
          </span>
        </p>

        {/* Feedback */}
        {feedback && (
          <p class={`mt-2 font-semibold ${feedback.startsWith("正解") ? "text-green-400" : "text-red-400"}`}>
            {feedback}
          </p>
        )}
      </div>

      <div class="grid grid-cols-1 gap-4">
        {options.map((option, index) => (
          <button
            key={`${option.id}-${index}`}
            onClick={() => handleAnswer(option)}
            class={`p-4 rounded-lg ${buttonBg} text-white`}
            disabled={answered} // tombol disabled jika sudah dijawab
          >
            {option.id || "(kosong)"}
          </button>
        ))}
      </div>
    </div>
  );
}
