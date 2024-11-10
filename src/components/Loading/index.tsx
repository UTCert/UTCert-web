import React from 'react';
import { Box, CircularProgress, keyframes } from '@mui/material';

interface LoadingProps {
  size?: number;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Loading: React.FC<LoadingProps> = ({ size = 60 }) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="rgba(0, 0, 0, 0.7)"
      zIndex={9999}
    >
      <CircularProgress 
        size={size} 
        thickness={4}
        sx={{
          color: '#fff',
        }}
      />
      <Box
        sx={{
          color: '#fff',
          mt: 2,
          fontSize: '1.2rem',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          animation: `${pulse} 1.5s ease-in-out infinite`,
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
        }}
      >
        Loading...
      </Box>
    </Box>
  );
};

export default Loading;
