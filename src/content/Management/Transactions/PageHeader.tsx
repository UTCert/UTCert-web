
import Loading from '@/components/Loading';
import { useStore } from '@/contexts/GlobalContext';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import axiosInstance from '@/lib/axiosIntance';
import AddIcon from '@mui/icons-material/Add';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import DescriptionIcon from '@mui/icons-material/Description'
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { enqueueSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { SaveAlt } from '@mui/icons-material';

function DialogImport(props: any) {
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
            const {data} = res; 
            if(!data.success) {
              enqueueSnackbar(data.message, { variant: 'error' });
            } else {
              enqueueSnackbar('File uploaded successfully!', {
                variant: 'success'
              });
              handleChangeData();
            }
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

DialogImport.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  // selectedValue: PropTypes.string.isRequireds
};

function DialogCrud({ open, onClose }) {
  const [formData, setFormData] = useState({
    stakeId: '',
    addressWallet: '',
    identityNumber: '',
    certificateName: '',
    receiverName: '',
    receiverDoB: dayjs(),
    graduationYear: '',
    classification: '',
    studyMode: 1,
    signingType: 1,
    signers: [],
    signerAddress: '',
    attachment: undefined,
    attachmentName: ''
  });

  const [error, setError] = useState({
    stakeId: '',
    addressWallet: '',
    identityNumber: '',
    certificateName: '',
    receiverName: '',
    receiverDoB: '',
    graduationYear: '',
    classification: '',
    studyMode: '',
    signingType: '',
    signerAddress: '',
    attachment: '',
    attachmentName: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef(null);
  const { handleChangeData } = useStore();

  const handleReset = () => {
    setFormData({
      stakeId: '',
      addressWallet: '',
      identityNumber: '',
      certificateName: '',
      receiverName: '',
      receiverDoB: dayjs(),
      graduationYear: '',
      classification: '',
      studyMode: 1,
      signingType: 1,
      signers: [],
      signerAddress: '',
      attachment: undefined,
      attachmentName: ''
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null); 
  };

  const handleDateChange = (date: any) => {
    setFormData({ ...formData, receiverDoB: date });
  };

  const addSignerAddress = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      signers: [...prevFormData.signers, ''],
      signerAddress: [...prevFormData.signers, ''].toString()
    }));
  };

  const removeSignerAddress = (index: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      signers: prevFormData.signers.filter((_, i) => i !== index),
      signerAddress: prevFormData.signers
        .filter((_, i) => i !== index)
        .toString()
    }));
  };

  const handleSignerAddressChange = (index: number, value: string) => {
    const updatedSigners = formData.signers.map((address, i) =>
      i === index ? value : address
    );
    setFormData((prevFormData) => ({
      ...prevFormData,
      signers: updatedSigners,
      signerAddress: updatedSigners.toString()
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        setFormData((prevData) => ({
          ...prevData,
          attachment: base64String,
          attachmentName: file.name
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle file drop
  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData({
          ...formData,
          attachment: reader.result,
          attachmentName: file.name
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDeleteFile = () => {
    setFormData({
      ...formData,
      attachment: null,
      attachmentName: ''
    });
  };

  const validator = () => {
    const error: any = {};
    let isValid = true;

    // Validate required
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        isValid = false;
        error[key] = 'Field is required!';
      }
    }

    // Validate field
    if (formData.graduationYear && !/^\d+$/.test(formData.graduationYear)) {
      error.graduationYear = 'The graduation year is a number only.';
      isValid = false;
    }

    if (formData.signingType && formData.signingType == 2) {
      if (!formData.signers.length || formData.signers.some(x => !x)) {
        error.signingType = 'Signer is required!';
        isValid = false;
      } 
    }

    if (!isValid) {
      setError(error);
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validator()) {
      enqueueSnackbar('Please recheck the input', {
        variant: 'error'
      });

      return;
    }

    setLoading(true);
    try {
      const result = await axiosInstance.post('/Certificate/create', formData);
      setLoading(false);

      if (result.status === HTTP_STATUS.OK) {
        const { data } = result;
        if (!data.success) {
          enqueueSnackbar(data.message, {
            variant: 'error'
          });
        } else {
          enqueueSnackbar('Create certificate successfully!', {
            variant: 'success'
          });
          handleChangeData();
          handleReset();
          onClose();
        }
      }
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Create certificate error, try again!', {
        variant: 'error'
      });
    }
  };

  return (
    <>
      {loading && <Loading />}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          sx={{
            padding: '16px 24px',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            borderBottom: '1px solid #ddd'
          }}
        >
          Create Certificate
        </DialogTitle>
        <Box
          sx={{
            padding: 2
          }}
        >
          <Grid container spacing={2}>
            {/* Identity Number */}
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Identity Number</InputLabel>
                <Input
                  name="identityNumber"
                  value={formData.identityNumber}
                  onChange={handleInputChange}
                />
                {error?.identityNumber && (
                  <FormHelperText style={{ color:'#d32f2f'}}>{error?.identityNumber}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Certificate Name */}
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Certificate Name</InputLabel>
                <Input
                  name="certificateName"
                  value={formData.certificateName}
                  onChange={handleInputChange}
                />
                {error?.certificateName && (
                  <FormHelperText style={{ color:'#d32f2f'}}>{error?.certificateName}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Classification */}
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Classification</InputLabel>
                <Input
                  name="classification"
                  value={formData.classification}
                  onChange={handleInputChange}
                />
                {error?.classification && (
                  <FormHelperText style={{ color:'#d32f2f'}}>{error?.classification}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Year of Graduation */}
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Year of Graduation</InputLabel>
                <Input
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                />
                {error?.graduationYear && (
                  <FormHelperText style={{ color:'#d32f2f'}}>{error?.graduationYear}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* StakeId */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Student Id</InputLabel>
                <Input
                  name="stakeId"
                  value={formData.stakeId}
                  onChange={handleInputChange}
                />
                {error?.stakeId && (
                  <FormHelperText style={{ color:'#d32f2f'}}>{error?.stakeId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Received Address */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Received Address</InputLabel>
                <Input
                  name="addressWallet"
                  value={formData.addressWallet}
                  onChange={handleInputChange}
                />
                {error?.addressWallet && (
                  <FormHelperText style={{ color:'#d32f2f'}}>{error?.addressWallet}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Student Name */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Student Name</InputLabel>
                <Input
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                />
                {error?.receiverName && (
                  <FormHelperText style={{ color:'#d32f2f'}}>{error?.receiverName}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Mode of Study */}
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Mode of Study</InputLabel>
                <Select
                  name="studyMode"
                  value={formData.studyMode}
                  onChange={handleInputChange}
                  label="Mode of Study"
                >
                  <MenuItem value={1}>Fulltime</MenuItem>
                  <MenuItem value={2}>Part-time</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Received Date of Birth */}
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <DatePicker
                  label="Received Date of Birth"
                  value={formData.receiverDoB}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>

            {/* Signing Type */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Signing Type</InputLabel>
                <Select
                  name="signingType"
                  label="Signing Type"
                  value={formData.signingType}
                  onChange={handleInputChange}
                >
                  <MenuItem value={1}>Single Sign</MenuItem>
                  <MenuItem value={2}>Multiple Sign</MenuItem>
                </Select>
                {error?.signingType && <FormHelperText style={{ color:'#d32f2f'}}>{error?.signingType}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Table for Signers (if "Multiple Sign") */}
            {formData.signingType === 2 && (
              <Grid item xs={12}>
                <Tooltip title="Add new signer" arrow>
                  <Button
                    variant="contained"
                    onClick={addSignerAddress}
                    sx={{
                      ml: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      minWidth: 'unset',
                      padding: '8px',
                      borderRadius: '50%',
                      mb: 2
                    }}
                    size="small"
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                  </Button>
                </Tooltip>
                <Table sx={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Signer Address</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.signers.map((address, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            value={address}
                            onChange={(e) =>
                              handleSignerAddressChange(index, e.target.value)
                            }
                            placeholder="Enter signer address"
                            fullWidth
                            size="small"
                            sx={{
                              '& .MuiInputBase-root': { fontSize: '0.875rem' }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Remove Signer" arrow>
                            <IconButton
                              onClick={() => removeSignerAddress(index)}
                              sx={{ color: 'rgba(255, 0, 0, 0.5)' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            )}

            {/* Attachments (Drag and Drop or File Select) */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed grey',
                  borderRadius: 2,
                  padding: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: 'black' }
                }}
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                Drag & Drop or Click to Select Attachment
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept="*"
              />

              {formData.attachmentName && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon
                      sx={{ mr: 1, color: 'rgba(76, 175, 80, 0.7)' }}
                    />
                    {/* File selected icon */}
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 'medium', color: 'primary.main' }}
                    >
                      Selected File: <strong>{formData.attachmentName}</strong>
                    </Typography>
                  </Box>

                  <Tooltip title="Remove file" arrow>
                    <IconButton
                      onClick={() => handleDeleteFile()}
                      sx={{ color: 'rgba(255, 0, 0, 0.5)' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DialogCrud.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

function PageHeader() {
  const [openImport, setOpenImport] = useState(false);
  const [openCrud, setOpenCrud] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);


  // handle open import
  const handleOpenImport = () => {
    setOpenImport(true);
    handleCloseDropDown();
  };

  const handleCloseImport = () => {
    setOpenImport(false);
    handleCloseDropDown();
  };

  // handleOpenCrud
  const handleOpenCrud = () => {
    setOpenCrud(true);
    handleCloseDropDown();
  };

  const handleCloseCrud = () => {
    setOpenCrud(false);
    handleCloseDropDown();

  };
  
   // handle Open dropwdown
  const handleOpenDropDown = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDropDown = () => {
    setAnchorEl(null);
  };

  const handleDownloadFileTemplate = () => {
    const fileUrl = '/assets/template_export.xlsx'; 
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'template_export.xlsx'; 
    link.click();
  }

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Create Certificates
        </Typography>
        <Typography variant="subtitle2">Do you want issued certs?</Typography>
      </Grid>
      <Grid item>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadFileTemplate}
              startIcon={<SaveAlt sx={{ color: 'white' }} />}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: { xs: 2, md: 0 },
                backgroundColor: '#00C853',
                '&:hover': {
                  backgroundColor: '#00B248',
                },
                '&:active': {
                  backgroundColor: '#009639'
                }
              }}
            >
              Download file template
            </Button>
          </Grid>
          <Grid item>
            <Button
              sx={{ mt: { xs: 2, md: 0 } }}
              variant="contained"
              onClick={handleOpenDropDown}
              startIcon={<AddTwoToneIcon fontSize="small" />}
            >
              Create Certificate
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseDropDown}
            >
              <MenuItem onClick={handleOpenCrud}>
                <ListItemIcon>
                  <AddTwoToneIcon fontSize="small" />
                </ListItemIcon>
                Add New
              </MenuItem>

              <MenuItem onClick={handleOpenImport}>
                <ListItemIcon>
                  <DescriptionIcon fontSize="small" />
                </ListItemIcon>
                Import from Excel
              </MenuItem>
            </Menu>

            {openImport && (
              <DialogImport open={openImport} onClose={handleCloseImport} />
            )}
            {openCrud && (
              <DialogCrud open={openCrud} onClose={handleCloseCrud} />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
