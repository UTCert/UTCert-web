
import Loading from '@/components/Loading';
import { useStore } from '@/contexts/GlobalContext';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import axiosInstance from '@/lib/axiosIntance';
import AddIcon from '@mui/icons-material/Add';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useState } from 'react';

function SimpleDialog(props: any) {
  const { onClose, open } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const {handleChangeData} = useStore();


  const handleClose = () => {
    onClose(); // Call the onClose function provided in the props
  };

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    if(selectedFile) {
        handleListItemClick('addCerts', selectedFile);

    }
  };
  
  const handleListItemClick = async (
    destination: string,
    selectedFile: any
  ) => {
    if (destination === 'addCerts') {
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('certificate', selectedFile);
          setIsLoading(true);
          const res = await axiosInstance.post(
            '/Certificate/create-from-excel',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          setIsLoading(false);
          if (res.status == HTTP_STATUS.OK) {
            enqueueSnackbar('File uploaded successfully!', {
              variant: 'success'
            });
            handleChangeData(); 
            handleClose();
          } else {
            enqueueSnackbar('Error uploading file!', { variant: 'error' });
            handleClose();
          }
        } catch (error) {
          setIsLoading(false);
          enqueueSnackbar('Error uploading file!', { variant: 'error' });
          handleClose();
        }
      } else {
        setIsLoading(false);
        enqueueSnackbar('Error uploading file!', { variant: 'error' });
        handleClose();
      }
    }
  };

  return (
    <>
    {isLoading && <Loading />}
     {!isLoading && <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add file CSV</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem
          autoFocus
          button
          onClick={() => document.getElementById('fileInput').click()}
        >
          <ListItemAvatar>
            <Avatar>
              <AddIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary=".csv" />
          <input
            type="file"
            id="fileInput"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </ListItem>
      </List>
    </Dialog>}
    </>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  // selectedValue: PropTypes.string.isRequireds
};

function PageHeader() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Create Certificates
        </Typography>
        <Typography variant="subtitle2">
          Do you want issued certs?
        </Typography>
      </Grid>
      <Grid item>
        <Button
          sx={{ mt: { xs: 2, md: 0 } }}
          variant="contained"
          startIcon={<AddTwoToneIcon fontSize="small" />}
          onClick={handleClickOpen}
        >
          Create certificate
        </Button>
        <SimpleDialog 
          open={open} 
          onClose={handleClose} 
        />
      </Grid>
    </Grid>
  );
}

export default PageHeader;
