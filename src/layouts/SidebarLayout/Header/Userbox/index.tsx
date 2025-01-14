import { useEffect, useRef, useState } from 'react';

import NextLink from 'next/link';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  IconButton,
  lighten,
  List,
  ListItem,
  ListItemText,
  Popover,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material';

// import InboxTwoToneIcon from '@mui/icons-material/InboxTwoTone';
import { styled, useTheme } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useStore } from '@/contexts/GlobalContext';

const UserBoxButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`
);

const MenuUserBox = styled(Box)(
  ({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.secondary.main};
        display: block;
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${lighten(theme.palette.secondary.main, 0.5)}
`
);

function HeaderUserbox() {
  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const { user,  authToken, loading, handleClearSession} = useStore();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    if(loading) {
      return ;
    }
    if (user) {
      setIsLoading(false); 
    } 
  }, [authToken, user]);
  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const truncateString = (str, maxLength) => {
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  }

  const logout = () => {
    handleClearSession();
  }

  return (
    <>
      <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
        {(isLoading  || !authToken )?
          <>
            <Skeleton animation="wave" variant="circular" width={50} height={50} />
            <Skeleton animation="wave" variant="rectangular" width={200} height={50} />
          </>
          : <Avatar variant="rounded" alt={user.name} src={user.avatarUri} />}
        <Hidden mdDown>
          {(isLoading || !authToken) ? <> </> :
            <UserBoxText>
              <UserBoxLabel variant="body1" style={{ display: 'inline' }}>{truncateString(user.name, 25)}</UserBoxLabel>
              <UserBoxDescription variant="body2" style={{ display: 'inline' }}>
                {user.isVerified === 1 ? (
                  <Tooltip title="Account is Verified" arrow>
                    <IconButton
                      sx={{
                        '&:hover': {
                          background: theme.colors.primary.lighter
                        },
                        color: theme.palette.primary.main
                      }}
                      color="inherit"
                      size="small"
                    >
                      <VerifiedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <div>Account isn't Verified</div>
                )}
              </UserBoxDescription>
            </UserBoxText>}
        </Hidden>
        <Hidden smDown>
          <ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
        </Hidden>
      </UserBoxButton>
      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuUserBox sx={{ minWidth: 210 }} display="flex">
          {(isLoading || !authToken) ? <Skeleton animation="wave" variant="circular" width={50} height={50} /> :
            <Avatar variant="rounded" alt={user.name} src={user.avatarUri} />}
          <UserBoxText>
            {(isLoading || !authToken) ? <Skeleton animation="wave" variant='rectangular' width={200} height={50} /> :
              <>
                <UserBoxLabel variant="body1" style={{ display: 'inline' }}>{user.name}</UserBoxLabel>
                <UserBoxDescription variant="body2" style={{ display: 'inline' }}>
                  {user.isVerified === 1 ? (
                    <Tooltip title="Account is Verified" arrow>
                      <IconButton
                        sx={{
                          '&:hover': {
                            background: theme.colors.primary.lighter
                          },
                          color: theme.palette.primary.main
                        }}
                        color="inherit"
                        size="small"
                      >
                        <VerifiedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <div>Account isn't Verified</div>
                  )}
                </UserBoxDescription>
              </>}
          </UserBoxText>
        </MenuUserBox>
        <Divider sx={{ mb: 0 }} />
        <List sx={{ p: 1 }} component="nav">
          <NextLink href="/management/profile" passHref>
            <ListItem button>
              <AccountBoxTwoToneIcon fontSize="small" />
              <ListItemText primary="My Profile" />
            </ListItem>
          </NextLink>
          {/* <NextLink href="/applications/messenger" passHref>
            <ListItem button>
              <InboxTwoToneIcon fontSize="small" />
              <ListItemText primary="Messenger" />
            </ListItem>
          </NextLink> */}
          <NextLink href="/management/IssuedCerts" passHref>
            <ListItem button>
              <AccountTreeTwoToneIcon fontSize="small" />
              <ListItemText primary="Manage Certs" />
            </ListItem>
          </NextLink>
        </List>
        <Divider />
        <Box sx={{ m: 1 }}>
          <Button color="primary" fullWidth onClick={logout}>
            <LockOpenTwoToneIcon sx={{ mr: 1 }} />
            Sign out
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default HeaderUserbox;

