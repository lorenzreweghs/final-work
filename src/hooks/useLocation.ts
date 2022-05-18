import { getDatabase, ref, update } from "firebase/database";
import { app } from "../../config/firebase";

export default function useLocation() {
    const db = getDatabase(app);

    async function updateLocation(id: string, lng: number, lat: number) {
        try {
            await update(ref(db, 'users/' + id), {
                coords: { lng, lat },
            });
        } catch (e) {
            console.error(e);
        }
    }

    return {
        updateLocation,
    }
}