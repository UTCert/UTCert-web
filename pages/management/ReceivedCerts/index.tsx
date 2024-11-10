import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container, IconButton } from '@mui/material';
import Footer from '@/components/Footer';

import ReceivedCertsOrders from '@/content/Management/Transactions/ReceivedCertsOrders';
import { SnackbarProvider, useSnackbar } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';

function SnackbarCloseButton({ snackbarKey }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)} size="small" sx={{ color: 'white' }}>
      <CloseIcon/>
    </IconButton>
  );
}

function ApplicationsTransactions() {
  return (
    <>
      <Head>
        <title>ReceivedCerts</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <ReceivedCertsOrders />
          </Grid>
        </Grid>
      </Container>
      <SnackbarProvider
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        action={snackbarKey => <SnackbarCloseButton snackbarKey={snackbarKey} />} />
      <Footer />
    </>
  );
}

ApplicationsTransactions.getLayout = (page) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default ApplicationsTransactions;
