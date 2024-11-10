import { useEffect, useState } from 'react';
import GetCookie from '@/hooks/getCookie';
import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import Footer from '@/components/Footer';
import { Grid, Container, Skeleton } from '@mui/material';
import ProfileCover from '@/content/Management/Users/details/ProfileCover';
import RecentActivity from '@/content/Management/Users/details/RecentActivity';
import { useStore } from '@/contexts/GlobalContext';
import axios from 'axios';

function ManagementUserProfile() {
	const { user } = useStore();
	const [isLoading, setIsLoading] = useState(true);
	const [accountWallet, setAccountWallet] = useState(null);
	
	useEffect(() => {
    const fetchAccountInfo = async () => {
      const BLOCKFROST_API = 'https://cardano-preprod.blockfrost.io/api/v0';
      const BLOCKFROST_PROJECT_ID = 'preproddZ8hPQ8b90t4TcBfnnnx7CPIJ4omEG1H';
      try {
        const stakeId = GetCookie("stakeId");
        const blockfrostHeaders = {
          'Content-Type': 'application/json',
          'project_id': BLOCKFROST_PROJECT_ID
        };
  
        const response = await axios.get(`${BLOCKFROST_API}/accounts/${stakeId}`, { headers: blockfrostHeaders });
        setAccountWallet(response.data);
        const addressResponse = await axios.get(`${BLOCKFROST_API}/accounts/${stakeId}/addresses`, { headers: blockfrostHeaders });
        const addressesData = addressResponse.data;
      
        if (!addressesData.status_code && addressesData.length > 0) {
          console.log("First address:", addressesData[0].address);
        }
      } catch (error) {
        console.error('Error fetching Blockfrost data:', error);
      } finally {
        setIsLoading(false);
      }
    };

		fetchAccountInfo();
	}, []);

	return (
		<>
			<Head>
				<title>User Details - Management</title>
			</Head>
			<Container sx={{ mt: 3 }} maxWidth="lg">
				<Grid
					container
					direction="row"
					justifyContent="center"
					alignItems="stretch"
					spacing={3}
				>
					<Grid item xs={12} md={8}>
						{isLoading || !user ?
							<Skeleton variant="rectangular" width={800} height={500} />
							: <ProfileCover user={user} />}
					</Grid>
					<Grid item xs={12} md={4}>
						{isLoading || !accountWallet ?
							<Skeleton variant="rectangular" width={400} height={200} />
							: <RecentActivity data={accountWallet} />}
					</Grid>
				</Grid>
			</Container>
			<Footer />
		</>
	);
}

ManagementUserProfile.getLayout = (page) => (
	<SidebarLayout>{page}</SidebarLayout>
);

export default ManagementUserProfile;
