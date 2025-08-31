// deno-lint-ignore-file no-explicit-any
// database/firebase.ts
import { initializeApp } from "npm:firebase/app";
import { getDatabase, ref, get, set } from "npm:firebase/database";
import firebaseConfig from "./firebaseKeys/serviceAccount.ts";

export class Firebase {
    private _db: any;
    private _app: any;

    constructor() {
        this.initialize_app();
    }

    private initialize_app(): void {
        this._app = initializeApp({
            apiKey: firebaseConfig.apiKey,
            authDomain: firebaseConfig.authDomain,
            projectId: firebaseConfig.projectId,
            storageBucket: firebaseConfig.storageBucket,
            messagingSenderId: firebaseConfig.messagingSenderId,
            appId: firebaseConfig.appId,
            measurementId: firebaseConfig.measurementId,
            databaseURL: firebaseConfig.databaseURL,
        });
        this._db = getDatabase(this._app, firebaseConfig.databaseURL);
    }

    public async dbGet(_path: string): Promise<any> {
        let _return_val = null;
        try {
            const _dbRef = ref(this._db, _path);
            const _snapshot = await get(_dbRef);
            if (_snapshot.exists()) {
                _return_val = _snapshot.val();
            } else {
                // TODO (SKIP)   
            }
            return _return_val;

        } catch (error) {
            console.error("Error : ", error);
            return _return_val;
        }
    }

    public async dbSet(_path: string, _child: string, value: any): Promise<void> {
        const _dbRef = ref(this._db, `${_path}/${_child}`);
        await set(_dbRef, value);
    }
}