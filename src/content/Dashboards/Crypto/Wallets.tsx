import axiosInstance from '@/lib/axiosIntance';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  alpha,
  styled
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

const AvatarWrapper = styled(Avatar)(
  ({ theme }) => `
    margin: ${theme.spacing(2, 0, 1, -0.5)};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${theme.spacing(1)};
    padding: ${theme.spacing(0.5)};
    border-radius: 60px;
    height: ${theme.spacing(5.5)};
    width: ${theme.spacing(5.5)};
    background: ${
      theme.palette.mode === 'dark'
        ? theme.colors.alpha.trueWhite[30]
        : alpha(theme.colors.alpha.black[100], 0.07)
    };
  
    img {
      background: ${theme.colors.alpha.trueWhite[100]};
      padding: ${theme.spacing(0.5)};
      display: block;
      border-radius: inherit;
      height: ${theme.spacing(4.5)};
      width: ${theme.spacing(4.5)};
    }
`
);

// const AvatarAddWrapper = styled(Avatar)(
//   ({ theme }) => `
//         background: ${theme.colors.alpha.black[10]};
//         color: ${theme.colors.primary.main};
//         width: ${theme.spacing(8)};
//         height: ${theme.spacing(8)};
// `
// );

// const CardAddAction = styled(Card)(
//   ({ theme }) => `
//         border: ${theme.colors.primary.main} dashed 1px;
//         height: 100%;
//         color: ${theme.colors.primary.main};
//         transition: ${theme.transitions.create(['all'])};

//         .MuiCardActionArea-root {
//           height: 100%;
//           justify-content: center;
//           align-items: center;
//           display: flex;
//         }

//         .MuiTouchRipple-root {
//           opacity: .2;
//         }

//         &:hover {
//           border-color: ${theme.colors.alpha.black[70]};
//         }
// `
// );

function Wallets() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get('/Home'); 
      setIsLoading(false);
      if(res.data.success) {
        setData(res.data.data); 
      }
    } catch (error) {
      setIsLoading(false);
      enqueueSnackbar('Something wrong!', { variant: 'error' });
    }
  }

  if (isLoading || !data) {
    return (
      <>
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={800}
          height={200}
        />
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            pb: 3
          }}
        >
          <Typography variant="h3">Issued Credential</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} md={3} item>
            <Card
              sx={{
                px: 1
              }}
            >
              <CardContent>
                <AvatarWrapper>
                  <img
                    alt="Draft"
                    src="/static/images/placeholders/logo/draft.png"
                  />
                </AvatarWrapper>
                <Typography variant="h5" noWrap>
                  Draft
                </Typography>
                <Box
                  sx={{
                    pt: 3
                  }}
                >
                  <Typography variant="h3" gutterBottom noWrap>
                    {data.draft}
                  </Typography>
                  <Typography variant="subtitle2" noWrap>
                    {data.draft + data.signed + data.sent + data.banned != 0
                      ? (
                          (data.draft /
                            (data.draft +
                              data.signed +
                              data.sent +
                              data.banned)) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3} item>
            <Card
              sx={{
                px: 1
              }}
            >
              <CardContent>
                <AvatarWrapper>
                  <img
                    alt="Signed"
                    src="/static/images/placeholders/logo/edit-2.png"
                  />
                </AvatarWrapper>
                <Typography variant="h5" noWrap>
                  Signed
                </Typography>
                <Box
                  sx={{
                    pt: 3
                  }}
                >
                  <Typography variant="h3" gutterBottom noWrap>
                    {data.signed}
                  </Typography>
                  <Typography variant="subtitle2" noWrap>
                    {data.draft + data.signed + data.sent + data.banned != 0
                      ? (
                          (data.signed /
                            (data.draft +
                              data.signed +
                              data.sent +
                              data.banned)) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3} item>
            <Card
              sx={{
                px: 1
              }}
            >
              <CardContent>
                <AvatarWrapper>
                  <img
                    alt="Sent"
                    src="/static/images/placeholders/logo/sent-3.png"
                  />
                </AvatarWrapper>
                <Typography variant="h5" noWrap>
                  Sent
                </Typography>
                <Box
                  sx={{
                    pt: 3
                  }}
                >
                  <Typography variant="h3" gutterBottom noWrap>
                    {data.sent}
                  </Typography>
                  <Typography variant="subtitle2" noWrap>
                    {data.draft + data.signed + data.sent + data.banned != 0
                      ? (
                          (data.sent /
                            (data.draft +
                              data.signed +
                              data.sent +
                              data.banned)) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3} item>
            <Card
              sx={{
                px: 1
              }}
            >
              <CardContent>
                <AvatarWrapper>
                  <img
                    alt="Banned"
                    src="/static/images/placeholders/logo/edit-2.png"
                  />
                </AvatarWrapper>
                <Typography variant="h5" noWrap>
                  Banned
                </Typography>
                <Box
                  sx={{
                    pt: 3
                  }}
                >
                  <Typography variant="h3" gutterBottom noWrap>
                    {data.banned}
                  </Typography>
                  <Typography variant="subtitle2" noWrap>
                    {data.draft + data.signed + data.sent + data.banned != 0
                      ? (
                          (data.banned /
                            (data.draft +
                              data.signed +
                              data.sent +
                              data.banned)) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default Wallets;
