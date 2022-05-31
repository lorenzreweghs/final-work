import { getDatabase, ref, update, get, child } from "firebase/database";
import { app } from "../../config/firebase";

export enum MarkerTypes {
    markers = 'markers',
    flag = 'flag',
    tent = 'tent',
}

export default function useSession() {
    const db = getDatabase(app);

    async function hasSession(userId: string): Promise<boolean> {
        let bool = false;
        try {
            await get(child(ref(db), 'users/' + userId + '/session'))
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

    async function getUsersInSession(session: string | string[] | undefined): Promise<string[]> {
        let arr: string[] = [];
        try {
            await get(child(ref(db), `sessions/` + session + '/users'))
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

    async function getMarkersInSession(session: string | string[] | undefined, type: string = MarkerTypes.markers): Promise<Array<{lng: number, lat: number}>> {
        let arr: Array<{lng: number, lat: number}> = [];
        try {
            await get(child(ref(db), `sessions/` + session + '/' + type))
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

    async function updateUserStatus(userId: string, online: boolean) {
        try {
            await update(ref(db, 'users/' + userId), {
                online,
            });
        } catch (e) {
            console.error(e);
        }       
    }

    async function getUserStatus(userId: string): Promise<boolean> {
        let bool = false;
        try {
            await get(child(ref(db), 'users/' + userId + '/online'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    bool = snapshot.val();
                }
            })
        } catch (e) {
            console.error(e);
        }
        return bool;
    }

    async function addTeamName(name: string, session: string) {
        try {
            await update(ref(db, 'sessions/' + session), {
                team: name,
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function updateSession(userId: string, idArray: string[], name: string, icon: string, session: string) {
        try {
            await update(ref(db, 'sessions/' + session), {
                users: idArray,
            });
        } catch (e) {
            console.error(e);
        }

        try {
            await update(ref(db, 'users/' + userId), {
                name,
                icon,
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
        getMarkersInSession,
        updateUserStatus,
        getUserStatus,
        addTeamName,
        updateSession,
    }
}