import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';
import Button from '@mui/material/Button';
import MUISkeleton from '@mui/material/Skeleton';
import { useMoralis } from 'react-moralis';
import detectEthereumProvider from '@metamask/detect-provider';

import styles from './Content.module.css';
import { useAppContext } from '../hooks';
import MetamaskLogo from '../../assets/metamask.png';

const Skeleton = () => (
  <>
    <MUISkeleton animation="wave" variant="rectangular" width={150} height={50} sx={{ mt: 4 }}/>
    <MUISkeleton animation="wave" variant="rectangular" width={300} height={40} sx={{ mt: 1 }}/>
  </>
)

const Content = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const { profile, setAuthenticated } = useAppContext();
  const { authenticate, isAuthenticated } = useMoralis();

  useEffect(() => {
    (async () => {
      const provider = await detectEthereumProvider();
      if (!provider) {
        setError('No Metamask! Please install it from: <a href="https://metamask.io/" target="_blank">https://metamask.io/</a>');
      } else if (provider !== window.ethereum) {
        setError('Do you have multiple wallets installed?');
      } else {
        setError('');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId === process.env.ETH_CHAIN_ID) {
          setAuthenticated(true);
        } else {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: process.env.ETH_CHAIN_ID }]
            });

            setAuthenticated(true);
          } catch (err) {
            console.error(err);
          }
        }
      }
    })();
  }, [isAuthenticated, setAuthenticated]);

  useEffect(() => profile?.name && setName(profile?.name), [profile]);

  return (
    <div className={styles.content}>
      {!isAuthenticated ? (
        <>
          <div className={styles.metamask}>
            <Image alt="Metamask Wallet login" src={MetamaskLogo} width={336} height={450} />
          </div>
          <div className={styles.metamask}>
            {error !== null && error !== '' ? (
              <h3 dangerouslySetInnerHTML={{ __html: error }} />
            ) : error === '' && (
              <Button variant="contained" onClick={authenticate}>Connect Wallet</Button>
            )}
          </div>
        </>
      ) : (
        <Box sx={{ ml: 20, pt: 10 }} className={styles.box}>
          {!name ? (
            <Skeleton />
          ) : (
            <>
              <h2>Hi, {name}!</h2>
              <h4 style={{ marginTop: '-15px' }}>Get started by messaging a friend.</h4>
            </>
          )}
        </Box>
      )}
    </div>
  )
}

export default Content;
