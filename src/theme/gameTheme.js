import { createTheme } from '@mui/material';

const gameTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9d',
      light: '#4cffb4',
      dark: '#00cc7d',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff9999',
      dark: '#cc5555',
    },
    background: {
      default: '#1a1a2e',
      paper: '#16213e',
      card: '#1a1a2e',
    },
    gaming: {
      neon: '#00ff9d',
      purple: '#9d00ff',
      cyan: '#00fff9',
      orange: '#ff6b00',
      red: '#ff0000',
    },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Press Start 2P", cursive',
    },
    h2: {
      fontFamily: '"Press Start 2P", cursive',
    },
    h3: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #16213e 0%, #1a1a2e 100%)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(45deg, #00ff9d 30%, #00fff9 90%)',
          color: '#000',
          '&:hover': {
            background: 'linear-gradient(45deg, #00cc7d 30%, #00ccc7 90%)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        filled: {
          background: 'rgba(0, 255, 157, 0.15)',
          border: '1px solid rgba(0, 255, 157, 0.3)',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default gameTheme;
