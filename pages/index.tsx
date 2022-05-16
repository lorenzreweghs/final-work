/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { NextPage } from 'next';
import Head from 'next/head';

import logo from '../public/werchter-logo-white.png';
import { Button } from '../src/components/Button';

import styles from '../styles/Login.module.css';

const Login: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Festicon</title>
        <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.imageHeader}>
        <h1>Festicon</h1>
        <img className={styles.logo} src={logo.src} alt='rock werchter logo' width='100%' height='auto' />
      </header>

      <main>
        <h1 className={styles.title}><span>Festicon</span> is een uniek concept in <span>samenwerking</span> met jouw favoriete <span>festival</span>.</h1>
        <p className={styles.subTitle}><span>Ontdek</span> het festivalterrein met vrienden</p>
        <p className={styles.subTitle}>Mis niemand van je <span>favoriete artiesten</span></p>
        <p className={styles.subTitle}>Leer <span>nieuwe mensen</span> kennen</p>

        <div className={styles.button}>
          <Button href='/map' text='Verdergaan' />
          <a href='/api/auth/logout'>Logout</a>
        </div>        
      </main>
    </div>
  );
}

export default Login;
