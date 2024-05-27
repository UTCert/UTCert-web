import Label from '@/components/Label';
import { API_URL } from '@/constants/appConstants';
import {
  Certificate,
  CertificateName,
  CertificateStatus,
  ContactStatus,
  ReceivedName
} from '@/models/certificate';
import {
  Asset,
  AssetMetadata,
  BrowserWallet,
  ForgeScript,
  Mint,
  Transaction
} from '@meshsdk/core';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
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
import { enqueueSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';
import styles from '../../../../styles/IssuedCerts.module.css';
import BulkActions from './BulkActions';

interface IssuedCertsOrdersTableProps {
  className?: string;
  certificates: Certificate[];
  fetchData: () => void;
}

interface Filters {
  certificateStatus?: CertificateStatus;
  certificateName?: CertificateName;
  receivedName?: ReceivedName;
}

const columns = [
  { key: 'certificateCode', name: 'Code' },
  { key: 'certificateName', name: 'Certificate Name' },
  { key: 'receivedName', name: 'Received name' },
  { key: 'signedDate', name: 'Date Signed ' }
];

const getStatusLabel = (certificateStatus: CertificateStatus): JSX.Element => {
  const map = {
    1: {
      text: 'Draft',
      color: 'secondary'
    },
    2: {
      text: 'Signed',
      color: 'primary'
    },
    3: {
      text: 'Sent',
      color: 'success'
    },
    4: {
      text: 'Banned',
      color: 'error'
    }
  };
  const { text, color }: any = map[certificateStatus];
  return <Label color={color}>{text}</Label>;
};

const getStatusContactLabel = (contactStatus: ContactStatus): JSX.Element => {
  const map = {
    '1': {
      text: 'Pending',
      color: 'info'
    },
    '2': {
      text: 'Connected',
      color: 'success'
    }
  };
  const { text, color }: any = map[contactStatus];
  return <Label color={color}>{text}</Label>;
};

const applyFilters = (
  certificates: Certificate[],
  filters: Filters
): Certificate[] => {
  return certificates.filter((certificate) => {
    let matches = true;

    if (
      filters.certificateStatus &&
      certificate.certificateStatus !== filters.certificateStatus
    ) {
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
      filters.receivedName &&
      !certificate.receivedName
        .toLowerCase()
        .includes(filters.receivedName.toLowerCase())
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
            src={selectedCertifiate.ipfsLink.replace(
              'ipfs://',
              'https://ipfs.io/ipfs/'
            )}
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

// table certs
const IssuedCertsOrdersTable: FC<IssuedCertsOrdersTableProps> = ({
  certificates,
  fetchData
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCertifiates, setSelectedCertificates] = useState<string[]>([]);
  const [selectedCertifiate, setSelectedCertificate] = useState<Certificate>();
  const [selectedCertifiatesInformation, setSelectedCertificatesInformation] =
    useState<Certificate[]>([]);
  const [selectDeleteCertificateId, setSelectDeleteCertificateId] =
    useState('');
  const [openDelete, setOpenDelete] = useState(false);

  const selectedBulkActions = selectedCertifiates.length > 0;
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [filters, setFilters] = useState<Filters>({
    certificateStatus: null,
    certificateName: null,
    receivedName: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortedCertificateOrders, setSortedCertificateOrders] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortColumn, setSortColumn] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [paginatedSortedData, setPaginatedSortedData] = useState([]);

  useEffect(() => {
    const filteredData = applyFilters(certificates, filters);
    const paginatedData = applyPagination(filteredData, page, limit);

    setFilteredData(filteredData);
    setPaginatedSortedData(paginatedData);
  }, [certificates, filters, page, limit]);

  const handleSort = async (column) => {
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

    const sortedData = [...certificates].sort((a, b) => {
      if (column === 'signedDate') {
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

    setSortedCertificateOrders(paginatedData);
    setSortDirection(newSortDirection);
    setSortColumn(column);
    setIsSorted(true);
  };

  const filteredCertificates = applyFilters(certificates, filters);
  const paginatedCertificateOrders = applyPagination(
    filteredCertificates,
    page,
    limit
  );

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

  const handleClickOpen = (certificate) => {
    setSelectedCertificate(certificate);
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
      id: 1,
      name: 'Draft'
    },
    {
      id: 2,
      name: 'Signed'
    },
    {
      id: 3,
      name: 'Sent'
    },
    {
      id: 4,
      name: 'Banned'
    }
  ];

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

  const handleSelectAllCertificateOrders = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedCertificates(
      event.target.checked
        ? paginatedCertificateOrders.map(
            (certificate) => certificate.certificateID
          )
        : []
    );
    setSelectedCertificatesInformation(
      event.target.checked ? paginatedCertificateOrders : []
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

  const selectedSomeCertificateOrders =
    selectedCertifiates.length > 0 &&
    selectedCertifiates.length < paginatedCertificateOrders.length;
  const selectedAllCertificateOrders =
    selectedCertifiates.length === paginatedCertificateOrders.length;
  const theme = useTheme();

  function handleSign(certificate: Certificate) {
    try {
      let myPromise = new Promise<void>(async function (myResolve, myReject) {
        const wallet = await BrowserWallet.enable('eternl');
        // prepare forgingScript
        const usedAddress = await wallet.getUsedAddresses();
        const address = usedAddress[0];
        const forgingScript = ForgeScript.withOneSignature(address);
        const tx = new Transaction({ initiator: wallet });
        // define asset#1 metadata
        const assetMetadata1: AssetMetadata = {
          certificateName: certificate.certificateName,
          classification: certificate.classification,
          image: certificate.ipfsLink,
          mediaType: 'image/jpg',
          receivedName: certificate.receivedName,
          yearOfGraduation: certificate.yearOfGraduation,
          identity: certificate.receivedIdentityNumber
        };
        const asset1: Mint = {
          assetName: certificate.certificateType + certificate.certificateCode,
          assetQuantity: '1',
          metadata: assetMetadata1,
          label: '721',
          recipient: address
        };
        console.log(asset1);
        console.log(assetMetadata1);

        tx.mintAsset(forgingScript, asset1);
        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);
        console.log('txHash');
        console.log(txHash);
        myResolve(); // when successful
        myReject(); // when error
      });

      // "Consuming Code" (Must wait for a fulfilled Promise)
      myPromise
        .then(function () {
          /* code if successful */
          fetch(API_URL + '/Certificate/issued/sign', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(certificate.certificateID)
          }).then(() => {
            // Xử lý phản hồi ở đây
            enqueueSnackbar('Sign Successful!', { variant: 'success' });
          });
        })
        .catch(function () {
          enqueueSnackbar('Sign Error!', { variant: 'error' });
        });
    } catch (error) {
      enqueueSnackbar('Sign Error!', { variant: 'error' });
    }
  }

  function textToHex(text) {
    let hex = '';

    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i).toString(16);
      hex += ('00' + charCode).slice(-2); // Ensure leading zero for single digit
    }

    return hex;
  }

  function handleBan(certificateId) {
    enqueueSnackbar('Ban Error!', { variant: 'error' });
    console.log(certificateId);
    // fetch(API_URL + '/Certificate/issued/ban', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(certificateId)
    // })
    //   .then(() => {
    //     // Xử lý phản hồi ở đây
    //     enqueueSnackbar('Ban Successful!', { variant: 'success' });
    //   })
    //   .catch(() => {
    //     // Xử lý lỗi ở đây
    //     enqueueSnackbar('Ban Error!', { variant: 'error' });
    //   });
  }

  function handleSelectDelete(certificateId) {
    setSelectDeleteCertificateId(certificateId);
    setOpenDelete(true);
  }

  function handleCloseDelete() {
    setOpenDelete(false);
  }

  function handleDelete(certificateId) {
    var certs = [];
    certs.push(certificateId);
    fetch(API_URL + '/Certificate/issued/delete-multiple', {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(certs)
    })
      .then(() => {
        // Xử lý phản hồi ở đây
        enqueueSnackbar('Delete Successful!', { variant: 'success' });
      })
      .catch(() => {
        // Xử lý lỗi ở đây
        enqueueSnackbar('Delete Error!', { variant: 'error' });
      });
    setOpenDelete(false);
  }

  async function handleSend(certificate) {
    let myPromise = new Promise<void>(async function (myResolve, myReject) {
      const wallet = await BrowserWallet.enable('eternl');
      // prepare forgingScript
      await wallet.getUsedAddresses();
      const policyId = await wallet.getPolicyIds();
      const tx = new Transaction({ initiator: wallet });
      // define asset#1 metadata
      const assetName = textToHex(
        certificate.certificateType + certificate.certificateCode
      );
      const asset1: Asset = {
        unit: policyId[0] + assetName,
        quantity: '1'
      };
      console.log(certificate.receivedAddressWallet);

      tx.sendAssets(certificate.receivedAddressWallet, [asset1]);
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      console.log('txHash');
      console.log(txHash);
      myResolve(); // when successful
      myReject(); // when error
    });

    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise
      .then(function () {
        /* code if successful */
        fetch(API_URL + '/Certificate/issued/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(certificate.certificateID)
        })
          .then(() => {
            // Xử lý phản hồi ở đây
            enqueueSnackbar('Send Successful!', { variant: 'success' });
          })
          .catch((error) => {
            // Xử lý lỗi ở đây
            console.log(error);
            enqueueSnackbar('Send Error!', { variant: 'error' });
          });
      })
      .catch(function () {
        enqueueSnackbar('Send Error!', { variant: 'error' });
      });
  }

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
            <Box width={600}>
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
                      value={filters.certificateStatus || 'all'}
                      onChange={(e) =>
                        handleFilterChange('certificateStatus', e.target.value)
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
                    <InputLabel>Certificate Name</InputLabel>
                    <Input
                      onChange={(e) =>
                        handleFilterChange('certificateName', e.target.value)
                      }
                      placeholder="Enter Certificate Name"
                    />
                  </FormControl>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Received Name</InputLabel>
                    <Input
                      onChange={(e) =>
                        handleFilterChange('receivedName', e.target.value)
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
              <TableCell align="right">Certificate status</TableCell>
              <TableCell align="right">Contact status</TableCell>
              <TableCell align="right"></TableCell>
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
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {certificate.receivedName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {new Date(certificate.signedDate).toLocaleDateString(
                            'en-GB'
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {getStatusLabel(certificate.certificateStatus)}
                      </TableCell>
                      <TableCell align="right">
                        {getStatusContactLabel(certificate.contactStatus)}
                      </TableCell>
                      <TableCell align="right">
                        {certificate.certificateStatus == 1 ? (
                          <>
                            <Tooltip title="Sign" arrow>
                              <IconButton
                                sx={{
                                  '&:hover': {
                                    background: theme.colors.primary.lighter
                                  },
                                  color: theme.palette.primary.main
                                }}
                                color="inherit"
                                size="small"
                                onClick={() => handleSign(certificate)}
                              >
                                <EditTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                sx={{
                                  '&:hover': {
                                    background: theme.colors.primary.lighter
                                  },
                                  color: theme.palette.error.main
                                }}
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleSelectDelete(certificate.certificateID)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : certificate.certificateStatus == 2 ? (
                          certificate.contactStatus == '2' ? (
                            <Tooltip title="Send" arrow>
                              <IconButton
                                sx={{
                                  '&:hover': {
                                    background: theme.colors.primary.lighter
                                  },
                                  color: theme.palette.primary.main
                                }}
                                color="inherit"
                                size="small"
                                onClick={() => handleSend(certificate)}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <></>
                          )
                        ) : certificate.certificateStatus == 3 ? (
                          <Tooltip title="Ban" arrow>
                            <IconButton
                              sx={{
                                '&:hover': {
                                  background: theme.colors.primary.lighter
                                },
                                color: theme.palette.primary.main
                              }}
                              color="error"
                              size="small"
                              onClick={() =>
                                handleBan(certificate.certificateID)
                              }
                            >
                              <BlockIcon color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <></>
                        )}
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
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {certificate.receivedName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {new Date(certificate.signedDate).toLocaleDateString(
                            'en-GB'
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {getStatusLabel(certificate.certificateStatus)}
                      </TableCell>
                      <TableCell align="right">
                        {getStatusContactLabel(certificate.contactStatus)}
                      </TableCell>
                      <TableCell align="right">
                        {certificate.certificateStatus == 1 ? (
                          <>
                            <Tooltip title="Sign" arrow>
                              <IconButton
                                sx={{
                                  '&:hover': {
                                    background: theme.colors.primary.lighter
                                  },
                                  color: theme.palette.primary.main
                                }}
                                color="inherit"
                                size="small"
                                onClick={() => handleSign(certificate)}
                              >
                                <EditTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                sx={{
                                  '&:hover': {
                                    background: theme.colors.primary.lighter
                                  },
                                  color: theme.palette.error.main
                                }}
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleSelectDelete(certificate.certificateID)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : certificate.certificateStatus == 2 ? (
                          certificate.contactStatus == '2' ? (
                            <Tooltip title="Send" arrow>
                              <IconButton
                                sx={{
                                  '&:hover': {
                                    background: theme.colors.primary.lighter
                                  },
                                  color: theme.palette.primary.main
                                }}
                                color="inherit"
                                size="small"
                                onClick={() => handleSend(certificate)}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <></>
                          )
                        ) : certificate.certificateStatus == 3 ? (
                          <Tooltip title="Ban" arrow>
                            <IconButton
                              sx={{
                                '&:hover': {
                                  background: theme.colors.primary.lighter
                                },
                                color: theme.palette.primary.main
                              }}
                              color="error"
                              size="small"
                              onClick={() =>
                                handleBan(certificate.certificateID)
                              }
                            >
                              <BlockIcon color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <></>
                        )}
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
          count={filteredCertificates.length}
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
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Are you sure to delete this certificate?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You can't undo this operation
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Disagree</Button>
          <Button
            onClick={() => handleDelete(selectDeleteCertificateId)}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

IssuedCertsOrdersTable.propTypes = {
  certificates: PropTypes.array.isRequired
};

IssuedCertsOrdersTable.defaultProps = {
  certificates: []
};

export default IssuedCertsOrdersTable;
