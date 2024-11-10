import { Card } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import ContactsOrdersTable from './ContactsOrdersTable';

function ContactOrders() {
  return (
    <Card>
      <ContactsOrdersTable/>
      <SnackbarProvider
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Card>
  );
}

export default ContactOrders;
