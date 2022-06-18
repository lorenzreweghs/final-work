import { getDatabase, ref, update, get, child } from "firebase/database";
import { Timestamp } from "firebase/firestore";

import { app } from "../../config/firebase";
import { sortOnLast } from "../helpers/helpers";

export interface ActivityType {
    sponsor: string,
    isCompleted: boolean,
    price: string,
    completedAt?: Timestamp,
}

export default function useProgress() {
    const db = getDatabase(app);

    async function getProgress(session: string | string[] | undefined): Promise<Array<ActivityType>> {
        let arr: Array<ActivityType> = [];
        try {
            await get(child(ref(db), 'activities/' + session))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    arr = snapshot.val();
                    arr.sort(sortOnLast);
                }
            })
        } catch (e) {
            console.error(e);
        }
        return arr;
    }

    async function updateProgress(session: string | string[] | undefined, progressArray: Array<ActivityType>) {
        try {
            await update(ref(db, 'activities/' + session), {
                ...progressArray
            });
        } catch (e) {
            console.error(e);
        }
    }

    return {
        getProgress,
        updateProgress,
    }
}