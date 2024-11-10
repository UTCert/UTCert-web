import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from '@/content/Management/Transactions/PageHeader';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Container, Grid, IconButton } from '@mui/material';
import Head from 'next/head';

import IssuedCertsOrders from '@/content/Management/Transactions/IssuedCertsOrders';
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
        <title>IssuedCerts</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <IssuedCertsOrders />
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
