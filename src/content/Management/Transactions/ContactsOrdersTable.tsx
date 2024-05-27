import {
  Box,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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
import { ChangeEvent, FC, useEffect, useState } from 'react';

import Label from '@/components/Label';
import { API_URL } from '@/constants/appConstants';
import GetCookie from '@/hooks/getCookie';
import { Contact, ContactName, ContactStatus } from '@/models/contact';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { enqueueSnackbar } from 'notistack';
import { FaSpinner } from 'react-icons/fa';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';
import styles from '../../../../styles/IssuedCerts.module.css';
import BulkActions from './BulkActions';
interface ContactsOrdersTableProps {
  className?: string;
  contactOrders: Contact[];
  fetchData: () => void;
}

interface Filters {
  contactStatus?: ContactStatus;
  contactName?: ContactName;
}

const columns = [
  { key: 'contactCode', name: 'Code' },
  { key: 'contactName', name: 'Contact Name' },
  { key: 'createdDate', name: 'Created Date' }
];

const getStatusLabel = (contactStatus: ContactStatus): JSX.Element => {
  const map = {
    1: {
      text: 'Pending',
      color: 'primary'
    },
    2: {
      text: 'Connected',
      color: 'success'
    }
  };
  const { text, color }: any = map[contactStatus];
  return <Label color={color}>{text}</Label>;
};

const applyFilters = (
  contactOrders: Contact[],
  filters: Filters
): Contact[] => {
  return contactOrders.filter((contactOrder) => {
    let matches = true;

    if (
      filters.contactStatus &&
      contactOrder.contactStatus != filters.contactStatus
    ) {
      matches = false;
    }

    if (
      filters.contactName &&
      !contactOrder.contactName
        .toLowerCase()
        .includes(filters.contactName.toLowerCase())
    ) {
      matches = false;
    }

    return matches;
  });
};

const applyPagination = (
  contactOrders: Contact[],
  page: number,
  limit: number
): Contact[] => {
  return contactOrders.slice(page * limit, page * limit + limit);
};

const ContactsOrdersTable: FC<ContactsOrdersTableProps> = ({
  contactOrders,
  fetchData
}) => {
  const [selectedContactOrders] = useState<string[]>([]);
  const selectedBulkActions = selectedContactOrders.length > 0;
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [filters, setFilters] = useState<Filters>({
    contactStatus: null,
    contactName: null
  });
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortedContactOrders, setSortedContactOrders] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortColumn, setSortColumn] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [paginatedSortedData, setPaginatedSortedData] = useState([]);

  useEffect(() => {
    const filteredData = applyFilters(contactOrders, filters);
    const paginatedData = applyPagination(filteredData, page, limit);

    setFilteredData(filteredData);
    setPaginatedSortedData(paginatedData);
  }, [contactOrders, filters, page, limit]);

  const handleSort = (column) => {
    let newSortDirection;

    if (sortColumn === column && sortDirection === 'desc' && isSorted) {
      setSortedContactOrders(contactOrders);
      setSortDirection(null);
      setSortColumn(null);
      setIsSorted(false);
      return;
    }

    if (sortColumn === column && sortDirection === 'asc') {
      newSortDirection = 'desc';
    } else if (sortColumn === column && sortDirection === 'desc') {
      newSortDirection = null;
    } else {
      newSortDirection = 'asc';
    }
    const sortedData = [...paginatedContactOrders].sort((a, b) => {
      if (column === 'createdDate') {
        const dateA = new Date(a[column]);
        const dateB = new Date(b[column]);
        if (dateA < dateB) {
          return newSortDirection === 'asc' ? -1 : 1;
        }
        if (dateA > dateB) {
          return newSortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      } else {
        if (a[column] < b[column]) {
          return newSortDirection === 'asc' ? -1 : 1;
        }
        if (a[column] > b[column]) {
          return newSortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });

    const filteredData = applyFilters(sortedData, filters);
    const paginatedData = applyPagination(filteredData, page, limit);

    setFilteredData(filteredData);
    setPaginatedSortedData(paginatedData);

    setSortedContactOrders(paginatedData);
    setSortDirection(newSortDirection);
    setSortColumn(column);
    setIsSorted(true);
  };

  const renderSortIcon = (columnKey) => {
    if (sortColumn === columnKey) {
      return (
        <>{sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />}</>
      );
    }
    return null;
  };

  const handleReload = async () => {
    try {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
      enqueueSnackbar('Load Successful!', { variant: 'success' });
    } catch (error) {
      setIsLoading(false);
      enqueueSnackbar('Load Error!', { variant: 'error' });
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  const handleFilterChange = (filterName: string, value: any) => {
    if (filterName === 'contactStatus') {
      let newValue = null;
      if (value !== 'all') {
        newValue = value;
      }
      setFilters((prevFilters) => ({
        ...prevFilters,
        contactStatus: newValue
      }));
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterName]: value
      }));
    }
  };

  const handlePageChange = (_event: any, newPage: number): void => {
    setIsSorted(false);
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredContactOrders = applyFilters(contactOrders, filters);

  const paginatedContactOrders = applyPagination(
    filteredContactOrders,
    page,
    limit
  );
  const theme = useTheme();

  function handleSelectDelete(contactId) {
    setSelectedId(contactId);
    handleClickOpen();
  }

  function handleDelete(contactId) {
    const apiUrl = API_URL + '/Contact';

    fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactId)
    })
      .then((response) => response.json())
      .then(() => {
        enqueueSnackbar('Delete Successful!', { variant: 'success' });
        // Xử lý dữ liệu trả về nếu cần
      })
      .catch(() => {
        enqueueSnackbar('Delete Error!', { variant: 'error' });
        // Xử lý lỗi nếu có
      });
    setOpen(false);
  }

  function handleAccept(contactId) {
    const apiUrl = API_URL + '/Contact/accept';

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactId)
    })
      .then((response) => response.json())
      .then(() => {
        enqueueSnackbar('Accept Successful!', { variant: 'success' });
        // Xử lý dữ liệu trả về nếu cần
      })
      .catch(() => {
        enqueueSnackbar('Accept Fail!', { variant: 'error' });
      });
  }

  return (
    <Card>
      {selectedBulkActions && (
        <Box flex={1} p={2}>
          <BulkActions />
        </Box>
      )}
      {!selectedBulkActions && (
        <CardHeader
          action={
            <Box width={350}>
              <div className={styles.box_container}>
                <div
                  className={`${styles.box_icon} ${
                    isLoading ? styles.rotate : ''
                  }`}
                >
                  <FaSpinner
                    size={22}
                    className={`${styles.spinner} ${
                      isLoading ? styles.rotate : ''
                    }`}
                    onClick={handleReload}
                    style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }} // Change cursor style when isLoading is true
                  />
                </div>
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
      )}
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{ cursor: 'pointer' }}
                >
                  {column.name}
                  {renderSortIcon(column.key)}
                </TableCell>
              ))}
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isSorted
              ? paginatedSortedData.map((contactOrder) => {
                  const isContactOrderSelected = selectedContactOrders.includes(
                    contactOrder.contactID
                  );
                  return (
                    <TableRow
                      hover
                      key={contactOrder.contactID}
                      selected={isContactOrderSelected}
                    >
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {contactOrder.contactCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {contactOrder.contactName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                        >
                          {new Date(
                            contactOrder.createdDate
                          ).toLocaleDateString('en-GB')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          align="left"
                          gutterBottom
                          noWrap
                        >
                          {getStatusLabel(contactOrder.contactStatus)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {contactOrder.contactStatus == 1 &&
                          contactOrder.receivedID == GetCookie('stakeId') && (
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
                                  handleAccept(contactOrder.contactID)
                                }
                              >
                                <HandshakeIcon fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                          )}
                        {contactOrder.contactStatus == 1 && (
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
                              onClick={() =>
                                handleSelectDelete(contactOrder.contactID)
                              }
                            >
                              <DeleteTwoToneIcon fontSize="medium" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              : paginatedContactOrders.map((contactOrder) => {
                  const isContactOrderSelected = selectedContactOrders.includes(
                    contactOrder.contactID
                  );
                  return (
                    <TableRow
                      hover
                      key={contactOrder.contactID}
                      selected={isContactOrderSelected}
                    >
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {contactOrder.contactCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {contactOrder.contactName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                        >
                          {new Date(
                            contactOrder.createdDate
                          ).toLocaleDateString('en-GB')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          align="left"
                          gutterBottom
                          noWrap
                        >
                          {getStatusLabel(contactOrder.contactStatus)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {contactOrder.contactStatus == 1 &&
                          contactOrder.receivedID == GetCookie('stakeId') && (
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
                                  handleAccept(contactOrder.contactID)
                                }
                              >
                                <HandshakeIcon fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                          )}
                        {contactOrder.contactStatus == 1 && (
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
                              onClick={() =>
                                handleSelectDelete(contactOrder.contactID)
                              }
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
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={filteredContactOrders.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 30]}
        />
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
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
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={() => handleDelete(selectedId)} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ContactsOrdersTable;
