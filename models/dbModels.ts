// models/dbModels.ts
// deno-lint-ignore-file no-explicit-any
import { Firebase } from "../database/index.ts";
import { path_db } from "../database/firebaseKeys/path.ts";

export default class dbModels {
  static async getAll(): Promise<any> {
    try {
      const firebase = new Firebase();
      const _data = await firebase.dbGet(path_db.root);
      return _data;
    } catch (error) {
      console.error(`Error : ${error}`);
      return null;
    }
  }

  static async getByBab(bab: string): Promise<any> {
    try {
      const firebase = new Firebase();
      const _data = await firebase.dbGet(`${path_db}/${bab}`);
      return _data;
    } catch (error) {
      console.error(`Error : ${error}`);
      return null;
    }
  }
}
