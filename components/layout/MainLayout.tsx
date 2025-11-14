'use client';

import React, { useState, useEffect } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  // Show nothing while checking auth
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar
        onMenuClick={handleDrawerToggle}
        userName={user?.name || 'User'}
        userRole={user?.role || 'VIEWER'}
      />

      <Sidebar
        open={isMobile ? mobileOpen : desktopOpen}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            xs: '100%',
            md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          },
          marginLeft: {
            xs: 0,
            md: 0,
          },
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
