import React from 'react';
import { Grid, Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


const getFileNameFromUrl = (url) => {
    // Extrae el nombre del archivo de la URL
    const parts = url.split('/');
    return parts[parts.length - 1]; // Devuelve el último elemento que es el nombre del archivo
  };
const GalleryDelete = ({ pictures, gallery_id, onDelete }) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" align="center" sx={{ marginBottom: 2 }}>
        Galería de Imágenes
      </Typography>
      <Grid container spacing={2}>
        {pictures && pictures.length > 0 ? (
          pictures.map((pic, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={pic} // Asegúrate de que pic tenga la propiedad `src`
                alt={`Imagen ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
              {/* Botón de eliminar en la esquina superior derecha */}
              <IconButton
                onClick={() => onDelete(gallery_id, pic)} // Pasa profileId y el fileName
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  },
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="subtitle1" align="center" sx={{ marginTop: 2 }}>
              No hay imágenes para mostrar.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default GalleryDelete;
