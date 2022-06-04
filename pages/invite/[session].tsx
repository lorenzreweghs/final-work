/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';
import logo from '../../public/rock-werchter-2022_black.png';

import styles from '../../styles/Invite.module.css';

const Invite = () => {
    const router = useRouter();

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('');
    const [navIsOpen, setNavIsOpen] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        const { session } = router.query;
        setActiveSession(session);
    }, [router.isReady]);

    return (
        <div className={styles.container}>
            <div className={styles.logoDiv}>
               <img className={styles.logo} src={logo.src} alt='rock werchter logo' width='100%' height='auto' /> 
            </div>

            <h1 className={styles.title}>Nodig je<br /><span>vrienden</span><br /> uit</h1>
            <p className={styles.subTitle}>en geniet samen van je favoriete festival</p>

            <Navigation activeSession={activeSession} setIsOpen={setNavIsOpen} isOpen={navIsOpen} />
            <div className={styles.menu} onClick={() => setNavIsOpen(true)}>
                <Action type={ActionTypes.menu} />
            </div>
        </div>
    );
}

export default Invite;
