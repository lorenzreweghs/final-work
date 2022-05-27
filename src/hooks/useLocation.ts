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

    async function addMarker(session: string, coordsArray: Array<{lng: number, lat: number}>) {
        try {
            await update(ref(db, 'sessions/' + session), {
                markers: coordsArray,
            });
        } catch (e) {
            console.error(e);
        }
    }

    return {
        updateLocation,
        addMarker,
    }
}