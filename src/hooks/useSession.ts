import { getDatabase, ref, update, get, child } from "firebase/database";
import { app } from "../../config/firebase";
import { sponsors, SponsorType } from "../../config/sponsors";
import useProgress, { ActivityType } from "./useProgress";

export enum MarkerTypes {
    markers = 'markers',
    flag = 'flag',
    tent = 'tent',
}

export default function useSession() {
    const db = getDatabase(app);
    const { getProgress } = useProgress();

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

    async function existSession(session: string | string[] | undefined): Promise<boolean> {
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

    async function getSession(userId: string): Promise<string> {
        let session = '';
        try {
            await get(child(ref(db), 'users/' + userId + '/session'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    session = snapshot.val();
                }
            })
        } catch (e) {
            console.error(e);
        }
        return session;
    }

    async function getUsersInSession(session: string | string[] | undefined): Promise<Array<{id: string, name: string}>> {
        let arr: Array<{id: string, name: string}> = [];
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

    async function addTeamName(name: string, session: string, teamArray: Array<{name: string, session: string, people: number}>) {
        try {
            await update(ref(db, 'sessions/' + session), {
                team: name,
            });
        } catch (e) {
            console.error(e);
        }

        try {
            await update(ref(db, 'teams/'), {
                ...teamArray
            });
        } catch (e) {
            console.error(e);
        }
    }

    const getSponsors = async (session: string | string[] | undefined) => {
        let sponsorArray: Array<ActivityType> = [];
        const currentProgress = await getProgress(session);
        if (currentProgress.length) {
            sponsorArray = currentProgress;
            return sponsorArray;
        }
        sponsors.forEach((sponsor: SponsorType) => {
            sponsorArray.push({
                sponsor: sponsor.id,
                isCompleted: false,
                price: sponsor.price,
            })
        });
        return sponsorArray;
    }

    async function updateSession(userId: string, userArray: Array<{id: string, name: string}>, teamArray: Array<{name: string, session: string, people: number}>, name: string, icon: string, color: string, session: string | string[] | undefined) {
        try {
            await update(ref(db, 'sessions/' + session), {
                users: userArray,
            });
        } catch (e) {
            console.error(e);
        }

        const sponsorArray = await getSponsors(session);
        try {
            await update(ref(db, 'activities/' + session), {
                ...sponsorArray
            });
        } catch (e) {
            console.error(e);
        }

        try {
            await update(ref(db, 'users/' + userId), {
                name,
                icon,
                color,
                session,
            });
        } catch (e) {
            console.error(e);
        }

        try {
            await update(ref(db, 'teams/'), {
                ...teamArray
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function removeSessionFromUser(userId: string, name: string, icon: string, color: string) {
        try {
            await update(ref(db, 'users/' + userId), {
                name,
                icon,
                color,
                session: null,
            });
        } catch (e) {
            console.error(e);
        }
    }

    return {
        hasSession,
        existSession,
        getSession,
        getUsersInSession,
        getMarkersInSession,
        updateUserStatus,
        getUserStatus,
        addTeamName,
        updateSession,
        removeSessionFromUser,
    }
}