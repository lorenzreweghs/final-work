/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head';
import classNames from 'classnames';

import { Session } from '../../src/components/Session';
import { Flag } from '../../src/components/Flag';
import { Team } from '../../src/components/Team';
import { Share } from '../../src/components/Share';
import styles from '../../styles/Session.module.css';

export enum SessionSteps {
  Session,
  Flag,
  Team,
  Share,
}

const SessionPage: NextPage = () => {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(SessionSteps.Session);
  const [activeSession, setActiveSession] = useState("XXXXXX");

  useEffect(() => {
    if (!router.isReady) return;

    if (window && window.innerWidth > 600) router.push('/desktop');
  }, [router.isReady]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Festicon</title>
        <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.banner} onClick={() => router.push('/')} />

      {
        activeStep === SessionSteps.Session &&
        <Session setActiveStep={setActiveStep} setActiveSession={setActiveSession} />
      }

      {
        activeStep === SessionSteps.Flag &&
        <Flag setActiveStep={setActiveStep} activeSession={activeSession} />
      }

      {
        activeStep === SessionSteps.Team &&
        <Team setActiveStep={setActiveStep} activeSession={activeSession} />
      }

      {
        activeStep === SessionSteps.Share &&
        <Share activeSession={activeSession} />
      }

      <footer className={styles.pagination}>
        <span className={classNames({ [styles.activePage]: activeStep === SessionSteps.Session })} />
        <span className={classNames({ [styles.activePage]: activeStep === SessionSteps.Flag })} />
        <span className={classNames({ [styles.activePage]: activeStep === SessionSteps.Team })} />
        <span className={classNames({ [styles.activePage]: activeStep === SessionSteps.Share })} />
      </footer>
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();

export default SessionPage;
