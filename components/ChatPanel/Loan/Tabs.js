import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import MUITabs from '@mui/material/Tabs';
import MUITab from '@mui/material/Tab';

import Table from './Table';

import styles from './Tabs.module.css';
import Utils from '../../../utils';
import Thread from '../../../utils/textile/thread';

const Tabs = ({ loans }) => {
  const [value, setValue] = useState(0);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    (async () => {
      const thread = await Utils.getInstance(Thread);
      const me = await thread.invite()._address;

      setSent(loans.filter(loan => loan?.from === me));
      setReceived(loans.filter(loan => loan?.to === me));
    })();
  }, [loans]);

  const onChange = (e, newValue) => setValue(newValue);

  return (
    <>
      <MUITabs value={value} onChange={onChange} className={styles.tabs}>
        <MUITab label="Received" />
        <MUITab label="Sent" />
      </MUITabs>
      <TabPanel value={value} index={0}>
        <Table rows={received} sent={false} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Table rows={sent} sent={true} />
      </TabPanel>
    </>
  )
}

const TabPanel = ({ value, index, children }) => (
  <div role="tabpanel" hidden={value !== index}>
    <Box sx={{ pt: 3, pr: 6 }}>
      {children}
    </Box>
  </div>
)


export default Tabs;
