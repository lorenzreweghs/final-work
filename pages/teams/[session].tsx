import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';

import useSession from '../../src/hooks/useSession';
import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';

import styles from '../../styles/Teams.module.css';

const Teams = () => {
    const { user, isLoading } = useUser();

    const router = useRouter();

    const { getUsersInSession } = useSession();

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('');
    const [navIsOpen, setNavIsOpen] = useState(false);

    const userList = useRef<string[]>([]);

    useEffect(() => {
        if (!router.isReady || isLoading) return;
        const { session } = router.query;
        setActiveSession(session);
        
        const checkSession = async () => {
            userList.current = await getUsersInSession(session);
            if (!userList.current.includes(user?.sub!)) router.push('/');
        }
        checkSession();
    }, [router.isReady, isLoading]);

    return (
        <div className={styles.container}>
            <Navigation activeSession={activeSession} setIsOpen={setNavIsOpen} isOpen={navIsOpen} />
            <div className={styles.menu} onClick={() => setNavIsOpen(true)}>
                <Action type={ActionTypes.menu} />
            </div>
        </div>
    );
}

export const getServerSideProps = withPageAuthRequired();

export default Teams;
