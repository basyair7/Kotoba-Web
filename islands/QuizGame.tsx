// deno-lint-ignore-file
// routes/QuizGame.tsx
import { useEffect, useState, useRef } from "preact/hooks";
import dbModels from "../models/dbModels.ts";

interface Word {
  indonesia: string; // インドネシア語
  kanji: string; // 漢字/言葉
  furigana: string; // ふりがな
  dai: string; // だい
}

interface QuizGameProps {
  theme?: "light" | "dark";
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

export default function QuizGame({ theme = "light" }: QuizGameProps) {
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

    const filtered =
      selectedDai === "all"
        ? allWords
        : allWords.filter((w) => w.dai === selectedDai);

    resetQuiz(filtered);
  }, [selectedDai, allWords]);

  async function fetchWords(savedProgress?: string | null) {
    const allData = await dbModels.getAll();
    const parsed: Word[] = [];
    const dais: Set<string> = new Set();

    Object.entries(allData).forEach(([dai, items]) => {
      dais.add(dai);
      Object.entries(items as Record<string, any>).forEach(
        ([indonesia, value]) => {
          parsed.push({
            kanji: value?.kanji ?? "???",
            furigana: value?.furigana ?? "",
            indonesia: value?.indonesia ?? "(belum ada terjemahan)",
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
      setFeedback("正解! 🎉");
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

      setFeedback(
        quizMode === "jpToId"
          ? `不正解！ 正しい答え: ${correctWord.indonesia}`
          : `不正解！ 正しい答え: ${correctWord.kanji}${
            showFurigana && correctWord.furigana
              ? "「" + correctWord.furigana + "」"
              : ""
          }`,
      );
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
      <div class="min-h-screen flex justify-center p-4">読み込み中...</div>
    );
  }
  if (words.length === 0) {
    return (
      <div class="min-h-screen flex justify-center p-4">データがありません。</div>
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
        <h1 class="text-2xl font-bold mb-4">結果</h1>
        <h2 class="text-xl font-semibold mb-4">お疲れ様でした！</h2>
        <h2 class="mb-2 text-lg">あなたのスコア:</h2>
        <p class="text-3xl font-extrabold mb-4">{percent}%</p>
        <p class="mb-2">選択しただい: {selectedDai}</p>
        <p class="mb-2">全{words.length}問中</p>
        <p class="mb-2">正解数: {correctCount}</p>
        <p class="mb-4">不正解数: {wrongCount}</p>

        {wrongAnswers.length > 0
          ? (
            <div class="mt-4">
              <h2 class="text-xl font-semibold mb-2">復習しましょう ✍️</h2>
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
                        <strong>問題:</strong> {questionDisplay}
                      </p>
                      <p class="text-red-600">あなたの答え: {yourAnswerDisplay}</p>
                      <p class="text-green-600">正しい答え: {correctAnswerDisplay}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
          : (
            <p class="mt-4 text-green-400 font-bold">全部正解！素晴らしい！ 🎉</p>
          )}

        {/* Action Buttons */}
        <div class="mt-6 flex gap-3">
          {/* もう一度プレイ Button */}
          <button
            onClick={() => resetQuiz(words)}
            class={`px-4 py-2 rounded ${buttonBg} text-white`}
          >
            もう一度プレイ
          </button>

          {/* Furigana Toggle Button */}
          <button
            className={`px-4 py-2 rounded-md border transition ${
              showFurigana
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
            onClick={() => setShowFurigana((prev) => !prev)}
          >
            {showFurigana ? "ふりがなを隠す" : "ふりがなを表示する"}
          </button>
        </div>
      </div>
    );
  }

  // --- Quiz main screen ---
  return (
    <div
      class={`p-6 max-w-xl mx-auto ${bgColor} ${textColor} rounded-lg shadow-md`}
    >
      <h1 class="text-2xl font-bold mb-4">言葉を当てる</h1>

      {/* Filter だい + mode switch + furigana toggle */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={selectedDai}
          onChange={handleDaiChange}
          class={`p-2 border rounded ${
            theme === "dark" ? "bg-gray-700 text-white border-gray-600" : ""
          }`}
        >
          <option value="all">全部</option>
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
          <option value="jpToId">日本語 → インドネシア語</option>
          <option value="idToJp">インドネシア語 → 日本語</option>
        </select>

        {/* Checkbox furigana (removed) */}
      </div>

      <p class="mb-2">問題 {currentIndex + 1} / 全{words.length}問</p>
      <p class="mb-4 font-semibold">正解: {correctCount} | 不正解: {wrongCount}</p>

      {/* 質問 */}
      <div class="mb-4">
        <h3 class="text-2xl font-bold mb-2">
          {quizMode === "jpToId"
            ? `${currentWord.kanji} ${
              showFurigana && currentWord.furigana
                ? "「" + currentWord.furigana + "」"
                : ""
            }`
            : currentWord.indonesia}
        </h3>

        <p className="flex items-center gap-2">
          {quizMode === "jpToId" ? "Artinya?" : "意味は？"}
          {feedback && (
            <span
              class={`font-semibold ${
                feedback.startsWith("正解") ? "text-green-400" : "text-red-400"
              }`}
            >
              {feedback}
            </span>
          )}
        </p>
      </div>

      {/* Select "Answer" */}
      <div class="grid grid-cols-1 gap-4">
        {options.map((option, index) => (
          <button
            key={`${option.indonesia}-${index}`}
            onClick={() => handleAnswer(option)}
            class={`p-4 rounded-lg ${buttonBg} text-white`}
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
      <div class="mt-6 flex gap-3">
        {/* Give Up Button */}
        <button
          onClick={() => setIsFinished(true)}
          class={`px-4 py-2 rounded ${
            theme === "dark"
              ? "bg-red-700 hover:bg-red-600"
              : "bg-red-500 hover:bg-red-600"
          } text-white`}
        >
          やめる
        </button>

        {/* Furigana Toggle Button */}
        <button
          className={`px-4 py-2 rounded-md border ${
            showFurigana ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
          onClick={() => setShowFurigana((prev) => !prev)}
        >
          {showFurigana ? "ふりがなを隠す" : "ふりがなを表示する"}
        </button>
      </div>
    </div>
  );
}
