import { Button, Container, Grid, Snackbar, Stack } from '@mui/material';
import Loading from '@/components/Loading';

import GetCookie from '@/hooks/getCookie';
import SetCookie from '@/hooks/setCookie';
import axiosInstance from '@/lib/axiosIntance';
import { CardanoWallet, useWallet } from '@meshsdk/react';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useStore } from '@/contexts/GlobalContext';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Hero() {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type?: AlertColor;
    message?: string;
  }>({ isOpen: false });

  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const {handleSetToken, handleGetUser} = useStore();
  const router = useRouter();

  const showAlert = (message: string, type: AlertColor) => {
    setAlertState({ isOpen: true, message, type });
  };

  const handleCloseAlert = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const getAssets = async () => {
    if (!wallet) return;

    setLoading(true);
    try {
      const _assets = await wallet.getAssets();
      const stakeId = await wallet.getRewardAddresses();
      const [address] = await wallet.getUnusedAddresses(); 
      SetCookie('stakeId', stakeId);
      SetCookie("receiveAddress", address); 
      setAssets(_assets);
      await handleLogin();
    } catch (error) {
      console.error('Error getting assets:', error);
      showAlert('Failed to get assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const stakeId = GetCookie('stakeId');

    try {
      const { data: accountCheck } = await axiosInstance.get(`User/has-account`, {
        params: { stakeId }
      });

      if (!accountCheck.success) {
        router.push('/login-register/register');
        return;
      }

      const { data: authResponse } = await axiosInstance.get(`User/authenticate`, {
        params: { stakeId }
      });

      if (authResponse.success) {
        handleSetToken(authResponse.data.jwtToken);
        await handleGetUser();
        showAlert('Login successful!', 'success');
        router.push('/dashboards/home');
      } else {
        showAlert('Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Login failed', 'error');
    }
  };

  return (
    <>
      {loading && <Loading />}
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Grid justifyContent="center" alignItems="center" container>
          <div>
            <h1>LOGIN</h1>
            <CardanoWallet />
            {connected && (
              <>
                {assets ? (
                  <pre></pre>
                ) : (
                  <Button
                    onClick={getAssets}
                    disabled={loading}
                    style={{ marginTop: '20px' }}
                  >
                    CONFIRM
                  </Button>
                )}
              </>
            )}
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Snackbar 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
                open={alertState.isOpen} 
                autoHideDuration={6000} 
                onClose={handleCloseAlert}
              >
                <Alert onClose={handleCloseAlert} severity={alertState.type} sx={{ width: '100%' }}>
                  {alertState.message}
                </Alert>
              </Snackbar>
            </Stack>
          </div>
        </Grid>
      </Container>
    </>
  );
}

export default Hero;
