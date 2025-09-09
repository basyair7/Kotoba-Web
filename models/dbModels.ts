// models/dbModels.ts
// deno-lint-ignore-file no-explicit-any
import { Firebase, FirestoreDB, firebaseConfig_1 } from "../database/index.ts";
import { path_RBDB, path_Collection } from "../database/firebaseKeys/path.ts";

export class dbModelsRealtime {
  private static firebase: Firebase = new Firebase(firebaseConfig_1);

  static async getAll(): Promise<any> {
    try {
      return await dbModelsRealtime.firebase.dbGet(path_RBDB.kotoba_root);
    } catch (error) {
      console.error(`Error dbModelsRealtime-getAll: ${error}`);
      return null;
    }
  }

  static async getByBab(bab: string): Promise<any> {
    try {
      return await dbModelsRealtime.firebase.dbGet(`${path_RBDB.kotoba_root}/${bab}`);
    } catch (error) {
      console.error(`Error dbModelsRealtime-getByBab: ${error}`);
      return null;
    }
  }
}

export class dbModelsFirestore {
  private static firestore = new FirestoreDB(firebaseConfig_1);

  static async getAll(): Promise<any> {
    try {
      const words = await dbModelsFirestore.firestore.dbGetCollectionGroup(path_Collection.kotoba_root);
      const result: any = {};

      for (const w of words) {
        if (!result[w.parent]) result[w.parent] = {};
        result[w.parent][w.id] = {
          kanji: w.kanji,
          furigana: w.furigana,
          romaji: w.romaji,
          indonesia: w.indonesia,
        };
      }

      return result;
    } catch (error) {
      console.error(`Error dbModelsFirestore-getAll: ${error}`);
      return null;
    }
  }

  static async getByBab(bab: string): Promise<any> {
    try {
      return await dbModelsFirestore.firestore.dbGetDoc(path_Collection.kotoba_root, bab);
    } catch (error) {
      console.error(`Error dbModelsFirestore-getByBab: ${error}`);
      return null;
    }
  }
}
