import { useEffect, useState } from 'react';
import { Alert, AlertColor, Avatar, Dialog, DialogContent, Snackbar } from '@mui/material';
// import bg from '@/public/background.jpg'
import {
  Card,
  Text,
  Input,
  Row,
  Container,
} from '@nextui-org/react';

import axiosInstance from '@/lib/axiosIntance';
import { CardContent, Checkbox, Box, FormControlLabel, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import UploadTwoToneIcon from '@mui/icons-material/UploadTwoTone';
import GetCookie from '@/hooks/getCookie';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import Loading from '@/components/Loading';
import { useStore } from '@/contexts/GlobalContext';

const ButtonUploadWrapper = styled(Box)(
  ({ theme }) => `

    .MuiIconButton-root {
      border-radius: 5%;
      width: 375px;
      background: ${theme.colors.primary.main};
      color: ${theme.palette.primary.contrastText};
      box-shadow: ${theme.colors.shadows.primary};
  
      &:hover {
        background: ${theme.colors.primary.dark};
      }
    }
`
);

function Register() {
  const [nameValue, setNameValue] = useState("");
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean; message: string; severity: AlertColor } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { handleGetUser, handleSetToken} = useStore();
  const router = useRouter();

  const handleNameChange = (event: any) => {
    setNameValue(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileValue(selectedFile);
      // Tạo URL preview cho file đã chọn
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
  };

  const handleOpenPreview = () => {
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

    const registerAccount = async () => {
        if (nameValue === "" || nameValue === null) {
            setAlertInfo({ isOpen: true, message: "You must enter name!", severity: "error" });
            return;
        }
        if (fileValue === null) {
            setAlertInfo({ isOpen: true, message: "You must select a logo!", severity: "error" });
            return;
        }
        if (!isChecked) {
            setAlertInfo({ isOpen: true, message: "You have to confirm policy!", severity: "error" });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', nameValue);
            formData.append('stakeId', GetCookie('stakeId'));
            formData.append("receiveAddress", GetCookie("receiveAddress")); 
            if (fileValue) {
                formData.append('avatarUri', fileValue);
            }

            setLoading(true);
            const res = await axiosInstance.post('/User/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === HTTP_STATUS.OK) {
                const { data: authResponse } = await axiosInstance.get(`User/authenticate`, {
                    params: { stakeId: GetCookie('stakeId') }
                });

                setLoading(false);
                if (authResponse.success) {
                    setAlertInfo({ isOpen: true, message: 'Register Account Successfully!', severity: "success" });
                    handleSetToken(authResponse.data.jwtToken);
                    await handleGetUser();
                    setTimeout(() => router.push('/dashboards/home'), 300);
                }
            } else {
                throw new Error('Registration failed');
            }

        } catch (error) {
            setLoading(false);
            console.error('Registration failed:', error);
            setAlertInfo({ isOpen: true, message: 'Registration failed. Please try again.', severity: "error" });
        }
    }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      <div style={{
        backgroundImage: `url(https://res.cloudinary.com/dgkr0cmla/image/upload/v1685119889/background_r0uspa.jpg)`,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}>
         {loading && <Loading />}
        <Container
          display="flex"
          alignItems="center"
          justify="center"
          css={{ minHeight: '100vh' }}
        >
          {alertInfo && (
            <Snackbar 
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
              open={alertInfo.isOpen} 
              autoHideDuration={6000} 
              onClose={() => setAlertInfo(null)}
            >
              <Alert severity={alertInfo.severity} onClose={() => setAlertInfo(null)} sx={{ mb: 2 }}>
                {alertInfo.message}
              </Alert>
            </Snackbar>
          )}
          <Card css={{ mw: '420px', p: '20px' }} variant="bordered">
            <Text
              size={24}
              weight="bold"
              css={{
                as: 'center',
                mb: '20px',
              }}
            >
              YOUR INFOMATION
            </Text>
            <Text size={18} weight="bold">Your name</Text>
            <Input
              clearable
              underlined
              fullWidth
              color="primary"
              size="lg"
              placeholder="Nguyen Van An"
              value={nameValue}
              onChange={handleNameChange}
            />
            {previewUrl && (
              <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  src={previewUrl}
                  alt="Preview"
                  sx={{ width: 100, height: 100, cursor: 'pointer' }}
                  onClick={handleOpenPreview}

                />
                 <Typography variant="caption" mt={1}>
                  {fileValue?.name}
                </Typography>
              </Box>
            )}
            <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md">
              <DialogContent>
                <img src={previewUrl || ''} alt="Preview" style={{ width: '100%', height: 'auto' }} />
              </DialogContent>
            </Dialog>
            <Text size={18} weight="bold"> {!fileValue && 'Upload your logo'}
              <ButtonUploadWrapper>
                <Input
                  accept="image/*"
                  id="icon-button-file"
                  name="icon-button-file"
                  type="file"
                  onChange={handleFileChange}
                  hidden
                />
                <label htmlFor="icon-button-file">
                  <IconButton component="span" color="primary" size='small'>
                    Select file
                    <UploadTwoToneIcon />
                  </IconButton>
                </label>
              </ButtonUploadWrapper>
            </Text>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Before using our services, please read and agree to the following terms and conditions.</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <CardContent style={{ padding: '0px', margin: '0px' }}> 
                    <Text size={13}>
                      1. I certify that all the information I provide during the registration process is accurate, complete, and not deceptive.
                    </Text>
                    <Text size={13}>
                      2. I will keep my password secure and not share my account information with anyone else.
                    </Text>
                    <Text size={13}>
                      3. I agree that the use of blockchain services will comply with current local and international regulations and laws.
                    </Text>
                    <Text size={13}>
                      4. I agree that my transactions on the blockchain will be subject to the conditions and regulations specified in the blockchain system.
                    </Text>
                    <Text size={13}>
                      5. I certify that I am the lawful owner of my blockchain account and will not use the service to engage in illegal or unlawful activities.
                    </Text>
                    <Text size={13}>
                      6. I agree that blockchain is not responsible for any damages or losses arising from my failure to comply with these terms and conditions or from technical errors or other issues on the blockchain system.
                    </Text>
                  </CardContent>
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Row justify="space-between">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    id="policy"
                  />
                }
                label={<Typography variant="body1">I Agree</Typography>}
                htmlFor="policy"
              />
            </Row>
            <Button variant="contained" onClick={registerAccount}>Confirm</Button>
          </Card>
        </Container>
      </div>
    </>
  );
}

export default Register;
