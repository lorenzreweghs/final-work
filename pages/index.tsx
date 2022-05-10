/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { NextPage } from 'next';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0';

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Festicon</title>
        <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <a href="/api/auth/login">Login</a>
      <a href="/api/auth/logout">Logout</a>
      
      {user && (
        <div>
          <img src={user.picture!} alt={user.name!} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
}

export default Home;
