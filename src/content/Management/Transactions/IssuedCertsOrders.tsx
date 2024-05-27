import { API_URL } from '@/constants/appConstants';
import GetCookie from '@/hooks/getCookie';
import { Card } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import IssuedCertsOrdersTable from './IssuedCertsOrdersTable';

function IssuedCertsOrders() {
  const [issuedCert, setIssuedCert] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = API_URL + '/Certificate/certificate-issued';
      // const payload = '"146d28b014f87920fa81c3b91007606d03ce0376c365befb5a3df1f7"';
      const payload = GetCookie('stakeId');
      const headers = {
        Accept: '*/*',
        'Content-Type': 'application/json'
      };

      const response = await axios.post(url, payload, { headers });
      setIssuedCert(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <IssuedCertsOrdersTable fetchData={fetchData} certificates={issuedCert} />
    </Card>
  );
}

export default IssuedCertsOrders;
