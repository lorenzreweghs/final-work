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

    return {
        getUserName,
    }
}