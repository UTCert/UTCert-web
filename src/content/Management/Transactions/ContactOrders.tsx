import { API_URL } from '@/constants/appConstants';
import GetCookie from '@/hooks/getCookie';
import { Card } from '@mui/material';
import axios from 'axios';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import ContactsOrdersTable from './ContactsOrdersTable';

function ContactOrders() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = API_URL + '/Contact';
      const payload = GetCookie('stakeId');
      const headers = {
        Accept: '*/*',
        'Content-Type': 'application/json'
      };

      const response = await axios.post(url, payload, { headers });
      setContacts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <ContactsOrdersTable fetchData={fetchData} contactOrders={contacts} />
      <SnackbarProvider
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Card>
  );
}

export default ContactOrders;
