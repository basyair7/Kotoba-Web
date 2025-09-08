// deno-lint-ignore-file no-explicit-any
import * as dotenv from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

dotenv.config({ export: true });
const PROJECT_ID = Deno.env.get("PROJECT_ID");
const API_KEY = Deno.env.get("API_KEY");

const text = await Deno.readTextFile("./言葉ーデータベース.json");
const data = JSON.parse(text);

const lessons = data["kotoba-web"];

for (const [lessonId, words] of Object.entries(lessons)){
    for (const [wordId, word] of Object.entries(words as Record<string, any>)) {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/kotoba-web/${lessonId}/words?documentId=${wordId}&key=${API_KEY}`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fields: {
                    furigana: { stringValue: word.furigana },
                    indonesia: { stringValue: word.indonesia },
                    kanji: { stringValue: word.kanji },
                    romaji: { stringValue: word.romaji },
                    id: { stringValue: word.id },
                },
            }),
        });

        if (!res.ok) {
            console.error(`Error ${lessonId}/${wordId}:`, await res.text());
        } else {
            console.log (`${lessonId}/${wordId} success uploads`);
        }
    }
}