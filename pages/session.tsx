/* eslint-disable @next/next/no-img-element */
import { FormEvent, FormEventHandler } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router'
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { generate } from 'generate-password';
import Head from 'next/head';
import { Piano, SportsBasketball, SportsSoccer, SportsEsports, SportsBar, Agriculture } from '@mui/icons-material';

import useSession from '../src/hooks/useSession';
import logo from '../public/werchter-logo-black.png';
import { Action, ActionTypes } from '../src/components/Action';

import styles from '../styles/Session.module.css';

const Session: NextPage = () => {
  const { user } = useUser();
  const { existSession, updateSession, getUsersInSession } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const session = generate({
      length: 6,
      numbers: true,
      lowercase: false,
    });
    await updateSession(user?.sub!, [user?.sub!], user?.name!, session);
    router.push('/map');
  }

  const handleChange = async (e: any) => {
    const session = e.target.value;
    const sessionExists = await existSession(session);
    if (sessionExists) {
      const users = await getUsersInSession(session);
      const userArray = users.includes(user?.sub!) ? [...users] : [...users, user?.sub!] 
      await updateSession(user?.sub!, userArray, user?.name!, session);
      router.push('/map');
    } 
  }

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
        <div className={styles.iconDiv}>
          <div className={styles.icon}>
            <Action type={ActionTypes.gather} />
            <p>Verzamelen</p>
          </div>
          <div className={styles.icon}>
            <Action type={ActionTypes.tent} />
            <p>Find My Tent</p>
          </div>
          <div className={styles.icon}>
            <Action type={ActionTypes.pinpoint} />
            <p>Point Of Interest</p>
          </div>   
        </div>

        <h1 className={styles.title}>Win <span>drankbonnen</span> voor de hele groep!</h1>
        <p className={styles.subTitle}>Wanneer je samen met je groep bij een <span>activiteit</span> arriveert, kan je een ander team <span>uitdagen</span>.</p>
        <p className={styles.subTitle}><span>Win</span> de activiteit om het logo te verdienen!</p>
        <p className={styles.subTitle}><span>Verzamel</span> logo&apos;s in ruil voor drankbonnen.</p>

        <form className={styles.iconForm} onSubmit={handleSubmit}>
          <p className={styles.iconTitle}>Kies je <span>persoonlijk</span> icoontje*</p>

          <div className={styles.icons}>
            <input type="radio" id="beer" name="icon" value="beer" defaultChecked />
            <label htmlFor="beer">
              <SportsBar fontSize='large' />
            </label>

            <input type="radio" id="basketball" name="icon" value="basketball" />
            <label htmlFor="basketball">
              <SportsBasketball fontSize='large' />
            </label>

            <input type="radio" id="soccer" name="icon" value="soccer" />
            <label htmlFor="soccer">
              <SportsSoccer fontSize='large' />
            </label>

            <input type="radio" id="gaming" name="icon" value="gaming" />
            <label htmlFor="gaming">
              <SportsEsports fontSize='large' />
            </label>

            <input type="radio" id="piano" name="icon" value="piano" />
            <label htmlFor="piano">
              <Piano fontSize='large' />
            </label>

            <input type="radio" id="tractor" name="icon" value="tractor" />
            <label htmlFor="tractor">
              <Agriculture fontSize='large' />
            </label>            
          </div>

          <div className={styles.codeDiv}>
            <p>CODE</p>
            <input type='text' className={styles.codeSubmit} placeholder='_ _ _ _ _ _' minLength={6} maxLength={6} onChange={handleChange} />
          </div>
          <p className={styles.or}>of</p>
          <input type='submit' className={styles.newSession} value='Start nieuwe sessie' />
        </form>
      </main>
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();

export default Session;
