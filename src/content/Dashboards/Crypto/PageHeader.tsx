import { useStore } from '@/contexts/GlobalContext';
import { Typography, Avatar, Grid, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
function PageHeader() {
  const { user,  authToken, loading} = useStore();
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if(loading) {
      return ;
    }
    if (!authToken) {
      router.push('/'); 
    }
    if (user) {
      setIsLoading(false); 
    } 
  }, [authToken, user, router.asPath]);

  // render a loading message while the API is being called
  if (isLoading || !authToken) {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 9fr' }}>
          <Skeleton animation="wave" variant="circular" width={90} height={90} />
          <Skeleton animation="wave" variant="rectangular" width={1000} height={90} />
        </div>
      </>
    );
  }

  // render the PageHeader component with the user data once it's available
  return (
    <Grid container alignItems="center">
      <Grid item>
        <Avatar
          sx={{
            mr: 2,
            width: theme.spacing(8),
            height: theme.spacing(8)
          }}
          variant="rounded"
          alt={user.name}
          src={user.avatarUri}
        />
      </Grid>
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography variant="subtitle2">
          Today is a good day to start study!
        </Typography>
      </Grid>
    </Grid>
  );
}


export default PageHeader;
