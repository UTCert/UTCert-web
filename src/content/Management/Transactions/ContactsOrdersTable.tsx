import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';

import Label from '@/components/Label';
import { Contact, ContactStatus } from '@/models/contact';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { enqueueSnackbar } from 'notistack';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';
import styles from '../../../../styles/IssuedCerts.module.css';
import axiosInstance from '@/lib/axiosIntance';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import { useStore } from '@/contexts/GlobalContext';
import Loading from '@/components/Loading';

interface Filters {
  contactName?: string;
  sorting: string;
  pageNumber: number;
  pageSize: number;
  contactStatus ?: ContactStatus, 
}

const columns = [
  { key: 'id', name: 'Code', sort: '', align: 'center'},
  { key: 'contactName', name: 'Contact Name', sort: '', align: 'left'},
  { key: 'createdDate', name: 'Created Date', sort: '', align: 'center' }
];

const statusOptions = [
    {
      id: 'all',
      name: 'All'
    },
    {
      id: '1',
      name: 'Pending'
    },
    {
      id: '2',
      name: 'Connected'
    }
  ];

function ContactsOrdersTable() {
  const [isTableLoading, setTableLoading] = useState<boolean>(true);
  const [selectedContact, setSelectedContact] = useState<Contact>(null); 
  const [isLoading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Contact[]>([]);
  const [filters, setFilters] = useState<Filters>({
    contactStatus: null, 
    pageNumber: 0,
    pageSize: 5,
    contactName: '',
    sorting: ''
  });

  const [totalCount, setTotalCount] = useState<number>(0);
  const [openDialog, setOpenDialog] = useState<{
    isOpen: boolean;
    type: string;
  }>({
    isOpen: false,
    type: ''
  });
  const theme = useTheme();
  const {user} = useStore(); 
  

  // Xử lý debounce trong useEffect
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [filters]);

  // #region function
  // label status
  const getStatusLabel = (status: ContactStatus): JSX.Element => {
    const statusMap: Record<ContactStatus, { text: string; color: any }> = {
      '1': { text: 'Pending', color: 'info' },
      '2': { text: 'Connected', color: 'success' }
    };

    const { text, color } = statusMap[status] ?? {
      text: 'Pending',
      color: 'info'
    };
    return <Label color={color}>{text}</Label>;
  };

  const handleConfirmDelete = (contact: Contact) => {
    setSelectedContact(contact); 
    setOpenDialog({isOpen: true, type: 'delete'})
  }

  const handleCloseDialog = () => {
    setSelectedContact(null); 
    setOpenDialog({isOpen: false, type: ''})
  }

  // #endregion

  // #region filter
  const handleSort = async (column: {
    key: string;
    name: string;
    sort?: string;
    isSort?: boolean;
  }) => {
    if (!column.isSort) {
      return;
    }

    if (!column.sort) {
      column.sort = 'asc';
    } else if (column.sort == 'desc') {
      column.sort = 'asc';
    } else {
      column.sort = 'desc';
    }

    columns.forEach(x => {
      if(x.key == column.key) {
        x.sort = column.sort; 
      } else {
        x.sort = ''; 
      }
    });
    
    let sorting = `${column.key} ${column.sort}`;
    setFilters({
      ...filters,
      sorting
    });
  };

  const handlePageNumberChange = (_: any, newPage: number) => {
    console.log(newPage);
    setFilters({
      ...filters,
      pageNumber: newPage
    });
  };

  const handlePageSizeChange = (event: any) => {
    setFilters({
      ...filters,
      pageSize: parseInt(event.target.value)
    });
  };

  const handleFilterChange = (filterName: string, value: any) => {
    if (filterName === 'contactStatus') {
      setFilters((prevFilters) => ({
        ...prevFilters,
        contactStatus: value !== 'all' ? parseInt(value) : null
      }));
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterName]: value
      }));
    }
  };

  // #endregion

  // #region API
  const fetchData = async () => {
    let input = { ...filters };
    input.pageNumber = filters.pageNumber + 1;
    try {
      setTableLoading(true);
      const response = await axiosInstance.post('/Contact/get-contacts', input);
      setTableLoading(false);

      if (response.status == HTTP_STATUS.OK) {
        const { data } = response.data;
        setData(data.items);
        setTotalCount(data.totalCount);
      } else {
        setData([]);
      }
    } catch (error) {
      setTableLoading(false);
      console.error(error);
    }
  };

  const handleAccept = async (contact: Contact) => {
    try {
        setLoading(true);
        const {data} = await axiosInstance.put('/Contact/update-status',{
            id: contact.id, 
            status: ContactStatus.Accepted, 
        }); 
        setLoading(false);
        if(data.success) {
            enqueueSnackbar('Accept contact successful!', { variant: 'success' });
            close
        }
        fetchData(); 
    } catch (error) {
        setLoading(false);
        enqueueSnackbar('Accept contact error!', { variant: 'error' });
    }
  }

  const handleDelete = async (contact: Contact) => {
    try {
        setLoading(true); 
        const {data} = await axiosInstance.delete(`Contact/${contact.id}`)
        setLoading(false); 
        if(data.success) {
            enqueueSnackbar('Delete contact successful!', { variant: 'success' });
        }
        handleCloseDialog();
    } catch (error) {
        setLoading(false); 
        enqueueSnackbar('Delete contact error!', { variant: 'error' });
        handleCloseDialog();
    }
  }
  

  return (
    <>
      {isLoading && <Loading />}
      <Card>
          <CardHeader
            action={
              <Box width={350}>
                <div className={styles.box_container}>
                  <div className={styles.box_filter}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.contactStatus || 'all'}
                        onChange={(e) =>
                          handleFilterChange('contactStatus', e.target.value)
                        }
                        label="Status"
                        autoWidth
                      >
                        {statusOptions.map((statusOption) => (
                          <MenuItem key={statusOption.id} value={statusOption.id}>
                            {statusOption.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Contact Name</InputLabel>
                      <Input
                         onChange={(e) =>
                              handleFilterChange('contactName', e.target.value)
                          }
                        placeholder="Enter Certificate Name"
                      />
                    </FormControl>
                  </div>
                </div>
              </Box>
            }
            title="Contacts"
          />
        <Divider />
        <TableContainer>
        {isTableLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                flexDirection: 'column'
              }}
            >
              <CircularProgress
                size={60}
                thickness={5}
                style={{ color: '#3f51b5' }}
              />
              <Typography variant="h6" style={{ marginTop: '16px' }}>
                Loading data, please wait...
              </Typography>
            </div>
          ) : (
         <Fade in={!isTableLoading} timeout={500}>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        onClick={() => handleSort(column)}
                        style={{ cursor: 'pointer' }}
                        align={
                          column.align as
                            | 'left'
                            | 'center'
                            | 'right'
                            | 'justify'
                            | 'inherit'
                        }
                      >
                        {column.name}
                        {column.sort === 'asc' && <MdArrowDownward />}
                        {column.sort === 'desc' && <MdArrowUpward />}
                      </TableCell>
                    ))}
                    <TableCell align='center'>Status</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((contact, index) => {
                    return (
                      <TableRow hover key={contact.id}>
                        <TableCell align='center'>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="text.primary"
                            gutterBottom
                            noWrap
                          >
                            {filters.pageSize * filters.pageNumber + index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell align='left'>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="text.primary"
                            gutterBottom
                            noWrap
                          >
                            {contact.contactName}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="text.primary"
                            gutterBottom
                          >
                            {new Date(contact.createdDate).toLocaleDateString(
                              'en-GB'
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="text.primary"
                            align="right"
                            gutterBottom
                            noWrap
                          >
                            {getStatusLabel(contact.contactStatus)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {contact.contactStatus == ContactStatus.Pending &&
                          contact.receiverId == user.id && 
                             (
                              <Tooltip title="Accept" arrow>
                                <IconButton
                                  sx={{
                                    '&:hover': {
                                      background: theme.colors.primary.lighter
                                    },
                                    color: theme.palette.primary.main
                                  }}
                                  color="inherit"
                                  size="small"
                                  onClick={() =>
                                      handleAccept(contact)
                                    }
                                >
                                  <HandshakeIcon fontSize="medium"  />
                                </IconButton>
                              </Tooltip>
                            )}
                          {contact.contactStatus == ContactStatus.Accepted && (
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                sx={{
                                  '&:hover': {
                                    background: theme.colors.error.lighter
                                  },
                                  color: theme.palette.error.main
                                }}
                                color="inherit"
                                size="small"
                                onClick={() => handleConfirmDelete(contact)}
                              >
                                <DeleteTwoToneIcon fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
         </Fade> )}
        </TableContainer>
        <Box p={2}>
          <TablePagination
            component="div"
            count={totalCount}
            onPageChange={handlePageNumberChange}
            onRowsPerPageChange={handlePageSizeChange}
            page={filters.pageNumber}
            rowsPerPage={filters.pageSize}
            rowsPerPageOptions={[5, 10, 25, 30]}
          />
        </Box>
        <Dialog
          open={openDialog.isOpen}
          onClose={() => setOpenDialog({ isOpen: false, type: '' })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {'Are you sure to delete friend?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You can't undo this operation
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleCloseDialog()}>Disagree</Button>
            <Button autoFocus onClick={() => handleDelete(selectedContact)}>Agree</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
}

export default ContactsOrdersTable;
