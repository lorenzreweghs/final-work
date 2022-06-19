import { UserProvider } from '@auth0/nextjs-auth0';

import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const setWindowHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
    }
    setWindowHeight();

    if (router.pathname !== '/session') {
      window.addEventListener('resize', setWindowHeight);
    }

    return () => {
      window.removeEventListener('resize', setWindowHeight);
    }    
  }, [router.isReady, router.pathname]);

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
