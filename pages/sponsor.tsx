/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Swal from 'sweetalert2';

import logo from '../public/rock-werchter-2022.png';
import kbcLogo from '../public/sponsors/kbc-logo.png';

import styles from '../styles/Sponsor.module.css';

enum SponsorSteps {
    Identity,
    Team,
    Confirmation,
}

const Sponsor = () => {
    const [activeStep, setActiveStep] = useState(SponsorSteps.Identity);

    const [codeValue, setCodeValue] = useState('');
    const [teamValue, setTeamValue] = useState('');

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

    const handleTeamSubmit = (e: FormEvent) => {
        e.preventDefault();
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Festicon</title>
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
                        <input type='number' className={styles.codeInput} onChange={(e) => setCodeValue(e.target.value)} />
                        <input type='submit' className={styles.submitButton} />
                    </form>
                }

                {
                    activeStep === SponsorSteps.Team &&
                    <form className={styles.form} onSubmit={handleTeamSubmit}>
                        <p className={styles.subTitle}>Welk <span>team</span> heeft zonet uw activiteit <span>gewonnen</span>?</p>
                        <input type='number' className={styles.teamInput} onChange={(e) => setTeamValue(e.target.value)} />
                        <input type='submit' className={styles.submitButton} />
                    </form>
                }

                {
                    activeStep === SponsorSteps.Confirmation &&
                    <p className={styles.subTitle}></p>
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
