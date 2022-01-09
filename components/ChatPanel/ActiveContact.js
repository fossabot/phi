import { useCallback, useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import Chat from './Chat';
import Skeleton from './Skeleton';

import Utils from '../../utils';
import Thread from '../../utils/textile/thread';
import { useAppContext } from '../hooks';

const ActiveContact = () => {
  const [sent, setSent] = useState(false);
  const [accepted, setAccepted] = useState(-1);

  const { user } = useMoralis();
  const { profile, activeContact, activeContactProfile, setActiveContact, setContacts } = useAppContext();

  useEffect(() => setAccepted(-1), [activeContact]);
  useEffect(() => {
    if (activeContact) {
      const address = user.get('ethAddress');

      Utils.getInstance(Thread)
        .then(thread =>
          Promise.all([
            thread.ack(address).get(activeContact),
            thread.ack(address).get(address, activeContact),
            thread.invite(address).get(address, activeContact),
          ])
        )
        .then(([received, sent, invite]) => {
          if (received) {
            setSent(false);
            setAccepted(1);
          } else if (sent) {
            setSent(true);
            setAccepted(sent.accepted ? 1 : 3);
          } else {
            // No ack.
            // Check if user is the one who sent the request.
            setAccepted(invite ? 2 : 0);
          }
        });
    }
  }, [activeContact]);

  const accept = useCallback(() => {
    if (window.confirm('Are you sure you want to accept?')) {
      Utils.getInstance(Thread)
        .then(thread => thread.ack(user.get('ethAddress')).post(true, activeContact))
        .then(() => setAccepted(1));
    }
  }, [activeContact]);

  const reject = useCallback(() => {
    if (window.confirm('Are you sure you want to reject?')) {
      Utils.getInstance(Thread)
        .then(thread => thread.ack(user.get('ethAddress')).post(false, activeContact))
        .then(() => {
          // Delete this contact from setContacts;
          setContacts(_contacts => _contacts.filter(c => c !== activeContact));
          setActiveContact(null);
        });
    }
  }, [activeContact, setContacts, setActiveContact]);

  const getAccepted = (_accepted) => {
    switch (_accepted) {
      case 3:
        return 'has rejected your chat request';
      case 2:
        return 'hasnt yet seen your chat request';
      case 0:
        return 'has sent you a chat request';
    }
  }

  return (
    <>
      {accepted === -1 ? (
        <Grid item sx={{ mt: -5, pr: 11.75 }}>
          <Skeleton />
        </Grid>
      ) : accepted === 1 ? (
        <Grid
          item
          sx={{ mt: -10 }}
          style={{ position: 'relative', height: '100%' }}
        >
          <Chat sent={sent} />
        </Grid>
      ) : (
        <>
          <h2>Hi, {profile.name}!</h2>
          <h4 style={{ marginTop: '-15px' }}>
            <Tooltip arrow placement="bottom" title={activeContact}>
              <Button variant="text" color="info" size="large" sx={{ ml: '-10px' }}>
                <b style={{ fontSize: 21 }}>{activeContactProfile?.name}</b>
              </Button>
            </Tooltip>
            {getAccepted(accepted)}
          </h4>
          {accepted === 0 && (
            <Grid container spacing={3}>
              <Grid item xs="auto">
                <Button variant="contained" color="success" size="large" onClick={accept}>Accept</Button>
              </Grid>
              <Grid item xs="auto">
                <Button variant="outlined" color="error" size="large" onClick={reject}>Reject</Button>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </>
  )
}

export default ActiveContact;
