import { FreshContext } from "$fresh/server.ts";

// プログラマージョーク (日本語版)
const JOKES = [
  "なぜJava開発者はよくメガネをかけているの？ C#（シーシャープ）が見えないから。",
  "SQLクエリがバーに入って、二つのテーブルに近づいて言った：「JOINしてもいい？」",
  "フォレスト・ガンプのパスワードを解読するのは簡単だった。「1forrest1」だった。",
  "F5キーを押すのが大好き。リフレッシュするからね。",
  "ITサポートに電話したら、オーストラリアの人がネット接続を直しに来た。だから聞いたんだ：「LANダウンアンダーから来たんですか？」",
  "この世には10種類の人間がいる。2進数を理解している人と、理解していない人。",
  "なぜアセンブリ言語のプログラマーはよく濡れているの？ Cレベルより下で働いているから。",
  "僕のお気に入りのコンピュータ系バンドは「ブラック IPs」だ。",
  "元アメリカ大統領候補の音楽の好みを予測するプログラムは？ 「アル・ゴリズム（Al Gore Rhythm）」だよ。",
  "SEOの専門家がバーに入った。いや、パブ、宿屋、酒場、飲み屋…検索用に全部。",
];

export const handler = (_req: Request, _ctx: FreshContext): Response => {
  const randomIndex = Math.floor(Math.random() * JOKES.length);
  const body = JOKES[randomIndex];
  return new Response(body);
};
