import Loading from '@/components/Loading';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import axiosInstance from '@/lib/axiosIntance';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormLabel,
  Grid,
  Input
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

const EditUserInfoModal = ({ user, open, onClose }) => {
  const [nameValue, setNameValue] = useState('');
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNameValue(user.name);
      setPreviewUrl(user.avatarUri);
    }
  }, [user]);

  const handleNameChange = (event) => {
    setNameValue(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileValue(selectedFile);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const submit = async () => {
    if (!nameValue) {
      enqueueSnackbar('User name is required', { variant: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('name', nameValue);
    if (fileValue) {
      formData.append('avatarUri', fileValue);
    }
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/User/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setLoading(false);
      if (response.status === HTTP_STATUS.OK) {
        const { data } = response;
        if (data.success) {
          enqueueSnackbar('Update info successfully!', { variant: 'success' });
          onClose(true);
        } else {
          const message = data.message ?? 'Update failed, try again!';
          enqueueSnackbar(message, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Update failed, try again!', { variant: 'error' });
      }
    } catch (err) {
      setLoading(false);
      enqueueSnackbar('Update failed, try again!', { variant: 'error' });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent>
        <Box sx={{ padding: 3 }}>
          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              item
              xs={12}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              {previewUrl ? (
                <>
                  <Avatar
                    src={previewUrl}
                    alt="Preview"
                    sx={{ width: 150, height: 150, mb: 1 }}
                  />
                </>
              ) : (
                <Avatar sx={{ width: 120, height: 120, mb: 1 }}>
                  No Image
                </Avatar>
              )}
              <Button
                variant="outlined"
                onClick={() => document.getElementById('file-input').click()}
                sx={{ mt: 1 }}
              >
                Upload Avatar
              </Button>
              <input
                type="file"
                id="file-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <FormLabel>Your name</FormLabel>
                <Input
                  fullWidth
                  color="primary"
                  placeholder="Nguyen Van An"
                  value={nameValue}
                  onChange={handleNameChange}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserInfoModal;
