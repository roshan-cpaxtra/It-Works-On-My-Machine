'use client';

import { createTheme, Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'cyberpunk' | 'retro';

export const createCustomTheme = (mode: ThemeMode): Theme => {
  const baseTypography = {
    fontFamily: 'var(--font-geist-sans), sans-serif',
  };

  switch (mode) {
    case 'dark':
      return createTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: '#90caf9',
          },
          secondary: {
            main: '#f48fb1',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        },
        typography: baseTypography,
      });

    case 'cyberpunk':
      return createTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: '#ff00ff',
          },
          secondary: {
            main: '#00ffff',
          },
          background: {
            default: '#0a0a0a',
            paper: '#1a1a2e',
          },
          text: {
            primary: '#00ffff',
            secondary: '#ff00ff',
          },
        },
        typography: {
          ...baseTypography,
          fontFamily: 'var(--font-geist-mono), monospace',
        },
      });

    case 'retro':
      return createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#ff6b35',
          },
          secondary: {
            main: '#f7931e',
          },
          background: {
            default: '#fffbf0',
            paper: '#fff8e1',
          },
          text: {
            primary: '#5d4037',
          },
        },
        typography: baseTypography,
      });

    case 'light':
    default:
      return createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        },
        typography: baseTypography,
      });
  }
};

const theme = createCustomTheme('light');
export default theme;
