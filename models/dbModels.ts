// models/dbModels.ts
// deno-lint-ignore-file no-explicit-any
import { Firebase, firebaseConfig_1 } from "../database/index.ts";
import { path_db } from "../database/firebaseKeys/path.ts";

export default class dbModels {
  private static firebase: Firebase = new Firebase(firebaseConfig_1);

  static async getAll(): Promise<any> {
    try {
      const _data = await dbModels.firebase.dbGet(path_db.kotoba_root);
      return _data;
    } catch (error) {
      console.error(`Error : ${error}`);
      return null;
    }
  }

  static async getByBab(bab: string): Promise<any> {
    try {
      const _data = await dbModels.firebase.dbGet(`${path_db}/${bab}`);
      return _data;
    } catch (error) {
      console.error(`Error : ${error}`);
      return null;
    }
  }
}
