import { Certificate } from '@/models/certificate';
import styles from '../../../../styles/IssuedCerts.module.css';

import {
  Box,
  Card,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile'; 
import { ChangeEvent, useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';
import BulkActions from './BulkActions';
import axiosInstance from '@/lib/axiosIntance';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import CertDetail from './CertDetail';
import { enqueueSnackbar } from 'notistack';

interface Filters {
  status?: string;
  certificateName?: string;
  organizationName?: string;
  sorting: string;
  pageNumber: number;
  pageSize: number;
}

const columns = [
    { key: 'code', name: 'Code', sort: '', isSort: true, align: 'center'},
    { key: 'name', name: 'Certificate Name', sort: '', isSort: true, align: 'left'},
    { key: 'yearOfGraduation', name: 'Graduation Year', sort: '', isSort: true, align: 'center' },
    { key: 'issuerName', name: 'Organization Name', sort: '', isSort: true, align: 'left' },
    { key: 'receivedDate', name: 'Received Date', sort: '', isSort: true , align: 'center'}
];

function ReceivedCertsOrdersTable() {
  const [isTableLoading, setTableLoading] = useState<boolean>(true);
  const [selectedCertifiates, setSelectedCertificates] = useState<
    Certificate[]
  >([]);
  const [selectedCertifiate, setSelectedCertificate] = useState<Certificate>();
  const [data, setData] = useState<Certificate[]>([]);
  const [filters, setFilters] = useState<Filters>({
    certificateName: null,
    organizationName: null,
    sorting: '',
    pageNumber: 0,
    pageSize: 5
  });
  const [isResetFilter, setResetFilter] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let timeout = null;
    if (!isResetFilter) {
      timeout = setTimeout(() => {
        fetchData();
      }, 500);
    } else {
      fetchData();
      setResetFilter(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]);

  // #region function
  // handle select checkbox
  const handleSelectOne = (cert: Certificate): void => {
    setSelectedCertificates((prevList: Certificate[]) => {
      if (prevList.some((x) => x.id == cert.id)) {
        return prevList.filter((x) => x.id != cert.id);
      } else {
        return [...prevList, cert];
      }
    });
  };
  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void => {
    event.target.checked ? setSelectedCertificates(data) : setSelectedCertificates([]);
  };

  // view cert detail
  const handleOpenCert = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };
  const handleCloseCert = () => {
    setSelectedCertificate(null);
  };

  // download attachment
  const handleDownloadFile = async (certificate: Certificate) => {
    const ipfsGatewayUrl = `https://ipfs.io/ipfs/${certificate.attachmentIpfs}`;

    try {
      enqueueSnackbar('Downloading, please wait...', {variant: 'info'});
      const response = await fetch(ipfsGatewayUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch the file from IPFS');
      }

      const blob = await response.blob();
      const fileType = blob.type || 'application/octet-stream';
      const fileName = `downloaded-file.${fileType.split('/')[1] || 'bin'}`; 

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the temporary URL
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar(
        'Failed to download file. Please check the IPFS hash or try again.',
        { variant: 'error' }
      );
    }
  };
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
    if (filterName === 'certificateStatus') {
      setFilters((prevFilters) => ({
        ...prevFilters,
        certificateStatus: value !== 'all' ? value : null
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
  const resetData = () => {
    setResetFilter(true);
    setFilters({
      certificateName: null,
      organizationName: null,
      sorting: '',
      pageNumber: 0,
      pageSize: 5
    });
    setSelectedCertificates([]);
  };

  const fetchData = async () => {
    try {
      let input = { ...filters };
      input.pageNumber = filters.pageNumber + 1;
      setTableLoading(true);

      const response = await axiosInstance.post(
        '/Certificate/get-certificate-received',
        input
      );
      setTableLoading(false);
      if (response.status == HTTP_STATUS.OK) {
        const { data } = response.data;

        const lstCert = (data.items as Certificate[])?.map((x) => ({
          ...x,
          attachmentIpfs: x.attachmentJson
            ? JSON.parse(x.attachmentJson).ipfsLink
            : ''
        }));

        setData(lstCert);
        setTotalCount(data.totalCount);
      } else {
        setData([]);
      }
    } catch (error) {
      setTableLoading(false);
      console.error(error);
    }
  };
  // #endregion
  return (
    <Card>
      {selectedCertifiates.length > 0 ? (
        <Box flex={1} p={2}>
          <BulkActions
            certificates={selectedCertifiates}
            loadData={resetData}
          />
        </Box>
      ) : (
        <CardHeader
          action={
            <Box width={600}>
              <div className={styles.box_container}>
                <Tooltip title={'Reset'} arrow>
                  <Button onClick={resetData}>
                    <FaSpinner
                      size={22}
                      style={{
                        cursor: isTableLoading ? 'not-allowed' : 'pointer'
                      }}
                    />
                  </Button>
                </Tooltip>
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedCertifiates.length > 0 && selectedCertifiates.length === data.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
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
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((certificate) => {
                  const isSelectedCert = selectedCertifiates.some(
                    (x) => x.id === certificate.id
                  );
                  return (
                    <TableRow
                      hover
                      key={certificate.id}
                      selected={isSelectedCert}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isSelectedCert}
                          onChange={() => handleSelectOne(certificate)}
                          value={isSelectedCert}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {certificate.code}
                        </Typography>
                      </TableCell>
                      <TableCell align='left'>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          maxWidth={200}
                          gutterBottom
                          noWrap
                        >
                          {certificate.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {certificate.classification}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          align="center"
                          gutterBottom
                          noWrap
                        >
                          {certificate.graduationYear}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          align="left"
                          gutterBottom
                          noWrap
                        >
                          {certificate.issuerName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
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
                      <TableCell align="right">
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
                            onClick={() => handleOpenCert(certificate)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {certificate.attachmentIpfs && (
                        <Tooltip title="Download attachment" arrow>
                          <IconButton
                            sx={{
                              '&:hover': {
                                background: theme.colors.info.lighter
                              },
                              color: theme.palette.info.main
                            }}
                            size="small"
                            onClick={() => handleDownloadFile(certificate)}
                          >
                            <AttachFileIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Fade>
        )}
      </TableContainer>
      <Box p={2}>
        {!isTableLoading && (
          <TablePagination
            component="div"
            count={totalCount}
            onPageChange={handlePageNumberChange}
            onRowsPerPageChange={handlePageSizeChange}
            page={filters.pageNumber}
            rowsPerPage={filters.pageSize}
            rowsPerPageOptions={[5, 10, 25, 30]}
          />
        )}
      </Box>
      {selectedCertifiate && (
        <CertDetail
          open={selectedCertifiate != null}
          onClose={handleCloseCert}
          selectedCertificate={selectedCertifiate}
        />
      )}
    </Card>
  );
}

export default ReceivedCertsOrdersTable;
