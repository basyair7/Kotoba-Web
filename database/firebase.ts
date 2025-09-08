// deno-lint-ignore-file no-explicit-any
// database/firebase.ts
import { FirebaseApp, initializeApp } from "npm:firebase/app";
import { getDatabase, ref, get, set } from "npm:firebase/database";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    collectionGroup,
    getDocs,
} from "npm:firebase/firestore";

// base class
class FirebaseBase {
    protected _app: FirebaseApp;
    protected _config: any;

    constructor(firebaseConfig: any) {
        this._config = firebaseConfig;
        this._app = initializeApp(firebaseConfig);
    }
}

export class Firebase extends FirebaseBase {
    private _db: any;

    constructor(config: any) {
        super(config);
        this._db = getDatabase(this._app, config.databaseURL);
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

export class FirestoreDB extends FirebaseBase {
    private _db: any;

    constructor(config: any) {
        super(config);
        this._db = getFirestore(this._app);
    }

    public async dbGetDoc(collectionName: string, docId: string): Promise<any> {
        try {
            const _docRef = doc(this._db, collectionName, docId);
            const _docSnap = await getDoc(_docRef);
            if (_docSnap.exists()) {
                return _docSnap.data();
            } else return null;
        } catch (error) {
            console.error(`Error getDoc: ${error}`);
            return null;
        }
    }

    public async dbGetCollection(collectionName: any): Promise<any[]> {
        try {
            // console.log("Fetching collection:", collectionName); // debug
            const querySnapshot = await getDocs(collection(this._db, collectionName));
            console.log("Docs size:", querySnapshot.size);

            const data: any[] = [];
            querySnapshot.forEach((docSnap) => {
                // console.log("Doc ID:", docSnap.id, "Data:", docSnap.data()); // debug
                data.push({ id: docSnap.id, ...docSnap.data() });
            });
            return data;
        } catch (error) {
            console.error(`Error getCollection: ${error}`);
            return [];
        }
    }

    public async dbGetCollectionGroup(subColName: string): Promise<any[]> {
        try {
            // console.log("Fetching collectionGroup:", subColName);
            const querySnapshot = await getDocs(collectionGroup(this._db, subColName));
            const data: any[] = [];
            querySnapshot.forEach((docSnap) => {
                data.push({
                id: docSnap.id,
                parent: docSnap.ref.parent.parent?.id,
                ...docSnap.data(),
                });
            });
            return data;
        } catch (error) {
            console.error(`Error getCollectionGroup: ${error}`);
            return [];
        }
    }

    public async dbSetDoc(
        collectionName: string,
        docId: string,
        value: any,
    ): Promise<void> {
        try {
            await setDoc(doc(this._db, collectionName, docId), value);
        } catch (error) {
            console.error(`Error setDoc: ${error}`);
        }
    }
}