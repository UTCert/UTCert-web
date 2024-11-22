import { useEffect, useState } from 'react';

import GetCookie from '@/hooks/getCookie';
import axiosInstance from '@/lib/axiosIntance';
import { Certificate, CertificateMulSign, CertificateStatus, SigningType } from '@/models/certificate';
import { cloneDeep, textToHex } from '@/utils/helpers';
import { Asset, AssetMetadata, BrowserWallet, ForgeScript, Mint, Transaction } from '@meshsdk/core';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';
import QRCode from 'react-qr-code';
import slugify from 'slugify';
import Loading from '@/components/Loading';

const ButtonError = styled(Button)(
    ({ theme }) => `
     background: ${theme.colors.error.main};
     color: ${theme.palette.error.contrastText};

     &:hover {
        background: ${theme.colors.error.dark};
     }
    `
);

const ButtonView = styled(Button)(
    ({ theme }) => `
     background: ${theme.colors.info.main};
     color: ${theme.palette.info.contrastText};

     &:hover {
        background: ${theme.colors.info.dark};
     }
    `
);

const ButtonGen = styled(Button)(
    ({ theme }) => `
     background: ${theme.colors.secondary.light};
     color: ${theme.palette.secondary.contrastText};

     &:hover {
        background: ${theme.colors.secondary.dark};
     }
    `
);


function DialogViewCerts(props: any) {
    const { open, onClose, certificates } = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const handlePrevClick = () => {
        setCurrentIndex((currentIndex - 1 + certificates.length) % certificates.length);
    };

    const handleNextClick = () => {
        setCurrentIndex((currentIndex + 1) % certificates.length);
    };

    if (!certificates || certificates.length === 0) {
        return null;
    }

    if(!certificates) {
        return <></>
    }
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg">
        <DialogContent
          style={{
            display: 'grid',
            gridTemplateColumns: '6fr 4fr',
            alignItems: 'center'
          }}
        >
          <div>
            <img
              src={certificates[currentIndex].imageLink}
              alt="Ảnh"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              fontSize: '15px',
              backgroundColor: 'Background'
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: 'red',
                fontWeight: 'bold',
                fontSize: '18px'
              }}
            >
              {certificates[currentIndex].status == CertificateStatus.Banned
                ? 'This certificate is illegal'
                : ''}
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
              <p style={{ fontWeight: 'bold' }}>CODE:</p>
              <p>{certificates[currentIndex].code}</p>
              <p style={{ fontWeight: 'bold' }}>ORGANIZATION :</p>
              <p>{certificates[currentIndex].issuerName}</p>
              <p
                style={{
                  fontWeight: 'bold',
                  borderBottom: '1px solid #000',
                  paddingBottom: '5px'
                }}
              >
                DATE RECEIVED:
              </p>
              <p style={{ borderBottom: '1px solid #000' }}>
                {certificates[currentIndex].receivedDate
                  ? new Date(
                      certificates[currentIndex].receivedDate
                    ).toLocaleDateString('en-GB')
                  : ''}
              </p>
              <p style={{ fontWeight: 'bold', marginTop: '0px' }}>
                RECEIVED IDENTITY:
              </p>
              <p style={{ marginTop: '0px' }}>
                {certificates[currentIndex].receiverIdentityNumber}
              </p>
              <p style={{ fontWeight: 'bold' }}>RECEIVED NAME:</p>
              <p>{certificates[currentIndex].receiverName}</p>
            </div>
            <div
              style={{
                textAlign: 'center',
                color: 'red',
                fontWeight: 'bold',
                fontSize: '18px'
              }}
            >
              {certificates[currentIndex].status == CertificateStatus.Banned
                ? 'This certificate is illegal'
                : ''}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px'
            }}
          >
            <Button onClick={handlePrevClick}>Prev</Button>
            <Button onClick={handleNextClick}>Next</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
}

interface BulkActionProps {
    certificates: Certificate[],
    loadData: () => void;
}

function BulkActions({ certificates, loadData }: BulkActionProps) {
    const [openCerts, setOpenCerts] = useState<boolean>(false);
    const [openQr, setOpenQr] = useState<boolean>(false);
    const [selectedCertificates, setSelectedCertificates] = useState<Certificate[]>([]);
    const [qrCode, setQrCode] = useState('');
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [openConfirmBan, setOpenConfirmBan] = useState<boolean>(false);
    const [issuerAddress, setIssuerAddress] = useState<string>();
    const [isLoading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setSelectedCertificates(certificates);
    }, [certificates]);

    useEffect(() => {
        const getIssuerAddress = async () => {
          const wallet = await BrowserWallet.enable('eternl');
          const [address] = await wallet.getUsedAddresses();
          setIssuerAddress(address);
        };
    
        getIssuerAddress();
      }, []);

    // handle sign certs
    const handleSignSelectedCertificates = async () => {
        try {
            let lstCert = selectedCertificates.filter(x => isEnableSign(x));
            let inputs = []; 
            for (let i = 0; i < lstCert.length; i++) {
                let signHash = ""; 
                if (certificates[i].signingType == SigningType.SingleSigning) {
                    signHash = await handleSignCert(certificates[i])
                } else if (certificates[i].signingType == SigningType.MultipleSigning) {
                    signHash = await handleMultipleSignCert(certificates[i]);
                }
                if(signHash) {
                    inputs.push({
                        certificateId: certificates[i].id,
                        signingType: certificates[i].signingType,
                        signHash: signHash,
                        issuerAddress: issuerAddress
                      })
                } 
            }

            if(inputs.length > 0) {
                setLoading(true);
                await axiosInstance.post('/Certificate/sign-multiple-certificates', inputs);
                setLoading(false);
                enqueueSnackbar('Sign Successful!', { variant: 'success' });
                loadData(); 
            }


        } catch (error) {
            setLoading(false);
            console.error('Signing error:', error);
            enqueueSnackbar('Sign Error!', { variant: 'error' });
        }
    }
    const handleSignCert = async (certificate: Certificate): Promise<string> => {
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
      return signedTx;
    };

    const handleBanSelectedCertificates = async () => {
        try {
            let inputs = selectedCertificates.filter(x => isEnableBan(x)).map(x => x.id);
            if(inputs.length > 0) {
                setLoading(true);
                await axiosInstance.post('/Certificate/ban-multiple-certificates', inputs);
                setLoading(false);
                enqueueSnackbar('Ban Successful!', { variant: 'success' });
                loadData(); 
            }

        } catch (error) {
            setLoading(false);
            console.error('Ban error:', error);
            enqueueSnackbar('Ban Error!', { variant: 'error' });
        }
    }
    
    // handle multiple send certs
    const handleMultipleSendCerts = async () => {
        try {
            let lstCert = selectedCertificates.filter(x => isEnableSent(x));
            for(let cert of lstCert) {
                await handleSendCert(cert); 
            }
            
            if(lstCert.length > 0) {
                setLoading(true);
                await axiosInstance.post('/Certificate/send-multiple-certificates', lstCert.map(x => x.id));
                setLoading(false);
                enqueueSnackbar('Send Successful!', { variant: 'success' });
                loadData(); 
            }
        } catch (error) {
            setLoading(false);
            console.error('Sending error:', error);
            enqueueSnackbar('Send Error!', { variant: 'error' });
        } 
    }
    async function handleSendCert(certificate: Certificate) {
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
    } 

    // check cert status
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
        const signer = signerList?.find(
          (s) => s.issuerAddress === issuerAddress
        );
        return signer ? !signer.isSigned : false;
      }

      return false;
    };
    const isEnableSent = (certificate: Certificate) => {
      if (certificate.status >= CertificateStatus.Sent) {
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
        return certificate.status == CertificateStatus.Sent && certificate.issuer.receiveAddress == issuerAddress; 
    }

    // delete certs
    const handleOpenConfirmDelete = () => {
        setOpenConfirmDelete(true);
    }
    const handleCloseConfirmDelete = () => {
        setOpenConfirmDelete(false);
    }
    const handleOpenConfirmBan = () => {
      setOpenConfirmBan(true);
    };
    const handleCloseConfirmBan = () => {
      setOpenConfirmBan(false);
    };

    const handleDeleteSelectedCertificates = async () => {
        setOpenConfirmDelete(false);
        try {
            const certificatesId: string[] = [];
            for (let index = 0; index < selectedCertificates.length; index++) {
                certificatesId.push(certificates[index].id)
            }

            const res = await axiosInstance.post('/Certificate/delete-multiple-cert', {
                data: { certificatesId }
            });
            if (res) {
                enqueueSnackbar('Delete Successful!', { variant: 'success' });
            } else {
                enqueueSnackbar('Delete Error!', { variant: 'error' });
            }
        } catch (err) {
            enqueueSnackbar('Delete Error!', { variant: 'error' });
        }
    }

    const handleMultipleSignCert = async (certificate: Certificate): Promise<string> => {
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
        return signedTx;
      };

    // View certs
    const handleViewCerts = () => {
        setOpenCerts(true);
    }
    const handleCloseCerts = () => {
        setOpenCerts(false);
    }

    // Qrcode
    const handleGenQrCertificateSelecteds = () => {
        let stakeId: string = GetCookie('stakeId')
        setQrCode('https://utcert.vercel.app/?q=' + encryptVigenere(stakeId, 'KEYWORD'));
        setOpenQr(true);
    }
    const handleCloseQr = () => {
        setOpenQr(false);
    };

    // Vigenère encode
    const encryptVigenere = (plaintext: string, key: string): string => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_,0123456789';
        const plaintextUpper = plaintext.toUpperCase();
        const keyUpper = key.toUpperCase();
        let ciphertext = '';

        for (let i = 0; i < plaintext.length; i++) {
            const plaintextChar = plaintextUpper[i];
            const keyChar = keyUpper[i % key.length];

            if (alphabet.includes(plaintextChar)) {
                const plaintextIndex = alphabet.indexOf(plaintextChar);
                const keyIndex = alphabet.indexOf(keyChar);
                const encryptedIndex = (plaintextIndex + keyIndex) % alphabet.length;
                const encryptedChar = alphabet[encryptedIndex];
                ciphertext += encryptedChar;
            } else {
                ciphertext += plaintextChar;
            }
        }

        return ciphertext;
    }

    if (isLoading) {
        return <Loading />;
      }
    return (
        <>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                    <Typography variant="h5" color="text.secondary">
                        Bulk actions:
                    </Typography>
                    <ButtonGen
                        sx={{ ml: 1 }}
                        startIcon={<QrCodeScannerIcon />}
                        variant="contained"
                        onClick={() => (handleGenQrCertificateSelecteds())}
                    >
                        Generate QR
                    </ButtonGen>
                    <ButtonView
                        sx={{ ml: 1 }}
                        startIcon={<VisibilityIcon />}
                        variant="contained"
                        onClick={() => (handleViewCerts())}
                    >
                        View
                    </ButtonView>
                    {selectedCertificates.filter(x => isEnableSign(x)).length > 0 &&
                       <>
                            <Tooltip
                                title={`${selectedCertificates.filter(x => isEnableSign(x)).length} certificates signing`} 
                                arrow
                            >
                                <ButtonView
                                    sx={{ ml: 1 }}
                                    startIcon={<EditTwoToneIcon />}
                                    variant="contained"
                                    onClick={() => (handleSignSelectedCertificates())}
                                >
                                    Sign
                                </ButtonView>
                            </Tooltip>
                       </>
                    }
                    {selectedCertificates.filter(x => isEnableSent(x)).length > 0 &&
                        <Tooltip 
                            title={`${selectedCertificates.filter(x => x.status == CertificateStatus.Signed && isEnableSent(x)).length} certificates sending`} 
                            arrow
                        >
                        <Button
                            sx={{ ml: 1 }}
                            startIcon={<SendIcon />}
                            variant="contained"
                            onClick={() => handleMultipleSendCerts()}
                        >
                            Send
                        </Button>
                    </Tooltip>}
                    {selectedCertificates.filter(x => isEnableBan(x)).length > 0 &&
                        <Tooltip 
                            title={`${selectedCertificates.filter(x => isEnableBan(x)).length} certificates banning`} 
                            arrow
                        >
                        <ButtonError
                                sx={{ ml: 1 }}
                                startIcon={<DeleteIcon />}
                                variant="contained"
                                onClick={() => handleOpenConfirmBan()}
                            >
                                Ban
                            </ButtonError>
                    </Tooltip>}
                    {selectedCertificates.filter(x => x.status == CertificateStatus.Draft).length > 0 && 
                        <Tooltip   
                        title={`${selectedCertificates.filter(x => x.status == CertificateStatus.Draft).length} certificates deleting`} 
                        arrow>
                            <ButtonError
                                sx={{ ml: 1 }}
                                startIcon={<DeleteIcon />}
                                variant="contained"
                                onClick={() => handleOpenConfirmDelete()}
                            >
                                Delete
                            </ButtonError>
                        </Tooltip>
                    }
                </Box>
            </Box>

            <DialogViewCerts
                open={openCerts}
                onClose={handleCloseCerts}
                certificates={selectedCertificates}
            />

            <Dialog
                open={openQr}
                onClose={handleCloseQr}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Your certifiates code here"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ marginBottom: "10px" }}>
                            <QRCode
                                size={300}
                                bgColor="white"
                                fgColor="black"
                                value={qrCode}
                            />
                        </div>
                        <TextField
                            id="outlined-read-only-input"
                            label="QR Code"
                            defaultValue={qrCode}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseQr}>Confirm</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openConfirmDelete}
                onClose={handleCloseConfirmDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure to delete this certificates?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You can't undo this operation
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDelete}>Disagree</Button>
                    <Button onClick={() => handleDeleteSelectedCertificates()} autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openConfirmBan}
                onClose={handleCloseConfirmBan}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure to ban this certificates?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You can't undo this operation
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmBan}>Disagree</Button>
                    <Button onClick={() => handleBanSelectedCertificates()} autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default BulkActions;
