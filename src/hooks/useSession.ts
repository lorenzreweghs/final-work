import { getDatabase, ref, update, get, child } from "firebase/database";
import { app } from "../../config/firebase";

export default function useSession() {
    const db = getDatabase(app);

    async function hasSession(id: string): Promise<boolean> {
        let bool = false;
        try {
            await get(child(ref(db), `users/${id}/session`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    bool = true;
                }
            })
        } catch (e) {
            console.error(e);
        }
        return bool;
    }

    async function existSession(session: string): Promise<boolean> {
        let bool = false;
        try {
            await get(child(ref(db), `sessions/` + session))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    bool = true;
                }
            })
        } catch (e) {
            console.error(e);
        }
        return bool;
    }

    async function getUsersInSession(session: any): Promise<string[]> {
        let arr: string[] = [];
        try {
            await get(child(ref(db), `sessions/` + session))
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

    async function updateSession(userId: string, idArray: string[], name: string, session: string) {
        try {
            await update(ref(db, 'sessions/' + session), {
                ...idArray,
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
        existSession,
        getUsersInSession,
        updateSession,
    }
}