import { getDatabase, ref, update, get, child } from "firebase/database";
import { Timestamp } from "firebase/firestore";
import { app } from "../../config/firebase";

export default function useProgress() {
    const db = getDatabase(app);

    const sortActivities = (a: {sponsor: string, isCompleted: boolean, completedAt: Timestamp | null}, b: {sponsor: string, isCompleted: boolean, completedAt: Timestamp | null}) => {
        if (!a.completedAt && !b.completedAt) return 0;
        if (!a.completedAt && b.completedAt) return -1;
        if (a.completedAt && !b.completedAt) return 1;
        if (
            new Timestamp(a.completedAt!.seconds, a.completedAt!.nanoseconds)
              .toDate()
              .getTime() >
            new Timestamp(b.completedAt!.seconds, b.completedAt!.nanoseconds)
              .toDate()
              .getTime()
          ) {
            return -1;
          }
          if (
            new Timestamp(a.completedAt!.seconds, a.completedAt!.nanoseconds)
              .toDate()
              .getTime() <
            new Timestamp(b.completedAt!.seconds, b.completedAt!.nanoseconds)
              .toDate()
              .getTime()
          ) {
            return 1;
          }
        return 0;
    }

    async function getProgress(session: string | string[] | undefined): Promise<Array<{sponsor: string, isCompleted: boolean, completedAt: Timestamp | null}>> {
        let arr: Array<{sponsor: string, isCompleted: boolean, completedAt: Timestamp | null}> = [];
        try {
            await get(child(ref(db), 'activities/' + session))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    arr = snapshot.val();
                    arr.sort(sortActivities);
                }
            })
        } catch (e) {
            console.error(e);
        }
        return arr;
    }

    async function updateProgress(session: string | string[] | undefined, progressArray: Array<{sponsor: string, isCompleted: boolean, completedAt: Timestamp | null}>) {
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