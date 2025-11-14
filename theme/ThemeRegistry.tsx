'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeModeProvider, useThemeMode } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { createCustomTheme } from './theme';

function ThemeContent({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeMode();
  const theme = React.useMemo(() => createCustomTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeModeProvider>
        <AuthProvider>
          <ThemeContent>{children}</ThemeContent>
        </AuthProvider>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
