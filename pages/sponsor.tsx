/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import Head from 'next/head';
import Swal from 'sweetalert2';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import useProgress from '../src/hooks/useProgress';
import useOtherUser from '../src/hooks/useOtherUser';
import logo from '../public/rock-werchter-2022.png';
import kbcLogo from '../public/sponsors/kbc-logo.png';

import styles from '../styles/Sponsor.module.css';

enum SponsorSteps {
    Identity,
    Team,
    Confirmation,
}

const Sponsor = () => {
    const { getTeams } = useOtherUser();
    const { getProgress, updateProgress } = useProgress();
    const router = useRouter();

    const [activeStep, setActiveStep] = useState(SponsorSteps.Identity);

    const [codeValue, setCodeValue] = useState('');
    const [teamValue, setTeamValue] = useState('');

    useEffect(() => {
        if (!router.isReady) return;

        if (window && window.innerWidth > 600) router.push('/desktop');
      }, [router.isReady]);

    const handleCodeSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (codeValue === process.env.NEXT_PUBLIC_SPONSOR_ID) {
            setActiveStep(SponsorSteps.Team);
            return;
        } 
        Swal.fire({
            title: 'Foutieve code',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
        });
    }

    const handleTeamSubmit = async (e: FormEvent) => {
        e.preventDefault();

        let hasMatch = false;
        const teams = await getTeams();
        teams.forEach(async (team, index) => {
            if (teamValue.toLowerCase() === team.name.toLowerCase()) {
                hasMatch = true;
                const currentProgress = await getProgress(team.session);
                currentProgress.shift();
                await updateProgress(
                    team.session, 
                    [{    
                        sponsor: 'kbc',
                        isCompleted: true,
                        price: 'frisbee',
                        completedAt: Timestamp.now(),
                    }, ...currentProgress]);
                setActiveStep(SponsorSteps.Confirmation);
            }
            if (!hasMatch && index + 1 === teams.length) {
                Swal.fire({
                    title: 'Team niet gevonden',
                    icon: 'error',
                    timer: 2500,
                    timerProgressBar: true,
                });
            }
        });
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Festicon - Sponsors</title>
                <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.imageMain}>
                <h1 className={styles.title}>Festicon</h1>
                <img className={styles.logo} src={logo.src} alt='rock werchter logo' width='100%' height='auto' />

                {
                    activeStep === SponsorSteps.Identity &&
                    <form className={styles.form} onSubmit={handleCodeSubmit}>
                        <p className={styles.subTitle}>Geef hier uw persoonlijke <span>code</span> in</p>
                        <input type='number' className={styles.codeInput} onChange={(e) => setCodeValue(e.target.value)} minLength={4} maxLength={4} placeholder='____' autoFocus />
                        <input type='submit' className={styles.submitButton} value='Bevestigen' />
                    </form>
                }

                {
                    activeStep === SponsorSteps.Team &&
                    <form className={styles.form} onSubmit={handleTeamSubmit}>
                        <p className={styles.subTitle}>Welk <span>team</span> heeft zonet uw activiteit <span>gewonnen</span>?</p>
                        <input type='text' className={styles.teamInput} onChange={(e) => setTeamValue(e.target.value)} autoFocus />
                        <input type='submit' className={styles.submitButton} value='Bevestigen' />
                    </form>
                }

                {
                    activeStep === SponsorSteps.Confirmation &&
                    <p className={classNames(styles.subTitle, styles.confirmation)}>
                        Bedankt! De overwinning van &apos;<span>{teamValue}</span>&apos; is succesvol <span>geregistreerd</span>.
                    </p>
                }

                {
                    activeStep !== SponsorSteps.Identity &&
                    <img className={styles.sponsorLogo} src={kbcLogo.src} alt='kbc sponsor logo' width='100%' height='auto' />
                }
            </main>
        </div>
    );
}

export default Sponsor;
