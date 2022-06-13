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

    async function getIcon(id: string): Promise<string> {
        let icon: string = '';
        try {
            await get(child(ref(db), `users/` + id + '/icon'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    icon = snapshot.val();
                }
            })
        } catch (e) {
            console.error(e);
        }
        return icon;
    }

    async function getColor(id: string): Promise<string> {
        let color: string = '';
        try {
            await get(child(ref(db), `users/` + id + '/color'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    color = snapshot.val();
                }
            })
        } catch (e) {
            console.error(e);
        }
        return color;
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
        getIcon,
        getColor,
        getTeams,
    }
}