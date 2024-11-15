import {
  Card,
  Box,
  Grid,
  Typography,
  useTheme,
  styled,
  Divider,
  alpha,
  ListItem,
  ListItemText,
  List,
  ListItemAvatar,
  Skeleton
} from '@mui/material';
import Text from 'src/components/Text';
import { Chart } from 'src/components/Chart';
import type { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axiosIntance';
import { enqueueSnackbar } from 'notistack';

const ListItemAvatarWrapper = styled(ListItemAvatar)(
  ({ theme }) => `
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing(1)};
  padding: ${theme.spacing(0.5)};
  border-radius: 60px;
  background: ${theme.palette.mode === 'dark'
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

function AccountBalance() {
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
  
  
  const theme = useTheme();

  const chartContactOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    },
    colors: ['#FFCC00', '#9ACD32'],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Number(val).toFixed(2) + '%';
      },
      style: {
        colors: [theme.colors.alpha.trueWhite[100]]
      },
      background: {
        enabled: true,
        foreColor: theme.colors.alpha.trueWhite[100],
        padding: 8,
        borderRadius: 4,
        borderWidth: 0,
        opacity: 0.3,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          color: theme.colors.alpha.black[70],
          opacity: 0.5
        }
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: theme.colors.alpha.black[50],
        opacity: 0.5
      }
    },
    fill: {
      opacity: 1
    },
    labels: ['Pending', 'Connected'],
    legend: {
      labels: {
        colors: theme.colors.alpha.trueWhite[100]
      },
      show: false
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    }
  };


  const chartCertificateOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    },
    colors: ['#ff9900', '#1c81c2'],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Number(val).toFixed(2) + '%';
      },
      style: {
        colors: [theme.colors.alpha.trueWhite[100]]
      },
      background: {
        enabled: true,
        foreColor: theme.colors.alpha.trueWhite[100],
        padding: 8,
        borderRadius: 4,
        borderWidth: 0,
        opacity: 0.3,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          color: theme.colors.alpha.black[70],
          opacity: 0.5
        }
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: theme.colors.alpha.black[50],
        opacity: 0.5
      }
    },
    fill: {
      opacity: 1
    },
    labels: ['Issued', 'Received'],
    legend: {
      labels: {
        colors: theme.colors.alpha.trueWhite[100]
      },
      show: false
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const contactSeries = data ? [data.pending, data.accepted] : [];
  const certificateSeries = data ? [(data.draft + data.signed + data.sent + data.banned), data.received] : [];

  if (isLoading || !data) {
    return (
      <>
        <Skeleton animation="wave" variant="rectangular" width={1100} height={300} />
      </>
    );
  }

  return (
    <Card>
      <Grid spacing={0} container>
        <Grid item xs={12} md={6}>
          <Box
            p={2}
          >
            <Typography variant="h2">Contacts</Typography>
            <Box
              component="span"
              sx={{
                display: { xs: 'none', md: 'inline-block' }
              }}
            >
              <Divider absolute orientation="vertical" />
            </Box>
            <Box flex={1}>
              <Grid container spacing={0}>
                <Grid
                  xs={12}
                  sm={6}
                  item
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Chart
                    height={250}
                    options={chartContactOptions}
                    series={contactSeries}
                    type="donut"
                  />
                </Grid>
                <Grid xs={12} sm={6} item display="flex" alignItems="center">
                  <List
                    disablePadding
                    sx={{
                      width: '100%'
                    }}
                  >
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        <img
                          alt="Pending"
                          src="/static/images/placeholders/logo/wall-clock.png"
                        />
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Pending"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondary="Pending"
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          {data.pending}
                        </Typography>
                        <Text color="error">
                          {data.pending + data.accepted > 0
                            ? (
                                (data.pending /
                                  (data.pending + data.accepted)) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </Text>
                      </Box>
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        <img
                          alt="Connected"
                          src="/static/images/placeholders/logo/connection.png"
                        />
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Connected"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondary="Connected"
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          {data.accepted}
                        </Typography>
                        <Text color="success">
                          {data.pending + data.accepted > 0
                            ? (
                                (data.accepted /
                                  (data.pending + data.accepted)) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </Text>
                      </Box>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            p={2}
          >
            <Typography variant="h2">Credentials</Typography>
            <Box
              component="span"
              sx={{
                display: { xs: 'none', md: 'inline-block' }
              }}
            >
              <Divider absolute orientation="vertical" />
            </Box>
            <Box flex={1}>
              <Grid container spacing={0}>
                <Grid
                  xs={12}
                  sm={6}
                  item
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Chart
                    height={250}
                    options={chartCertificateOptions}
                    series={certificateSeries}
                    type="donut"
                  />
                </Grid>
                <Grid xs={12} sm={6} item display="flex" alignItems="center">
                  <List
                    disablePadding
                    sx={{
                      width: '100%'
                    }}
                  >
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        <img
                          alt="Issued"
                          src="/static/images/placeholders/logo/draft.png"
                        />
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Issued"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondary="Issued certificates"
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          {data.draft + data.signed + data.sent + data.banned}
                        </Typography>
                        <Text color="error">
                          {data.draft +
                            data.signed +
                            data.sent +
                            data.banned +
                            data.received >
                          0
                            ? (
                                ((data.draft +
                                  data.signed +
                                  data.sent +
                                  data.banned) /
                                  (data.draft +
                                    data.signed +
                                    data.sent +
                                    data.banned +
                                    data.received)) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </Text>
                      </Box>
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        <img
                          alt="Received"
                          src="/static/images/placeholders/logo/edit-2.png"
                        />
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Received"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondary="Received certificates"
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          {data.received}
                        </Typography>
                        <Text color="success">
                          {data.draft +
                            data.signed +
                            data.sent +
                            data.banned +
                            data.received >
                          0
                            ? (
                                (data.received /
                                  (data.draft +
                                    data.signed +
                                    data.sent +
                                    data.banned +
                                    data.received)) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </Text>
                      </Box>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

export default AccountBalance;