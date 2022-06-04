import { getDatabase, ref, update, get, child } from "firebase/database";
import { app } from "../../config/firebase";

export default function useOtherUser() {
    const db = getDatabase(app);

    async function getUserName(id: string): Promise<string> {
        let name: string = '';
        try {
            await get(child(ref(db), `users/` + id + '/name'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    name = snapshot.val();
                }
            })
        } catch (e) {
            console.error(e);
        }
        return name;
    }

    async function getTeams(): Promise<Array<{name: string, session: string, people: number}>> {
        let arr: Array<{name: string, session: string, people: number}> = [];
        try {
            await get(child(ref(db), 'teams/'))
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

    return {
        getUserName,
        getTeams,
    }
}