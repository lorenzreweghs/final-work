import { getDatabase, ref, update, get, child } from "firebase/database";
import { app } from "../../config/firebase";

export default function useSession() {
    const db = getDatabase(app);

    async function hasSession(id: string): Promise<boolean> {
        try {
            await get(child(ref(db), `users/${id}/session`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    return true;
                }
                return false;
            })
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    async function updateSession(userId: string, idArray: string[], name: string, session: string) {
        try {
            await update(ref(db, 'sessions/' + session), {
                idArray,
            });
        } catch (e) {
            console.error(e);
        }

        try {
            await update(ref(db, 'users/' + userId), {
                name,
                session,
            });
        } catch (e) {
            console.error(e);
        }
    }

    return {
        hasSession,
        updateSession,
    }
}