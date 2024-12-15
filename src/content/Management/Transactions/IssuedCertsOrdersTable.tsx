import Label from '@/components/Label';
import { API_URL, PINATA_CLOUD_API } from '@/constants/appConstants';
import {
  Certificate,
  CertificateMulSign,
  CertificateStatus,
  SigningType
} from '@/models/certificate';
import {
  Asset,
  AssetMetadata,
  BrowserWallet,
  ForgeScript,
  Mint,
  Transaction
} from '@meshsdk/core';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import ListIcon from '@mui/icons-material/List';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import BlockIcon from '@mui/icons-material/Block';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import Loading from '@/components/Loading';
import { useStore } from '@/contexts/GlobalContext';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import axiosInstance from '@/lib/axiosIntance';
import { ContactStatus } from '@/models/contact';
import { textToHex } from '@/utils/helpers';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  Grid,
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
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { FaUndo } from 'react-icons/fa';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';
import slugify from 'slugify';
import styles from '../../../../styles/IssuedCerts.module.css';
import BulkActions from './BulkActions';
import CertDetail from './CertDetail';
import SignersTable from './SignersTable';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Filters {
  certificateStatus?: CertificateStatus;
  certificateName?: string;
  receivedName?: string;
  sorting?: string;
  issueGuid?: string;
  pageNumber: number;
  pageSize: number;
}

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

const columns = [
  { key: 'code', name: 'Code', sort: '', align: 'center', isSort: true },
  {
    key: 'name',
    name: 'Certificate Name',
    sort: '',
    align: 'left',
    isSort: true
  },
  {
    key: 'receiverName',
    name: 'Received Name',
    sort: '',
    align: 'left',
    isSort: true
  },
  { key: 'signedDate', name: 'Signed Date ', sort: '', align: 'center' },
  { key: 'signingType', name: 'Signing Type', align: 'center' }
];

function UploadFileModal({ certificate, open, onClose }) {
  const [input, setInput] = useState({
    attachment: undefined,
    attachmentName: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { handleChangeData } = useStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        setInput({
          attachment: base64String,
          attachmentName: file.name
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setInput({
          attachment: reader.result,
          attachmentName: file.name
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDeleteFile = () => {
    setInput({
      attachment: null,
      attachmentName: ''
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let body = { ...input, id: certificate.id };
      const result = await axiosInstance.post(
        '/Certificate/upload-attachment',
        body
      );
      setLoading(false);

      if (result.status === HTTP_STATUS.OK) {
        const { data } = result;
        if (!data.success) {
          enqueueSnackbar(data.message, {
            variant: 'error'
          });
        } else {
          enqueueSnackbar('Upload attachment successfully!', {
            variant: 'success'
          });
          handleChangeData(true);
          onClose();
        }
      }
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Upload attachment error, try again!', {
        variant: 'error'
      });
    }
  };

  return (
    <>
      {loading && <Loading />}
      <Dialog open={open} onClose={onClose}>
        <DialogTitle
          sx={{
            padding: '16px 24px',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            borderBottom: '1px solid #ddd'
          }}
        >
          Upload attachment
        </DialogTitle>
        <Box
          sx={{
            padding: 2,
            marginY: 2
          }}
        >
          <Grid container spacing={2}></Grid>
          <Grid item xs={12}>
            {!input.attachment && (
              <>
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
              </>
            )}

            {input.attachmentName && (
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
                    Selected File: <strong>{input.attachmentName}</strong>
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

function IssuedCertsOrdersTable() {
  const [isTableLoading, setTableLoading] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedCertifiates, setSelectedCertificates] = useState<
    Certificate[]
  >([]);
  const [selectedCertifiate, setSelectedCertificate] = useState<Certificate>();
  const [data, setData] = useState<Certificate[]>([]);
  const [isOpenSignerTable, setOpenSignerTable] = useState<boolean>(false);
  const [isOpenCertDetail, setOpenCertDetail] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    certificateStatus: null,
    certificateName: '',
    receivedName: '',
    sorting: '',
    pageNumber: 0,
    pageSize: 5
  });

  const [totalCount, setTotalCount] = useState<number>(0);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);
  const [openConfirmBan, setOpenConfirmBan] = useState<boolean>(false);
  const [issuerAddress, setIssuerAddress] = useState<string>();
  const [isResetFilter, setResetFilter] = useState<boolean>(false);
  const [openUpdateFile, setOpenUpdateFile] = useState<boolean>(false);
  const [certNote, setCertNote] = useState<string>();
  const { isChangeData, authToken, handleChangeData } = useStore();
  const theme = useTheme();

  // Xử lý debounce trong useEffect
  useEffect(() => {
    if (isResetFilter) {
      fetchData();
      setResetFilter(false);
      return;
    }

    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [filters]);

  useEffect(() => {
    if (isChangeData) {
      fetchData();
    }
  }, [isChangeData]);

  useEffect(() => {
    const getIssuerAddress = async () => {
      let address = '';
      const wallet = await BrowserWallet.enable('eternl');
      const lstUsedAddress = await wallet.getUsedAddresses();
      if (lstUsedAddress?.length > 0) {
        address = lstUsedAddress[0];
      }
      if (!address) {
        const lstUnUsedAddress = await wallet.getUnusedAddresses();
        if (lstUnUsedAddress?.length > 0) {
          address = lstUnUsedAddress[0];
        }
      }
      setIssuerAddress(address);
    };
    getIssuerAddress();
  }, []);

  // #region function
  // label status
  const getStatusLabel = (status: number) => {
    const statusMap = {
      1: { text: 'Draft', color: 'secondary' },
      2: { text: 'Signed', color: 'primary' },
      3: { text: 'Sent', color: 'success' },
      4: { text: 'Banned', color: 'error' },
      5: { text: 'Pending', color: 'info' }
    };

    const { text, color } = statusMap[status];
    return <Label color={color}>{text}</Label>;
  };

  const getStatusContactLabel = (contactStatus: ContactStatus): JSX.Element => {
    const statusMap: Record<ContactStatus, { text: string; color: any }> = {
      '1': { text: 'Pending', color: 'info' },
      '2': { text: 'Connected', color: 'success' }
    };

    const { text, color } = statusMap[contactStatus] ?? {
      text: 'Pending',
      color: 'info'
    };
    return <Label color={color}>{text}</Label>;
  };

  const getSigningTypeLabel = (certSigningType: SigningType) => {
    const signingTypes: Record<SigningType, { text: string; color: any }> = {
      '1': { text: 'Single Sign', color: 'secondary' },
      '2': { text: 'Multiple Sign', color: 'primary' }
    };

    const { text, color } = signingTypes[certSigningType] ?? {
      text: 'Unknown Sign Type',
      color: 'secondary'
    };

    return <Label color={color}>{text}</Label>;
  };

  const isEnableSign = (certificate: Certificate) => {
    if (!issuerAddress) {
      return false;
    }
    if (certificate.status === CertificateStatus.Draft) {
      return true;
    }
    if (issuerAddress === certificate.issuer.receiveAddress) {
      return false;
    }
    if (certificate.signingType === SigningType.MultipleSigning) {
      const signerList = JSON.parse(
        certificate.mulSignJson
      ) as CertificateMulSign[];
      const signer = signerList?.find((s) => s.issuerAddress === issuerAddress);
      return signer ? !signer.isSigned : false;
    }

    return false;
  };

  const isEnableSent = (certificate: Certificate) => {
    if (certificate.status >= CertificateStatus.Sent) {
      return false;
    }

    if (certificate.contactStatus != ContactStatus.Accepted) {
      return false;
    }

    if (certificate.signingType === SigningType.SingleSigning) {
      return certificate.status === CertificateStatus.Signed;
    } else {
      const signerList = JSON.parse(
        certificate.mulSignJson
      ) as CertificateMulSign[];
      return (
        issuerAddress == certificate.issuer.receiveAddress &&
        signerList?.every((x) => x.isSigned)
      );
    }
  };

  const isEnableBan = (certificate: Certificate) => {
    return (
      certificate.status == CertificateStatus.Sent &&
      certificate.issuer.receiveAddress == issuerAddress
    );
  };

  const hasPendingSignatures = (certificate: Certificate) => {
    if (certificate.status < CertificateStatus.Signed) {
      return false;
    }
    if (certificate.signingType == SigningType.MultipleSigning) {
      const signerList = JSON.parse(
        certificate.mulSignJson
      ) as CertificateMulSign[];

      return (
        issuerAddress == certificate.issuer.receiveAddress &&
        signerList?.some((x) => !x.isSigned)
      );
    }

    return false;
  };

  const isEnableSigner = (certificate: Certificate) => {
    return (
      certificate.signingType === SigningType.MultipleSigning &&
      certificate.issuer.receiveAddress === issuerAddress
    );
  };

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
    event.target.checked
      ? setSelectedCertificates(data)
      : setSelectedCertificates([]);
  };

  // view cert detail
  const handleOpenCert = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setOpenCertDetail(true);
  };
  const handleCloseCert = () => {
    setSelectedCertificate(null);
    setOpenCertDetail(false);
  };

  // open signer table
  const handleOpenSignerTable = (certificate: Certificate) => {
    setOpenSignerTable(true);
    setSelectedCertificate(certificate);
  };
  const handleCloseSignerTable = () => {
    setOpenSignerTable(false);
    setSelectedCertificate(null);
  };

  // open confirm delete
  const handleOpenConfirmDelete = (certificate: Certificate) => {
    setOpenConfirmDelete(true);
    setSelectedCertificate(certificate);
  };
  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setSelectedCertificate(null);
  };

  // open confirm ban
  const handleOpenConfirmBan = (certificate: Certificate) => {
    setOpenConfirmBan(true);
    setSelectedCertificate(certificate);
  };
  const handleCloseConfirmBan = () => {
    setOpenConfirmBan(false);
    setSelectedCertificate(null);
  };

  // handle update attachmant
  const handleShowUpdateFileModal = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setOpenUpdateFile(true);
  };
  const handelCloseUpdateFIleModal = () => {
    setOpenUpdateFile(false);
  };

  // download attachment
  const handleDownloadFile = async (certificate: Certificate) => {
    let gateway =
      PINATA_CLOUD_API ?? 'https://gold-fast-hamster-132.mypinata.cloud/ipfs/';
    const ipfsGatewayUrl = gateway + certificate.attachmentIpfs;

    try {
      enqueueSnackbar('Downloading, please wait...', { variant: 'info' });
      const response = await fetch(ipfsGatewayUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = certificate.attachmentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the temporary URL
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar('Failed to download file, try again.', {
        variant: 'error'
      });
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

    columns.forEach((x) => {
      if (x.key !== column.key) {
        x.sort = '';
      } else {
        x.sort = column.sort;
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
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]:
        filterName === 'certificateStatus' && value === 'all' ? null : value
    }));
  };
  // #endregion

  // #region API

  const resetData = () => {
    columns.forEach((column) => {
      column.sort = '';
    });
    setResetFilter(true);
    setSelectedCertificates([]);
    setFilters({
      certificateStatus: null,
      certificateName: null,
      receivedName: null,
      sorting: '',
      pageNumber: 0,
      pageSize: 5
    });
  };

  const fetchData = async () => {
    let input = { ...filters };
    input.pageNumber = filters.pageNumber + 1;
    try {
      setTableLoading(true);
      const response = await axiosInstance.post(
        '/Certificate/get-certificate-issued',
        input
      );
      setTableLoading(false);

      if (response.status == HTTP_STATUS.OK) {
        const { data } = response.data;

        const lstCert = (data.items as Certificate[])?.map((x) => {
          let attachment = x.attachmentJson ? JSON.parse(x.attachmentJson) : {};
          return {
            ...x,
            attachmentIpfs: attachment.ipfsLink ?? '',
            attachmentName: attachment.ipfsName ?? ''
          };
        });

        setData(lstCert);
        setTotalCount(data.totalCount);
        handleChangeData(false);
      } else {
        setData([]);
      }
    } catch (error) {
      setTableLoading(false);
      setData([]);
      console.error(error);
    }
  };

  async function signCert(certificate: Certificate) {
    if (!issuerAddress) {
      enqueueSnackbar('wallet not found', { variant: 'error' });
      return;
    }
    if (certificate.signingType == SigningType.SingleSigning) {
      handleSignCert(certificate);
    } else if (certificate.signingType == SigningType.MultipleSigning) {
      handleMultipleSignCert(certificate);
    }
  }

  async function handleSignCert(certificate: Certificate) {
    try {
      const wallet = await BrowserWallet.enable('eternl');
      const forgingScript = ForgeScript.withOneSignature(issuerAddress);
      const tx = new Transaction({ initiator: wallet });

      const assetMetadata: AssetMetadata = {
        certificateName: certificate.name,
        classification: certificate.classification,
        image: certificate.ipfsLink,
        mediaType: 'image/jpg',
        receivedName: certificate.receiver.name,
        yearOfGraduation: certificate.graduationYear,
        identity: certificate.receiverIdentityNumber
      };

      if (certificate.attachmentJson) {
        let attachment = JSON.parse(certificate.attachmentJson);
        assetMetadata['attachmentIpfs'] = attachment.ipfsLink;
        assetMetadata['attachmentHash'] = attachment.hash;
      }

      const asset: Mint = {
        assetName: `${slugify(certificate.receiver.name)}-${
          certificate.receiverIdentityNumber
        }`,
        assetQuantity: '1',
        metadata: assetMetadata,
        label: '721',
        recipient: issuerAddress
      };

      tx.mintAsset(forgingScript, asset);
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      await wallet.submitTx(signedTx);

      setLoading(true);
      await axiosInstance.post('/Certificate/sign-certificate', {
        certificateId: certificate.id,
        signingType: SigningType.SingleSigning,
        signHash: signedTx,
        issuerAddress: issuerAddress
      });
      setLoading(false);
      enqueueSnackbar('Sign Successful!', { variant: 'success' });
      fetchData();
    } catch (error) {
      setLoading(false);
      console.error('Signing error:', error);
      enqueueSnackbar('Sign Error!', { variant: 'error' });
    }
  }

  async function handleMultipleSignCert(certificate: Certificate) {
    try {
      const signerLst = JSON.parse(
        certificate.mulSignJson
      ) as CertificateMulSign[];
      let unsignedTx = '';

      const wallet = await BrowserWallet.enable('eternl');
      const tx = new Transaction({ initiator: wallet });

      if (certificate.issuer.receiveAddress == issuerAddress) {
        const forgingScript = ForgeScript.withOneSignature(issuerAddress);
        const assetMetadata: AssetMetadata = {
          certificateName: certificate.name,
          classification: certificate.classification,
          image: certificate.ipfsLink,
          mediaType: 'image/jpg',
          receivedName: certificate.receiver.name,
          yearOfGraduation: certificate.graduationYear,
          identity: certificate.receiverIdentityNumber
        };

        if (certificate.attachmentJson) {
          let attachment = JSON.parse(certificate.attachmentJson);
          assetMetadata['attachmentIpfs'] = attachment.ipfsLink;
          assetMetadata['attachmentHash'] = attachment.hash;
        }

        const asset: Mint = {
          assetName: `${slugify(certificate.receiver.name)}-${
            certificate.receiverIdentityNumber
          }`,
          assetQuantity: '1',
          metadata: assetMetadata,
          label: '721',
          recipient: issuerAddress
        };
        tx.mintAsset(forgingScript, asset);
        const signerAddresses =
          signerLst?.map((x) => x.issuerAddress).filter(Boolean) || [];
        tx.setRequiredSigners([issuerAddress, ...signerAddresses]);
        unsignedTx = await tx.build();
      } else {
        unsignedTx = certificate.signHash;
      }
      const signedTx = await wallet.signTx(unsignedTx, true);

      signerLst.forEach((signer) => {
        if (signer.issuerAddress === issuerAddress) {
          signer.isSigned = true;
        }
      });
      if (signerLst.every((signer) => signer.isSigned)) {
        await wallet.submitTx(signedTx);
      }
      // api cập nhật certificate
      setLoading(true);
      await axiosInstance.post('/Certificate/sign-certificate', {
        certificateId: certificate.id,
        signingType: SigningType.MultipleSigning,
        signHash: signedTx,
        issuerAddress: issuerAddress
      });

      setLoading(false);
      enqueueSnackbar('Sign Successful!', { variant: 'success' });
      fetchData();
    } catch (error) {
      console.log(error);
      setLoading(false);
      const regex = /missingSignatories/;
      if (regex.test(error)) {
        enqueueSnackbar('Not enough signatures', { variant: 'error' });
      } else {
        enqueueSnackbar('Signed error', { variant: 'error' });
      }
    }
  }

  async function handleSendCert(certificate: Certificate) {
    setLoading(true);
    try {
      const wallet = await BrowserWallet.enable('eternl');
      await wallet.getUsedAddresses();
      const policyId = await wallet.getPolicyIds();
      const tx = new Transaction({ initiator: wallet });

      const assetName = `${slugify(certificate.receiver.name)}-${
        certificate.receiverIdentityNumber
      }`;
      const asset: Asset = {
        unit: policyId[0] + textToHex(assetName),
        quantity: '1'
      };

      tx.sendAssets(certificate.receiverAddressWallet, [asset]);
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx, true);
      await wallet.submitTx(signedTx);

      const response = await fetch(API_URL + 'Certificate/send-certificate', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(certificate.id)
      });

      if (!response.ok) {
        throw new Error('Failed to send certificate: ' + response.statusText);
      }

      enqueueSnackbar('Send Successful!', { variant: 'success' });
      fetchData();
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      enqueueSnackbar('Send Error!', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCert() {
    setOpenConfirmDelete(false);
    try {
      if (selectedCertifiate.status === CertificateStatus.Sent) {
        enqueueSnackbar(
          'The certificate that has been sent cannot be deleted.',
          { variant: 'error' }
        );
        return;
      }

      setLoading(true);
      await axiosInstance.delete(`Certificate/${selectedCertifiate.id}`);
      setLoading(false);
      setData((prevItems) =>
        prevItems.filter((item) => item.id !== selectedCertifiate.id)
      );
      enqueueSnackbar('Delete Successful!', { variant: 'success' });
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('An error occurred while deleting the certificate.', {
        variant: 'error'
      });
    }
  }

  async function handleBanCert() {
    setOpenConfirmBan(false);
    try {
      setLoading(true);
      const response = await fetch(API_URL + 'Certificate/ban-certificate', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: selectedCertifiate.id,
          note: certNote
        })
      });
      if (!response.ok) {
        throw new Error('Failed to Ban certificate: ' + response.statusText);
      }

      enqueueSnackbar('Ban Successful!', { variant: 'success' });
      fetchData();
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      enqueueSnackbar('Ban Error!', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  // #endregion
  if (isLoading) {
    return <Loading />;
  }
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
                    <FaUndo
                      size={22}
                      style={{
                        cursor: isTableLoading ? 'not-allowed' : 'pointer'
                      }}
                    />
                  </Button>
                </Tooltip>
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
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={
                        selectedCertifiates.length > 0 &&
                        selectedCertifiates.length === data.length
                      }
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
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Contact status</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((certificate, index) => (
                  <TableRow
                    hover
                    key={index}
                    selected={selectedCertifiates.includes(certificate)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedCertifiates.includes(certificate)}
                        value={selectedCertifiates.includes(certificate)}
                        onChange={() => handleSelectOne(certificate)}
                      />
                    </TableCell>
                    <TableCell align="left">
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
                    <TableCell align="left">
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="text.primary"
                        gutterBottom
                        noWrap
                      >
                        {certificate.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {certificate.classification}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="text.primary"
                        gutterBottom
                        noWrap
                      >
                        {certificate.receiverName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="text.primary"
                        gutterBottom
                        noWrap
                      >
                        {certificate.signedDate
                          ? new Date(certificate.signedDate).toLocaleDateString(
                              'en-GB'
                            )
                          : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getSigningTypeLabel(certificate.signingType)}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusLabel(certificate.status)}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusContactLabel(certificate.contactStatus)}
                    </TableCell>
                    <TableCell align="right">
                      {isEnableSign(certificate) && (
                        <>
                          <Tooltip
                            title={
                              certificate.signingType ===
                                SigningType.MultipleSigning &&
                              certificate.issuer.receiveAddress ===
                                issuerAddress
                                ? 'Submit'
                                : 'Sign'
                            }
                            arrow
                          >
                            <IconButton
                              sx={{
                                '&:hover': {
                                  background: theme.colors.primary.lighter
                                },
                                color: theme.palette.primary.main
                              }}
                              size="small"
                              onClick={() => signCert(certificate)}
                            >
                              <EditTwoToneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {certificate.issuer.receiveAddress ==
                            issuerAddress && (
                            <>
                              <Tooltip title="Delete" arrow>
                                <IconButton
                                  sx={{
                                    '&:hover': {
                                      background: theme.colors.primary.lighter
                                    },
                                    color: theme.palette.error.main
                                  }}
                                  size="small"
                                  onClick={() =>
                                    handleOpenConfirmDelete(certificate)
                                  }
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <ConfirmDialog
                                open={openConfirmDelete}
                                title="Confirm Deletion"
                                description="Are you sure you want to delete this certificate? This action cannot be undone."
                                onConfirm={handleDeleteCert}
                                onCancel={handleCloseConfirmDelete}
                              />
                            </>
                          )}
                        </>
                      )}

                      {isEnableSent(certificate) && (
                        <Tooltip title="Send" arrow>
                          <IconButton
                            sx={{
                              '&:hover': {
                                background: theme.colors.primary.lighter
                              },
                              color: theme.palette.primary.main
                            }}
                            size="small"
                            onClick={() => handleSendCert(certificate)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {hasPendingSignatures(certificate) && (
                        <Tooltip title="Waiting for all signers to sign" arrow>
                          <IconButton
                            sx={{
                              opacity: 0.5,
                              color: theme.palette.primary.main,
                              cursor: 'default'
                            }}
                            size="small"
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View" arrow>
                        <IconButton
                          sx={{
                            '&:hover': {
                              background: theme.colors.info.lighter
                            },
                            color: theme.palette.info.main
                          }}
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
                      {!certificate.attachmentIpfs &&
                        certificate.issuer.receiveAddress == issuerAddress && (
                          <Tooltip title="Upload attachment" arrow>
                            <IconButton
                              sx={{
                                '&:hover': {
                                  background: theme.colors.warning.lighter
                                },
                                color: theme.palette.warning.main
                              }}
                              size="small"
                              onClick={() =>
                                handleShowUpdateFileModal(certificate)
                              }
                            >
                              <UploadFileIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                      {isEnableSigner(certificate) && (
                        <Tooltip title="Show Signer Table" arrow>
                          <IconButton
                            sx={{
                              '&:hover': {
                                background: theme.colors.info.lighter
                              },
                              color: theme.palette.info.main
                            }}
                            size="small"
                            onClick={() => handleOpenSignerTable(certificate)}
                          >
                            <ListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {isEnableBan(certificate) && (
                        <>
                          <Tooltip title="Ban" arrow>
                            <IconButton
                              sx={{
                                '&:hover': {
                                  background: theme.colors.primary.lighter
                                },
                                color: theme.palette.primary.main
                              }}
                              size="small"
                              onClick={() => handleOpenConfirmBan(certificate)}
                            >
                              <BlockIcon color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Dialog
                            open={openConfirmBan}
                            onClose={handleCloseConfirmBan}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                          >
                            <DialogTitle id="alert-dialog-title">
                              {'Are you sure to ban this certificate?'}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-description">
                                You can't undo this operation.
                              </DialogContentText>
                              <TextField
                                id="reason-input"
                                label="Note"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                onChange={(e) => setCertNote(e.target.value)}
                              />
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={() => handleCloseConfirmBan()}>
                                Disagree
                              </Button>
                              <Button onClick={() => handleBanCert()} autoFocus>
                                Agree
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
      {selectedCertifiate && isOpenCertDetail && (
        <CertDetail
          open={isOpenCertDetail}
          onClose={handleCloseCert}
          selectedCertificate={selectedCertifiate}
        />
      )}
      {selectedCertifiate && isOpenSignerTable && (
        <SignersTable
          open={isOpenSignerTable}
          onClose={handleCloseSignerTable}
          certificate={selectedCertifiate}
        />
      )}
      {selectedCertifiate && openUpdateFile && (
        <UploadFileModal
          certificate={selectedCertifiate}
          onClose={handelCloseUpdateFIleModal}
          open={openUpdateFile}
        />
      )}
    </Card>
  );
}

export default IssuedCertsOrdersTable;
