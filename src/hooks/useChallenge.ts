import { getDatabase, ref, update, get, child } from "firebase/database";
import { Timestamp } from "firebase/firestore";

import { app } from "../../config/firebase";
import { sortOnRecent } from "../helpers/helpers";

export interface ChallengeType {
    fromTeam: string,
    toTeam: string,
    dateTime: string,
    activity: string,
    theme: string,
    isConfirmed: boolean,
    isCancelled: boolean,
    createdAt: Timestamp,
}

export default function useChallenge() {
    const db = getDatabase(app);

    async function getAllChallenges(): Promise<Array<ChallengeType>> {
        let arr: Array<ChallengeType> = [];
        try {
            await get(child(ref(db), 'challenges/'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    arr = snapshot.val();
                    arr.sort(sortOnRecent);
                }
            })
        } catch (e) {
            console.error(e);
        }
        return arr;
    }

    async function updateChallenge(challengeArray: Array<ChallengeType>) {
        try {
            await update(ref(db, 'challenges/'), {
                ...challengeArray
            });
        } catch (e) {
            console.error(e);
        }
    }

    return {
        getAllChallenges,
        updateChallenge,
    };
}
