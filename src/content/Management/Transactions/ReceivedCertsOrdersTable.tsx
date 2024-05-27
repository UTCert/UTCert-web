import {
  Certificate,
  CertificateName,
  CertificateStatus,
  OrganizationName
} from '@/models/certificate';
import VisibilityIcon from '@mui/icons-material/Visibility';
import styles from '../../../../styles/IssuedCerts.module.css';

import {
  Box,
  Card,
  CardHeader,
  Checkbox,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  Input,
  InputLabel,
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
import { enqueueSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';
import BulkActions from './BulkActions';

interface ReceivedCertsOrdersTableProps {
  className?: string;
  certificates: Certificate[];
  fetchData: () => void;
}

interface Filters {
  status?: CertificateStatus;
  certificateName?: CertificateName;
  organizationName?: OrganizationName;
}

const columns = [
  { key: 'certificateCode', name: 'Code' },
  { key: 'certificateName', name: 'Certificate Name' },
  { key: 'yearOfGraduation', name: 'Graduation Year' },
  { key: 'organizationName', name: 'Organization Name' },
  { key: 'receivedDate', name: 'Received Date' }
];

// modal view cert
function SimpleDialog(props) {
  const { open, onClose, selectedCertifiate } = props;
  if (selectedCertifiate == undefined) {
    return <></>;
  }

  return (
    <Dialog maxWidth="lg" open={open} onClose={onClose}>
      <DialogContent
        style={{
          display: 'grid',
          gridTemplateColumns: '6fr 4fr',
          alignItems: 'center'
        }}
      >
        <div>
          <img
            src={selectedCertifiate.imageLink}
            alt="Image"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 2fr',
            marginLeft: '30px',
            fontSize: '15px',
            gap: '5px',
            backgroundColor: 'Background'
          }}
        >
          <p
            style={{
              fontWeight: 'bold',
              borderBottom: '1px solid #000',
              paddingBottom: '5px'
            }}
          >
            CERTIFICATE CODE:
          </p>
          <p style={{ borderBottom: '1px solid #000' }}>
            {selectedCertifiate.certificateCode}
          </p>
          <p style={{ fontWeight: 'bold', marginTop: '0px' }}>
            RECEIVED IDENTITY:
          </p>
          <p style={{ marginTop: '0px' }}>
            {selectedCertifiate.receivedIdentityNumber}
          </p>
          <p style={{ fontWeight: 'bold' }}>RECEIVED NAME:</p>
          <p>{selectedCertifiate.receivedName}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// const getStatusLabel = (certificateStatus: CertificateStatus): JSX.Element => {
//   const map = {
//     '0': {
//       text: 'Draft',
//       color: 'secondary'
//     },
//     '1': {
//       text: 'Signed',
//       color: 'primary'
//     },
//     '2': {
//       text: 'Sent',
//       color: 'success'
//     }
//   };
//   const { text, color }: any = map[certificateStatus];
//   return <Label color={color}>{text}</Label>;
// };

const applyFilters = (
  certificates: Certificate[],
  filters: Filters
): Certificate[] => {
  return certificates.filter((certificate) => {
    let matches = true;

    if (filters.status && certificate.certificateStatus !== filters.status) {
      matches = false;
    }

    if (
      filters.certificateName &&
      !certificate.certificateName
        .toLowerCase()
        .includes(filters.certificateName.toLowerCase())
    ) {
      matches = false;
    }

    if (
      filters.organizationName &&
      !certificate.organizationName
        .toLowerCase()
        .includes(filters.organizationName.toLowerCase())
    ) {
      matches = false;
    }

    return matches;
  });
};

const applyPagination = (
  certificates: Certificate[],
  page: number,
  limit: number
): Certificate[] => {
  return certificates.slice(page * limit, page * limit + limit);
};

const ReceivedCertsOrdersTable: FC<ReceivedCertsOrdersTableProps> = ({
  certificates,
  fetchData
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCertifiates, setSelectedCertificates] = useState<string[]>([]);
  const [selectedCertifiate, setSelectedCertificate] = useState<Certificate>();
  const [selectedCertifiatesInformation, setSelectedCertificatesInformation] =
    useState<Certificate[]>([]);

  const selectedBulkActions = selectedCertifiates.length > 0;
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [sortedCertificateOrders, setSortedCertificateOrders] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortColumn, setSortColumn] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    certificateName: null,
    organizationName: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState([]);
  const [paginatedSortedData, setPaginatedSortedData] = useState([]);

  useEffect(() => {
    const filteredData = applyFilters(certificates, filters);
    const paginatedData = applyPagination(filteredData, page, limit);

    setFilteredData(filteredData);
    setPaginatedSortedData(paginatedData);
  }, [certificates, filters, page, limit]);

  const handleSort = (column) => {
    let newSortDirection;

    if (sortColumn === column && sortDirection === 'desc' && isSorted) {
      setSortedCertificateOrders(certificates);
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
    const sortedData = [...paginatedCertificateOrders].sort((a, b) => {
      if (column === 'receivedDate') {
        const dateA = new Date(a[column]);
        const dateB = new Date(b[column]);
        if (dateA < dateB) {
          return newSortDirection === 'asc' ? -1 : 1;
        }
        if (dateA > dateB) {
          return newSortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      } else if (column === 'yearOfGraduation') {
        return newSortDirection === 'asc'
          ? a[column] - b[column]
          : b[column] - a[column];
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

    setSortedCertificateOrders(paginatedData);
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

  const handleFilterChange = (filterName: string, value: any) => {
    if (filterName === 'certificateStatus') {
      let newValue = null;
      if (value !== 'all') {
        newValue = value;
      }
      setFilters((prevFilters) => ({
        ...prevFilters,
        certificateStatus: newValue
      }));
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterName]: value
      }));
    }
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

  const handleSelectAllCertificateOrders = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedCertificates(
      event.target.checked
        ? certificates.map((certificate) => certificate.certificateID)
        : []
    );
    setSelectedCertificatesInformation(
      event.target.checked ? certificates : []
    );
  };

  const handleSelectOneCertificateOrder = (
    _event: ChangeEvent<HTMLInputElement>,
    certificateId: string,
    certificate: Certificate
  ): void => {
    if (!selectedCertifiates.includes(certificateId)) {
      setSelectedCertificates((prevSelected) => [
        ...prevSelected,
        certificateId
      ]);
      setSelectedCertificatesInformation((prevSelectedInformation) => [
        ...prevSelectedInformation,
        certificate
      ]);
    } else {
      setSelectedCertificates((prevSelected) =>
        prevSelected.filter((id) => id !== certificateId)
      );

      setSelectedCertificatesInformation((prevSelected) =>
        prevSelected.filter((cert) => cert.certificateID !== certificateId)
      );
    }
  };

  const handlePageChange = (_event: any, newPage: number): void => {
    setIsSorted(false);
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredCertificateOrders = applyFilters(certificates, filters);
  const paginatedCertificateOrders = applyPagination(
    filteredCertificateOrders,
    page,
    limit
  );
  const selectedSomeCertificateOrders =
    selectedCertifiates.length > 0 &&
    selectedCertifiates.length < certificates.length;
  const selectedAllCertificateOrders =
    selectedCertifiates.length === certificates.length;
  const theme = useTheme();

  const handleClickOpen = (certificate) => {
    setSelectedCertificate(certificate);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card>
      {selectedBulkActions && (
        <Box flex={1} p={2}>
          <BulkActions certificates={selectedCertifiatesInformation} />
        </Box>
      )}
      {!selectedBulkActions && (
        <CardHeader
          action={
            <Box width={400}>
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
                    <InputLabel>Certificate Name</InputLabel>
                    <Input
                      onChange={(e) =>
                        handleFilterChange('certificateName', e.target.value)
                      }
                      placeholder="Enter Certificate Name"
                    />
                  </FormControl>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Organization Name</InputLabel>
                    <Input
                      onChange={(e) =>
                        handleFilterChange('organizationName', e.target.value)
                      }
                      placeholder="Enter Received Name"
                    />
                  </FormControl>
                </div>
              </div>
            </Box>
          }
          title="Issued Certs"
        />
      )}
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedAllCertificateOrders}
                  indeterminate={selectedSomeCertificateOrders}
                  onChange={handleSelectAllCertificateOrders}
                />
              </TableCell>
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
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isSorted
              ? paginatedSortedData.map((certificate) => {
                  const isCertificateOrderSelected =
                    selectedCertifiates.includes(certificate.certificateID);
                  return (
                    <TableRow
                      hover
                      key={certificate.certificateID}
                      selected={isCertificateOrderSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isCertificateOrderSelected}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            handleSelectOneCertificateOrder(
                              event,
                              certificate.certificateID,
                              certificate
                            )
                          }
                          value={isCertificateOrderSelected}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {certificate.certificateCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          maxWidth={200}
                          gutterBottom
                          noWrap
                        >
                          {certificate.certificateName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {certificate.classification}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          align="center"
                          gutterBottom
                          noWrap
                        >
                          {certificate.yearOfGraduation}
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
                          {certificate.organizationName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                          align="center"
                        >
                          {new Date(
                            certificate.receivedDate
                          ).toLocaleDateString('en-GB')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View" arrow>
                          <IconButton
                            sx={{
                              '&:hover': {
                                background: theme.colors.info.lighter
                              },
                              color: theme.palette.info.main
                            }}
                            color="inherit"
                            size="small"
                            onClick={() => handleClickOpen(certificate)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              : paginatedCertificateOrders.map((certificate) => {
                  const isCertificateOrderSelected =
                    selectedCertifiates.includes(certificate.certificateID);
                  return (
                    <TableRow
                      hover
                      key={certificate.certificateID}
                      selected={isCertificateOrderSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isCertificateOrderSelected}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            handleSelectOneCertificateOrder(
                              event,
                              certificate.certificateID,
                              certificate
                            )
                          }
                          value={isCertificateOrderSelected}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {certificate.certificateCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          maxWidth={200}
                          gutterBottom
                          noWrap
                        >
                          {certificate.certificateName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {certificate.classification}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          align="center"
                          gutterBottom
                          noWrap
                        >
                          {certificate.yearOfGraduation}
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
                          {certificate.organizationName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                          align="center"
                        >
                          {new Date(
                            certificate.receivedDate
                          ).toLocaleDateString('en-GB')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View" arrow>
                          <IconButton
                            sx={{
                              '&:hover': {
                                background: theme.colors.info.lighter
                              },
                              color: theme.palette.info.main
                            }}
                            color="inherit"
                            size="small"
                            onClick={() => handleClickOpen(certificate)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
          count={filteredCertificateOrders.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 30]}
        />
      </Box>
      <SimpleDialog
        fullWidth={'md'}
        maxWidth={'800md'}
        open={open}
        onClose={handleClose}
        selectedCertifiate={selectedCertifiate}
      />
    </Card>
  );
};

ReceivedCertsOrdersTable.propTypes = {
  certificates: PropTypes.array.isRequired
};

ReceivedCertsOrdersTable.defaultProps = {
  certificates: []
};

export default ReceivedCertsOrdersTable;
