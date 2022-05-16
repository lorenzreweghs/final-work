/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Head from 'next/head';

import logo from '../public/werchter-logo-black.png';
import { Button } from '../src/components/Button';

import styles from '../styles/Session.module.css';

const Session: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Festicon</title>
        <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.logoHeader}>
        <h1 className={styles.logoTitle}>Festicon</h1>
        <h1 className={styles.logoX}>X</h1>
        <img className={styles.logo} src={logo.src} alt='rock werchter logo' width='100%' height='auto' />
      </header>

      <main>
        <h1 className={styles.title}>Win <span>drankbonnen</span> voor de hele groep!</h1>
        <p className={styles.subTitle}>Wanneer je samen met je groep bij een <span>activiteit</span> arriveert, kan je een ander team <span>uitdagen</span>.</p>
        <p className={styles.subTitle}><span>Win</span> de activiteit om het logo te verdienen!</p>
        <p className={styles.subTitle}><span>Verzamel</span> logo&apos;s in ruil voor drankbonnen.</p>
      </main>
    </div>
  );
}

export default Session;
