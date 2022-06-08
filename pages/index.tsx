/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0';

import logo from '../public/rock-werchter-2022_black.png';
import { Button, ButtonTypes } from '../src/components/Button';

import styles from '../styles/Login.module.css';

const Login: NextPage = () => {
  const { user, isLoading } = useUser();
  const [loggedIn, setLoggedIn] = useState(false);

  const [loadingSpinner, setLoadingSpinner] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (user) setLoggedIn(true);
  }, [isLoading]);

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
          {
            !isLoading ? 
              loggedIn ? 
                <div onClick={() => setLoadingSpinner(true)}>
                  <Button href='/session' text='Verdergaan' type={ButtonTypes.anchor} loadingSpinner={loadingSpinner} loadingText='Sessie voorbereiden' />
                </div> : 
                <a href='/api/auth/login?returnTo=%2Fsession' className={styles.login}>Inloggen</a> : 
              null
          }
        </div>
      </main>
    </div>
  );
}

export default Login;
