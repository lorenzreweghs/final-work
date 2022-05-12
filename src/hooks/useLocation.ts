import { getDatabase, ref, set } from "firebase/database";
import { app } from "../../config/firebase";

export default function useLocation() {
    const db = getDatabase(app);

    async function updateLocation(id: string, name: string, lng: number, lat: number) {
        try {
            await set(ref(db, 'users/' + id), {
                name,
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