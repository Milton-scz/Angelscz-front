import React from 'react';
import { TextField, InputAdornment, styled } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

// Estiliza el TextField usando styled-components
const StyledTextField = styled(TextField)(({ theme, isDark }) => ({
  width: '100%',
  backgroundColor: isDark ? '#424242' : '#ffffff',
  color: isDark ? '#ffffff' : '#000000',
  borderColor: isDark ? '#ffffff' : '#cccccc',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: isDark ? '#ffffff' : '#cccccc',
    },
    '&:hover fieldset': {
      borderColor: isDark ? '#aaaaaa' : '#999999',
    },
    '&.Mui-focused fieldset': {
      borderColor: isDark ? '#ffffff' : '#3f51b5', // Cambiar al color principal del tema en enfoque
    },
  },
  '& .MuiInputAdornment-root': {
    color: isDark ? '#ffffff' : '#000000',
  },
}));

// Aquí definimos el componente SearchSection
const SearchSerial = ({ theme }) => {
  const isDarkTheme = theme === 'dark';

  return (
    <StyledTextField
      variant="outlined"
      placeholder="Buscar Serial"
      label="Buscar"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      isDark={isDarkTheme} // Pasamos la prop para estilos
    />
  );
};

export default SearchSerial;
