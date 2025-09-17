// deno-lint-ignore-file
// routes/QuizGame.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import Swal from "https://esm.sh/sweetalert2@11";
import { dbModelsFirestore, dbModelsRealtime } from "../models/dbModels.ts";

interface Word {
  indonesia: string; // インドネシア語
  kanji: string; // 漢字/言葉
  furigana: string; // ふりがな
  dai: string; // だい
}

interface QuizGameProps {
  theme?: "light" | "dark";
  lang: "id" | "en" | "jp";
}

// NOTE: WrongAnswer now supports two shapes for backward compatibility:
// - new (structured): { question: Word, selected: Word, quizMode: 'jpToId'|'idToJp' }
// - old (string): { question: Word, yourAnswer: string, correctAnswer: string }
interface WrongAnswer {
  question: Word;
  // new structured fields (preferred)
  selected?: Word;
  quizMode?: "jpToId" | "idToJp";

  // legacy fields (kept optional so older persisted progress still works)
  yourAnswer?: string;
  correctAnswer?: string;
}

const labels = {
  id: {
    title: "Tebak Kotoba",
    dai: "Bab",
    question: "Soal",
    correct: "Benar",
    wrong: "Salah",
    answer: "Jawabanmu",
    correctAnswer: "Jawaban yang benar",
    review: "Mari review ✍️",
    playAgain: "Main lagi",
    quit: "Berhenti",
    quitConfirm: "Yakin mau berhenti?",
    quitText: "Kuis yang sedang berlangsung akan berakhir.",
    yes: "Ya, berhenti",
    cancel: "Batal",
    result: "Hasil",
    thanks: "Terima kasih atas usahanya!",
    yourScore: "Skormu",
    selectedDai: "Bab yang dipilih",
    select: "Semua",
    total: (n: number) => `Dari total ${n} soal`,
    correctCount: "Jumlah salah",
    wrongCount: "Jumlah salah",
    allCorrect: "Semua benar! Luar biasa! 🎉",
    showFuri: "Tampilkan furigana",
    hideFuri: "Sembunyikan furigana",
    mode1: "Jepang → Indonesia",
    mode2: "Indonesia → Jepang",
    meaning: "Artinya?",
    noData: "Tidak ada data.",
    loading: "Membuat...",
    translateError: "(belum ada terjemahan)",
  },
  en: {
    title: "Guess the Kotoba",
    dai: "Chapter",
    question: "Question",
    correct: "Correct",
    wrong: "Wrong",
    answer: "Your Answer",
    correctAnswer: "Correct Answer",
    review: "Let's review ✍️",
    playAgain: "Play Again",
    quit: "Quit",
    quitConfirm: "Are you sure you want to quit?",
    quitText: "The ongoing quiz will end.",
    yes: "Yes, quit",
    cancel: "Cancel",
    result: "Result",
    thanks: "Thanks for your effort!",
    yourScore: "Your Score",
    selectedDai: "Selected Chapter",
    select: "All",
    total: (n: number) => `Out of ${n} questions`,
    correctCount: "Correct Answers",
    wrongCount: "Wrong Answers",
    allCorrect: "All correct! Amazing! 🎉",
    showFuri: "Show Furigana",
    hideFuri: "Hide Furigana",
    mode1: "Japan → English",
    mode2: "English → Japan",
    meaning: "Meaning?",
    noData: "No data.",
    loading: "Loading...",
    translateError: "(no translation)"
  },
  jp: {
    title: "言葉を当てる",
    dai: "課",
    question: "問題",
    correct: "正解",
    wrong: "不正解",
    answer: "あなたの答え",
    correctAnswer: "正しい答え",
    review: "復習しましょう ✍️",
    playAgain: "もう一度プレイ",
    quit: "やめる",
    quitConfirm: "本当にやめますか？",
    quitText: "進行中のクイズが終了します。",
    yes: "はい、やめる",
    cancel: "キャンセル",
    result: "結果",
    thanks: "お疲れ様でした！",
    yourScore: "あなたのスコア",
    selectedDai: "選択した課",
    select: "全部",
    total: (n: number) => `全 ${n} 問から`,
    correctCount: "正解数",
    wrongCount: "不正解数",
    allCorrect: "全部正解！素晴らしい！ 🎉",
    showFuri: "ふりがなを表示する",
    hideFuri: "ふりがなを隠す",
    mode1: "日本語 → インドネシア語",
    mode2: "インドネシア語 → 日本語",
    meaning: "意味は？",
    noData: "データがありません。",
    loading: "読み込み中...",
    translateError: "（まだ翻訳がありません）"
  },
};

const ALL_KEY: string = "ALL";

export default function QuizGame({ theme = "light", lang }: QuizGameProps) {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDai, setSelectedDai] = useState<string>("all");
  const [daiList, setDaiList] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [answered, setAnswered] = useState(false);
  const [quizMode, setQuizMode] = useState<"jpToId" | "idToJp">("idToJp");
  const [isFinished, setIsFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [showFurigana, setShowFurigana] = useState(false);
  const [restored, setRestored] = useState(false);
  const answeringRef = useRef(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("quizMode") as
      | "jpToId"
      | "idToJp"
      | null;
    const savedDai = localStorage.getItem("selectedDai");
    const savedFurigana = localStorage.getItem("showFurigana");
    const savedProgress = localStorage.getItem("quizProgress");

    if (savedMode) setQuizMode(savedMode);
    if (savedDai) setSelectedDai(savedDai);
    if (savedFurigana !== null) setShowFurigana(JSON.parse(savedFurigana));

    fetchWords(savedProgress);
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("quizMode", quizMode);
  }, [quizMode]);

  useEffect(() => {
    localStorage.setItem("selectedDai", selectedDai);
  }, [selectedDai]);

  useEffect(() => {
    localStorage.setItem("showFurigana", JSON.stringify(showFurigana));
  }, [showFurigana]);

  useEffect(() => {
    const progress = {
      currentIndex,
      correctCount,
      wrongCount,
      wrongAnswers,
      words,
    };
    localStorage.setItem("quizProgress", JSON.stringify(progress));
  }, [currentIndex, correctCount, wrongCount, wrongAnswers, words]);

  useEffect(() => {
    if (allWords.length === 0) return;
    if (restored) return; // Skip if restored from progress

    const filtered = selectedDai === "all"
      ? allWords
      : allWords.filter((w) => w.dai === selectedDai);

    resetQuiz(filtered);
  }, [selectedDai, allWords]);

  async function fetchWords(savedProgress?: string | null) {
    const allData = await dbModelsRealtime.getAll();
    // const allData = await dbModelsFirestore.getAll();
    const parsed: Word[] = [];
    const dais: Set<string> = new Set();

    Object.entries(allData).forEach(([dai, items]) => {
      dais.add(dai);
      Object.entries(items as Record<string, any>).forEach(
        ([indonesia, value]) => {
          parsed.push({
            kanji: value?.kanji ?? "???",
            furigana: value?.furigana ?? "",
            indonesia: value?.indonesia ?? labels[lang].translateError,
            dai,
          });
        },
      );
    });

    const shuffled = parsed.sort(() => Math.random() - 0.5);
    setAllWords(shuffled);
    setDaiList(Array.from(dais));

    if (savedProgress) {
      try {
        const prog = JSON.parse(savedProgress);
        if (prog.words && prog.words.length > 0) {
          setWords(prog.words);
          setCurrentIndex(prog.currentIndex || 0);
          setCorrectCount(prog.correctCount || 0);
          setWrongCount(prog.wrongCount || 0);
          setWrongAnswers(prog.wrongAnswers || []);
          generateOptions(prog.words, prog.currentIndex || 0);
          setLoading(false);
          setRestored(true);
          return;
        }
      } catch {
        console.log("Failed to load progress");
      }
    }
    setWords(shuffled);
    setLoading(false);
    generateOptions(shuffled, 0);
  }

  function resetQuiz(baseList: Word[]) {
    const shuffled = [...baseList].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    generateOptions(shuffled, 0);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedback("");
    setAnswered(false);
    setIsFinished(false);
    setWrongAnswers([]);
  }

  function handleDaiChange(e: Event) {
    const dai = (e.target as HTMLSelectElement).value;
    setSelectedDai(dai);
    const filtered = dai === "all"
      ? allWords
      : allWords.filter((w) => w.dai === dai);
    resetQuiz(filtered);
  }

  function handleModeChange(e: Event) {
    const mode = (e.target as HTMLSelectElement).value as
      | "jpToId"
      | "idToJp";
    setQuizMode(mode);

    const filtered = selectedDai === "all"
      ? allWords
      : allWords.filter((w) => w.dai === selectedDai);
    resetQuiz(filtered);
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
    if (isFinished || answeringRef.current || answered) return;
    answeringRef.current = true;
    setAnswered(true);

    const correctWord = words[currentIndex];
    let isCorrect = false;

    if (quizMode === "jpToId") {
      isCorrect = selected.indonesia === correctWord.indonesia;
    } else {
      isCorrect = selected.kanji === correctWord.kanji;
    }

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setFeedback(labels[lang].correct + " 🎉");
    } else {
      setWrongCount((prev) => prev + 1);

      // Push structured wrong answer so we can re-render dynamically depending on showFurigana
      setWrongAnswers((prev) => [
        ...prev,
        {
          question: correctWord,
          selected: selected,
          quizMode: quizMode,
        },
      ]);

      setFeedback(`${labels[lang].wrong}! ${labels[lang].correctAnswer}: ${labels[lang].correctAnswer}: ${
        quizMode === "jpToId"
          ? correctWord.indonesia
          : `${correctWord.kanji}${showFurigana && correctWord.furigana ? "「" + correctWord.furigana + "」" : ""}`
      }`);
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < words.length) {
        setCurrentIndex(nextIndex);
        generateOptions(words, nextIndex);
        setFeedback("");
        setAnswered(false);
        answeringRef.current = false;
      } else {
        setIsFinished(true);
        answeringRef.current = false;
      }
    }, 1200);
  }

  if (loading) {
    return (
      <div class="min-h-screen flex justify-center p-4">{labels[lang].loading}</div>
    );
  }
  if (words.length === 0) {
    return (
      <div class="min-h-screen flex justify-center p-4">
        {labels[lang].noData}
      </div>
    );
  }

  const currentWord = words[currentIndex];

  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-black";
  const buttonBg = theme === "dark"
    ? "bg-blue-700 hover:bg-blue-600"
    : "bg-blue-500 hover:bg-blue-600";

  // small helper to render kanji + (optionally) furigana
  const renderKanjiWithFuri = (w: Word) =>
    `${w.kanji}${showFurigana && w.furigana ? `「${w.furigana}」` : ""}`;

  // --- REVIEW PAGE ---
  if (isFinished) {
    const percent = words.length > 0
      ? Math.round((correctCount / words.length) * 100)
      : 0;

    return (
      <div
        class={`p-6 max-w-xl mx-auto ${bgColor} ${textColor} rounded-lg shadow-md`}
      >
        <h1 class="text-2xl font-bold mb-4">{labels[lang].result}</h1>
        <h2 class="text-xl font-semibold mb-4">{labels[lang].thanks}</h2>
        <h2 class="mb-2 text-lg">{labels[lang].yourScore}:</h2>
        <p class="text-3xl font-extrabold mb-4">{percent}%</p>
        <p class="mb-2">{labels[lang].selectedDai}: {selectedDai === "all" ? labels[lang].select : selectedDai}</p>
        <p class="mb-2">{labels[lang].total(words.length)}</p>
        <p class="mb-2">{labels[lang].correctCount}: {correctCount}</p>
        <p class="mb-4">{labels[lang].wrongCount}: {wrongCount}</p>

        {wrongAnswers.length > 0
          ? (
            <div class="mt-4">
              <h2 class="text-xl font-semibold mb-2">{labels[lang].review}</h2>
              <ul class="space-y-3">
                {wrongAnswers.map((wa, idx) => {
                  // support both structured (new) and legacy (string) shapes
                  const isStructured = (wa as any).selected !== undefined;
                  const waMode = wa.quizMode ?? quizMode; // fallback to current mode if missing

                  const questionDisplay = waMode === "jpToId"
                    ? renderKanjiWithFuri(wa.question)
                    : wa.question.indonesia;

                  const yourAnswerDisplay = isStructured
                    ? (waMode === "jpToId"
                      ? wa.selected!.indonesia
                      : renderKanjiWithFuri(wa.selected!))
                    : wa.yourAnswer || "(no answer)";

                  const correctAnswerDisplay = isStructured
                    ? (waMode === "jpToId"
                      ? wa.question.indonesia
                      : renderKanjiWithFuri(wa.question))
                    : wa.correctAnswer || "(no correct answer)";

                  return (
                    <li
                      key={idx}
                      class={`p-3 border rounded ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-red-50 text-black border-red-200"
                      }`}
                    >
                      <p>
                        <strong class="text-2xl">{labels[lang].question}:</strong>{" "}
                        <span className="text-white text-2xl">
                          {questionDisplay}
                        </span>
                      </p>
                      <p class="text-red-400 text-2xl">
                        {labels[lang].answer}: {yourAnswerDisplay}
                      </p>
                      <p class="text-green-400 text-2xl">
                        {labels[lang].correctAnswer}: {correctAnswerDisplay}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
          : (
            percent === 100 && (
              <p class="mt-4 text-green-400 font-bold">
                {labels[lang].allCorrect}
              </p>
            )
          )
        }

        {/* Action Buttons */}
        <div class="mt-6 flex gap-3">
          {/* もう一度プレイ Button */}
          <button
            onClick={() => resetQuiz(words)}
            class={`px-4 py-2 rounded ${buttonBg} text-white`}
          >
            {labels[lang].playAgain}
          </button>

          {/* Furigana Toggle Button */}
          {wrongAnswers.length > 0 && (
            <button
              className={`px-4 py-2 rounded-md border transition ${
                showFurigana
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
              onClick={() => setShowFurigana((prev) => !prev)}
            >
              {showFurigana ? labels[lang].hideFuri : labels[lang].showFuri}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Quiz main screen ---
  return (
    <div
      class={`p-6 max-w-xl mx-auto ${bgColor} ${textColor} rounded-lg shadow-md`}
    >
      <h1 class="text-2xl font-bold mb-4">{labels[lang].title}</h1>

      {/* Filter だい + mode switch + furigana toggle */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <select
          value={selectedDai}
          onChange={handleDaiChange}
          class={`p-2 border rounded ${
            theme === "dark" ? "bg-gray-700 text-white border-gray-600" : ""
          }`}
        >
          <option value="all">{labels[lang].select}</option>
          {daiList.map((b) => (
            <option value={b} key={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={quizMode}
          onChange={handleModeChange}
          class={`p-2 border rounded ${
            theme === "dark" ? "bg-gray-700 text-white border-gray-600" : ""
          }`}
        >
          <option value="jpToId">{labels[lang].mode1}</option>
          <option value="idToJp">{labels[lang].mode2}</option>
        </select>

        {/* Checkbox furigana (removed) */}
      </div>

      <p class="mb-2">
        {/* 問題 {currentIndex + 1} / 全{words.length}問 */}
        {/* {quizMode === "jpToId" 
          ? `Soal ${currentIndex + 1} / dari ${words.length} soal`
          : `問題 ${currentIndex + 1} / 全${words.length}問`
        } */}
        {labels[lang].question} {currentIndex + 1} / {words.length}
      </p>
      {selectedDai === "all" && (
        <p class="mb-2">
          {/* {quizMode === "jpToId"
            ? `Bab: ${currentWord.dai}`
            : `課: ${currentWord.dai}`
          } */}
          {labels[lang].dai}: {currentWord.dai}
        </p>
      )}
      <p class="mb-2 font-semibold">
        {/* 正解: {correctCount} | 不正解: {wrongCount} */}
        {labels[lang].correct}: {correctCount} | {labels[lang].wrong}: {wrongCount}
      </p>

      {/* 質問 */}
      <div class="mb-4">
        <h3 class="text-2xl font-bold mb-2">
          {quizMode === "jpToId"
            ? `${currentWord.kanji} ${
              showFurigana && currentWord.furigana
                ? "「" + currentWord.furigana + "」"
                : ""
            }`
            : currentWord.indonesia
          }
        </h3>

        <p className="flex items-center gap-2">
          {labels[lang].meaning}
          {feedback && (
            <span
              class={`font-semibold ${
                feedback.startsWith(labels[lang].correct) ? "text-green-400" : "text-red-400"
              }`}
            >
              {feedback}
            </span>
          )}
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Select "Answer" */}
        <div class="grid grid-cols-1 gap-4">
          {options.map((option, index) => (
            <button
              key={`${option.indonesia}-${index}`}
              onClick={() => handleAnswer(option)}
              class={`p-4 rounded-lg ${buttonBg} text-white text-2xl`}
              disabled={answered}
            >
              {quizMode === "jpToId"
                ? option.indonesia || "(kosong)"
                : `${option.kanji} ${
                  showFurigana && option.furigana
                    ? "「" + option.furigana + "」"
                    : ""
                }`}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div class="flex gap-3">
          {/* Give Up Button */}
          <button
            onClick={() => {
              Swal.fire({
                icon: "warning",
                title: labels[lang].quitConfirm,
                text: labels[lang].quitText,
                showCancelButton: true,
                confirmButtonText: labels[lang].yes,
                cancelButtonText: labels[lang].cancel,
                customClass: {
                  confirmButton:
                    "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded",
                  cancelButton:
                    "bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded ml-2",
                },
                buttonsStyling: false,
              }).then((result: { isConfirmed: any; }) => {
                if (result.isConfirmed) {
                  setIsFinished(true);
                }
              });
            }}
            class={`px-4 py-2 rounded ${
              theme === "dark"
                ? "bg-red-700 hover:bg-red-600"
                : "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            {labels[lang].quit}
          </button>

          {/* Furigana Toggle Button */}
          <button
            className={`px-4 py-2 rounded-md border ${
              showFurigana ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setShowFurigana((prev) => !prev)}
          >
            {showFurigana ? labels[lang].hideFuri : labels[lang].showFuri}
          </button>
        </div>
        
      </div>
    </div>
  );
}
