/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import type { NextPage } from 'next';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head';

import logo from '../public/rock-werchter-2022.png';

import styles from '../styles/Session.module.css';
import { Session } from '../src/components/Session';
import { Flag } from '../src/components/Flag';

export enum SessionSteps {
  Session,
  Flag,
  Team,
  Code,
}

const SessionPage: NextPage = () => {
  const [activeStep, setActiveStep] = useState(SessionSteps.Flag);

  return (
    <div className={styles.container}>
      <Head>
        <title>Festicon</title>
        <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.logoHeader}>
        <img className={styles.logo} src={logo.src} alt='rock werchter logo' width='100%' height='auto' />
      </header>

      {
        activeStep === SessionSteps.Session &&
        <Session setActiveStep={setActiveStep} />
      }

      {
        activeStep === SessionSteps.Flag &&
        <Flag setActiveStep={setActiveStep} />
      }
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();

export default SessionPage;
