import { getDatabase, ref, update } from "firebase/database";
import { app } from "../../config/firebase";

export const db = getDatabase(app);

export default function useLocation() {
    async function updateLocation(id: string, lng: number, lat: number) {
        try {
            await update(ref(db, 'users/' + id), {
                coords: { lng, lat },
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function addMarker(session: string | string[] | undefined, coordsArray: Array<{lng: number, lat: number}>, isFlag: boolean = false, isTent: boolean = false) {
        if (isFlag) {
            try {
                await update(ref(db, 'sessions/' + session), {
                    flag: coordsArray,
                });
            } catch (e) {
                console.error(e);
            }
        } else if (isTent) {
            try {
                await update(ref(db, 'sessions/' + session), {
                    tent: coordsArray,
                });
            } catch (e) {
                console.error(e);
            }
        } else {
            try {
                await update(ref(db, 'sessions/' + session), {
                    markers: coordsArray,
                });
            } catch (e) {
                console.error(e);
            }
        }
    }

    return {
        updateLocation,
        addMarker,
    }
}