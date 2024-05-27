import { API_URL } from '@/constants/appConstants';
import GetCookie from '@/hooks/getCookie';
import { Card } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ReceivedCertsOrdersTable from './ReceivedCertsOrdersTable';

function ReceivedCertsOrders() {
  const [receivedCerts, setReceivedCerts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = API_URL + '/Certificate/certificate-received';
      const payload = GetCookie('stakeId');
      const headers = {
        Accept: '*/*',
        'Content-Type': 'application/json'
      };

      const response = await axios.post(url, payload, { headers });
      setReceivedCerts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <ReceivedCertsOrdersTable
        fetchData={fetchData}
        certificates={receivedCerts}
      />
    </Card>
  );
}

export default ReceivedCertsOrders;
