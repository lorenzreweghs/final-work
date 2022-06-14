import { getDatabase, ref, update, get, child } from "firebase/database";
import { app } from "../../config/firebase";

export interface ChallengeType {
    fromTeam: string,
    toTeam: string,
    dateTime: string,
    activity: string,
    isConfirmed: boolean,
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
                }
            })
        } catch (e) {
            console.error(e);
        }
        return arr;
    }

    async function getChallenge(session: string | string[] | undefined): Promise<ChallengeType> {
        let obj: ChallengeType = {
            fromTeam: '',
            toTeam: '',
            dateTime: '',
            activity: '',
            isConfirmed: false,
        };
        try {
            await get(child(ref(db), 'challenges/' + session))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    obj = snapshot.val();
                }
            })
        } catch (e) {
            console.error(e);
        }
        return obj;
    }

    async function updateChallenge(session: string | string[] | undefined, { fromTeam, toTeam, dateTime, activity, isConfirmed }: ChallengeType) {
        try {
            await update(ref(db, 'challenges/' + session), {
                fromTeam,
                toTeam,
                dateTime,
                activity,
                isConfirmed,
            });
        } catch (e) {
            console.error(e);
        }
    }

    return {
        getAllChallenges,
        getChallenge,
        updateChallenge,
    };
}
