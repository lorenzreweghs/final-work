/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Facebook, Link } from '@mui/icons-material';
import Swal from 'sweetalert2';

import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';
import logo from '../../public/rock-werchter-2022_black.png';

import styles from '../../styles/Invite.module.css';

declare const FB: any;

const Invite = () => {
    const router = useRouter();

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('');
    const [navIsOpen, setNavIsOpen] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        const { session } = router.query;
        setActiveSession(session);
    }, [router.isReady]);

    useEffect(() => {
        // BRON: https://stackoverflow.com/questions/68857535/how-can-i-use-facebook-sdk-in-react
        // Auteur 'andyrandy', geplaatst op 20/08/2021 en geraadpleegd op 04/06/2022
        (window as any).fbAsyncInit = () => {
            (window as any).FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v14.0'
            });
        };
        (function (d, s, id) {
            let js: any, fjs: any = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode!.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleInvite = () => {
        FB.ui({
            method: 'share',
            href: `https://rock-werchter.festicon.eu/session/${activeSession}`,
            hashtag: `#${activeSession}`,
        }, () => {});
    }

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(`https://rock-werchter.festicon.eu/session/${activeSession}`);
            Swal.fire({
                title: 'Link gekopiëerd',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
            });
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.logoDiv}>
               <img className={styles.logo} src={logo.src} alt='rock werchter logo' width='100%' height='auto' /> 
            </div>

            <h1 className={styles.title}>Nodig je<br /><span>vrienden</span><br /> uit</h1>
            <p className={styles.subTitle}>en geniet samen van je favoriete festival</p>

            <div className={styles.facebookDiv}>
                <button className={styles.facebook} onClick={handleInvite}>
                    <Facebook fontSize='large' />
                    <p>Delen via Facebook</p>
                </button>
            </div>

            <div className={styles.copyDiv}>
                <button className={styles.copy} onClick={handleCopy}>
                    <Link fontSize='large' />
                    <p>Link kopiëren</p>
                </button>
            </div>

            <Navigation activeSession={activeSession} setIsOpen={setNavIsOpen} isOpen={navIsOpen} />
            <div className={styles.menu} onClick={() => setNavIsOpen(true)}>
                <Action type={ActionTypes.menu} />
            </div>
        </div>
    );
}

export default Invite;
