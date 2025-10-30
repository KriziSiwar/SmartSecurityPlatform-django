import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  Videocam as VideocamIcon,
  Sensors as SensorsIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { text: 'Sites', icon: <BusinessIcon />, path: '/sites' },
        { text: 'Alertes', icon: <WarningIcon />, path: '/alerts' },
        { text: 'Caméras', icon: <VideocamIcon />, path: '/cameras' },
        { text: 'Capteurs', icon: <SensorsIcon />, path: '/sensors' },
        { text: 'Événements', icon: <EventIcon />, path: '/events' },
        { text: 'Rapports', icon: <AssessmentIcon />, path: '/reports' },
        { text: 'Maintenances', icon: <BuildIcon />, path: '/maintenances' },
        { text: 'Détection Anomalies', icon: <SecurityIcon />, path: '/anomaly-detection' },
        { text: 'Test IA', icon: <AssessmentIcon />, path: '/ai-test' },
      ];
    } else if (user?.role === 'technicien') {
      return [
        ...baseItems,
        { text: 'Mes Maintenances', icon: <BuildIcon />, path: '/maintenances' },
        { text: 'Événements', icon: <EventIcon />, path: '/events' },
        { text: 'Rapports', icon: <AssessmentIcon />, path: '/reports' },
      ];
    } else if (user?.role === 'client') {
      return [
        ...baseItems,
        { text: 'Mes Sites', icon: <BusinessIcon />, path: '/sites' },
        { text: 'Mes Alertes', icon: <WarningIcon />, path: '/alerts' },
        { text: 'Rapports', icon: <AssessmentIcon />, path: '/reports' },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <img
            src="/logo.jpg"
            alt="Smart Security Logo"
            style={{
              height: 50,
              width: 'auto',
              borderRadius: 4,
              filter: 'brightness(1.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#1E3A8A', // Dark Slate Blue
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Plateforme de Sécurité Intelligente
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                {user.username} ({user.role})
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Déconnexion
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1E3A8A', // Dark Slate Blue
              color: '#ffffff',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1E3A8A', // Dark Slate Blue
              color: '#ffffff',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;