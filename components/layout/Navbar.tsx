'use client';

import React, { useState } from 'react';
import { useThemeMode } from '@/contexts/ThemeContext';
import { ThemeMode } from '@/theme/theme';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Person,
  Palette,
} from '@mui/icons-material';

interface NavbarProps {
  onMenuClick: () => void;
  userName?: string;
  userRole?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  userName = 'Guest User',
  userRole = 'GUEST'
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const { themeMode, setThemeMode } = useThemeMode();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    handleThemeMenuClose();
  };

  const handleLogout = () => {
    handleUserMenuClose();
    console.log('Logout clicked');
  };

  const handleProfile = () => {
    handleUserMenuClose();
    console.log('Profile clicked');
  };

  const handleSettings = () => {
    handleUserMenuClose();
    console.log('Settings clicked');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 0, fontWeight: 600 }}
        >
          It Works On My Machine
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={handleThemeMenuOpen}
            aria-label="change theme"
          >
            <Palette />
          </IconButton>

          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {userRole}
            </Typography>
          </Box>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userRole}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>

            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">Logout</Typography>
            </MenuItem>
          </Menu>

          <Menu
            id="theme-menu"
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={handleThemeMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Choose Theme
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => handleThemeChange('light')}
              selected={themeMode === 'light'}
            >
              <ListItemIcon>
                <Palette fontSize="small" />
              </ListItemIcon>
              Light
            </MenuItem>
            <MenuItem
              onClick={() => handleThemeChange('dark')}
              selected={themeMode === 'dark'}
            >
              <ListItemIcon>
                <Palette fontSize="small" />
              </ListItemIcon>
              Dark
            </MenuItem>
            <MenuItem
              onClick={() => handleThemeChange('cyberpunk')}
              selected={themeMode === 'cyberpunk'}
            >
              <ListItemIcon>
                <Palette fontSize="small" />
              </ListItemIcon>
              Cyberpunk
            </MenuItem>
            <MenuItem
              onClick={() => handleThemeChange('retro')}
              selected={themeMode === 'retro'}
            >
              <ListItemIcon>
                <Palette fontSize="small" />
              </ListItemIcon>
              Retro
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
