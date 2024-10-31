import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, IconButton,Typography  } from '@mui/material';

// project import
import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import { drawerWidth } from 'config.js';

// assets
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import logo from 'assets/images/logosinfondo 100x50.png';

// ==============================|| HEADER ||============================== //

const Header = ({ drawerToggle }) => {
  const theme = useTheme();

  return (
    <>
      <Box width={drawerWidth} sx={{ zIndex: 1201 }}>
        <Grid container justifyContent="space-between" alignItems="center">
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Grid container alignItems="center"> {/* Cambiado a un Grid container */}
            <Grid item>
              <Box mt={0.5}>
                <img src={logo} alt="Logo" />
              </Box>
            </Grid>
            <Grid item>
            <Box mt={0.5} ml={1}>
                {/* Aquí utilizamos el componente Typography para el texto */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffff', fontSize: '0.8rem' }}>
                  ANGEL MEMORIES
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
          <Grid item>
            <IconButton
              edge="start"
              sx={{ mr: theme.spacing(1.25) }}
              color="inherit"
              aria-label="open drawer"
              onClick={drawerToggle}
              size="large"
            >
              <MenuTwoToneIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <SearchSection theme="light" />
      <NotificationSection />
      <ProfileSection />
    </>
  );
};

Header.propTypes = {
  drawerToggle: PropTypes.func
};

export default Header;
