/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { NextPage } from 'next';
import Head from 'next/head';

import logo from '../public/rock-werchter-2022.png';
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

      <main className={styles.imageMain}>
        <h1 className={styles.title}>Festicon</h1>
        <img className={styles.logo} src={logo.src} alt='rock werchter logo' width='100%' height='auto' />        

        <div className={styles.subTitleDiv}>
          <p className={styles.subTitle}><span>Connecteer</span> met je vrienden</p>
          <p className={styles.subTitle}>Daag <span>festivalgangers</span> uit</p>
          <p className={styles.subTitle}>Win leuke <span>prijzen</span></p>          
        </div>

        <div className={styles.button}>
          <Button href='/session' text='Verdergaan' />
          <a href='/api/auth/logout'>Logout</a>
        </div>        
      </main>
    </div>
  );
}

export default Login;
