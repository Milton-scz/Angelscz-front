import React, { useState, useEffect ,useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  Card, CardHeader, CardContent, Divider, Grid, Box, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  TextField, TablePagination
} from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deleteProfile, createProfile, updateProfile } from '../../graphql/perfiles/graphql.mutation';
import { getProfiles, getProfile } from '../../graphql/perfiles/graphql.queries';
import { gridSpacing } from '../../config';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Chip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import QRCodeStyling from 'qr-code-styling';
import { useDropzone } from 'react-dropzone';
import { uploadFiles, deleteFiles } from 'apiFiles'; // Asegúrate de que la ruta sea correcta
import MapComponent from './MapComponent'; // Importa el componente donde sea necesario
import GalleryDelete from './GalleryDelete';
const ConfirmDeleteModal = ({ open, onDelete, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      <DialogContent>
        <Typography>¿Estás seguro de que quieres eliminar este registro?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">Cancelar</Button>
        <Button onClick={onDelete} color="secondary">Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

const PerfilPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [markerPosition, setMarkerPosition] = useState({ lat: null, lng: null });
  const [perfilSeleccionado, setPerfilSeleccionado] = useState({
    profileId: null, // Valor inicial
        listaImagenes: [],
  });

  const { loading, error, data } = useQuery(getProfiles, {
    variables: { page, size: rowsPerPage },
  });

  const [pictures, setPictures] = useState([]); // para la subida de imagenes de galeria

  const [images, setImages] = useState({
    profile: '',
    portada: '',
  });

  const qrCodeRef = useRef(null);
  const [qrBase64, setQrBase64] = useState({
    code_qr: '',
  });
  const handleGenerateQr = async (id) => {
    const baseUrl = window.location.origin;
    const qrData = `${baseUrl}/profiles/${id}`;

    // Limpiar el contenido anterior del contenedor de QR
    if (qrCodeRef.current) {
        qrCodeRef.current.innerHTML = '';
    }

    const qrCode = new QRCodeStyling({
        width: 150,
        height: 150,
        data: qrData,
        image: '', // Puedes añadir una imagen en el centro del QR si lo deseas
    });

    qrCode.append(qrCodeRef.current);

    // Escuchar cuando el código QR esté completamente generado
    qrCode.getRawData('png').then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setQrBase64(base64); // Guardar el QR en Base64
           // console.log('QR en Base64:', base64);

            // Actualizar el campo code_qr en formData
            setFormData((prevFormData) => ({
                ...prevFormData,
                code_qr: base64,
            }));
        };
        reader.readAsDataURL(blob); // Convertir blob a base64
    });
};

  //para eliminar fotos de google cloud
  // Función para eliminar una imagen por su índice
  const handleDeleteFile = async (gallery_id, filePath) => {
    try {
        // Llama a la función que elimina el archivo del servidor
        await deleteFiles(gallery_id, filePath); // Asume que esta función maneja la eliminación correctamente
        
        // Actualiza el estado para eliminar la imagen de la vista
        setPerfilSeleccionado((prevProfile) => {
          const updatedImages = prevProfile.listaImagenes.filter(
              (currentFilePath) => currentFilePath !== filePath // Comparar correctamente
          );
      
       //   console.log('Updated images:', updatedImages); // Muestra las imágenes después del filtrado
        //  console.log('Perfil actualizado:', perfilSeleccionado);
      
          return {
              ...prevProfile,
              listaImagenes: updatedImages,
          };
      });
      

        toast.success('Archivo eliminado exitosamente');
    } catch (error) {
        toast.error('Error al eliminar el archivo: ' + error.message);
    }
};
  const getFileNameFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1]; // Devuelve el último elemento que es el nombre del archivo
  };

const handleLocationSelect = (location) => {
  const lat = location.lat.toString();
  const lng = location.lng.toString();
  setFormData(prevState => ({
      ...prevState,
      lat: lat,
      lng: lng,
  }));
  setMarkerPosition(location);
 // console.log("Latitud: " + lat);
  //console.log("Longitud: " + lng);
};

  
  // Función para manejar la subida de imágenes mediante drag & drop
  
 

  const handleDrop = (acceptedFiles) => {
   // console.log('Archivos aceptados:', acceptedFiles); // Agregado para depuración
    acceptedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPictures(prevPictures => [
                ...prevPictures,
                { src: reader.result, name: file.name },
            ]);
        };
        reader.readAsDataURL(file);
    });
};


    
const { getRootProps, getInputProps } = useDropzone({
  onDrop: handleDrop,
  accept: 'image/*',
  multiple: true, // Allow multiple files
});

  
  useEffect(() => {
    if (data && data.getProfiles) {
      setTotalProfiles(data.getProfiles.pageInfo.totalElementos);
    }
  }, [data]);

  const [getProfileQuery, { data: profileData }] = useLazyQuery(getProfile);
  const [deleteProfileMutation] = useMutation(deleteProfile, {
    refetchQueries: [{ query: getProfiles, variables: { page, size: rowsPerPage } }],
    onCompleted: () => toast.success('Profile eliminado con éxito'),
    onError: () => toast.error('Error al eliminar el Profile')
  });
  const [createProfileMutation] = useMutation(createProfile, {
    refetchQueries: [{ query: getProfiles, variables: { page, size: rowsPerPage } }],
   // onCompleted: () => toast.success('Profile creado con éxito'),
    //onError: () => toast.error('Error al crear el profile')
  });
  const [updateProfileMutation] = useMutation(updateProfile, {
    refetchQueries: [{ query: getProfiles, variables: { page, size: rowsPerPage } }],
    awaitRefetchQueries: true,
  //  onCompleted: () => toast.success('Profile actualizado con éxito'),
   // onError: () => toast.error('Error al actualizar el profile'),
    
  });
 
  const [open, setOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    serial: '',
    name: '',
    photo_profile: '',
    photo_portada: '',
    fecha_nacimiento: '',
    fecha_fallecimiento: '',
    lugar_nacimiento: '',
    lugar_fallecimiento: '',
    epitafio: '',
    biografia: '',
    expirateAt: '',
    code_qr: '',
    lat: '',
    lng: '',
    direccion: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  useEffect(() => {
    
    if (profileData && profileData.getProfile && selectedProfile) {
  
      
      const {
        profileId, name, photo_profile, photo_portada, fecha_nacimiento, fecha_fallecimiento,
        lugar_nacimiento, lugar_fallecimiento, epitafio, biografia,code_qr,lat,lng,direccion
      } = selectedProfile;

      setFormData({
        profileId, name, photo_profile, photo_portada, fecha_nacimiento, fecha_fallecimiento,
        lugar_nacimiento, lugar_fallecimiento, epitafio, biografia,lat,lng,direccion
      });

      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      
      setMarkerPosition({ lat: parsedLat, lng: parsedLng});

      // Set initial images
      setImages({
        profile: photo_profile,
        portada: photo_portada,
      });

      setQrBase64(code_qr);
    } else {
      setFormData({
        serial: '',
        name: '',
        photo_profile: '',
        photo_portada: '',
        fecha_nacimiento: '',
        fecha_fallecimiento: '',
        lugar_nacimiento: '',
        lugar_fallecimiento: '',
        epitafio: '',
        biografia: '',
        expirateAt: '',
        code_qr: '',
        lat: '',
        lng: '',
        direccion:'',
      });

      // Reset images
      setImages({
        profile: '',
        portada: '',
      });
      setQrBase64({
        code_qr: ''
      });
     
    }
  }, [profileData, selectedProfile]);

  const openProfileLink = (profile_id) => {
    window.open(`/profiles/${profile_id}`, '_blank');
  };

  const handleImageChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages) => ({
          ...prevImages,
          [type]: reader.result,
        }));
        setFormData((prevFormData) => ({
          ...prevFormData,
          [type === 'profile' ? 'photo_profile' : 'photo_portada']: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpen = (profile) => {
    if (profile == null) {
      setSelectedProfile(null);
      setOpen(true);
    } else {
      setSelectedProfile(profile);
      getProfileQuery({ variables: { profileId: profile.profileId } });

      setPerfilSeleccionado({
        profileId: profile.profileId,
        gallery_id: profile.gallery?.galleryId,
        listaImagenes: profile.gallery?.listaMultimediaFilesUrls|| [],
    });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setSelectedProfile(null);
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData };

    try {
        if (selectedProfile) {
            const { lat, lng } = selectedProfile; // Suponiendo que el perfil tiene lat y lng
            setMarkerPosition({ lat, lng });
            // Actualizar perfil si ya existe
            await updateProfileMutation({
                variables: { profile: { ...updatedFormData, profileId: selectedProfile.profileId } }
            });

            // Subir archivos después de actualizar el perfil
            const uploadResponse = await uploadFiles(pictures, selectedProfile.profileId, setUploadProgress);
          //  console.log('Archivos subidos exitosamente:', uploadResponse);

            // Notificación de éxito
          toast.success('Perfil actualizado con éxito');
           // Resetear el formulario después de la creación exitosa del perfil
           setFormData({
            serial: '',
            name: '',
            photo_profile: '',
            photo_portada: '',
            fecha_nacimiento: '',
            fecha_fallecimiento: '',
            lugar_nacimiento: '',
            lugar_fallecimiento: '',
            epitafio: '',
            biografia: '',
            lat: '',
            lng: '',
            direccion: '',
        });

        // Resetear las imágenes y el QR
        setImages({
            profile: '',
            portada: '',
        });
        setQrBase64({
            code_qr: ''
        });
          
        setPictures([]); // Aquí reseteas el estado de pictures
          
          handleClose(); // Cerrar el modal si solo se actualiza

        } else {
            const userId = localStorage.getItem('userId');

            // Crear un nuevo perfil
            const response = await createProfileMutation({
                variables: {
                    serial: formData.serial,
                    userId: userId,
                    name: formData.name,
                    photo_profile: formData.photo_profile,
                    photo_portada: formData.photo_portada,
                    fecha_nacimiento: formData.fecha_nacimiento,
                    fecha_fallecimiento: formData.fecha_fallecimiento,
                    lugar_nacimiento: formData.lugar_nacimiento,
                    lugar_fallecimiento: formData.lugar_fallecimiento,
                    epitafio: formData.epitafio,
                    biografia: formData.biografia,
                    lat: formData.lat,
                    lng: formData.lng,
                    direccion: formData.direccion,
                }
            });

            // Obtener el profileId del perfil recién creado
            const profileId = response.data.createProfile.profileId;

            // Subir los archivos asociados al perfil recién creado
            const uploadResponse = await uploadFiles(pictures, profileId, setUploadProgress);
          //  console.log('Archivos subidos exitosamente:', uploadResponse);

            // Notificación de éxito
            toast.success('Perfil creado con éxito');

            // Resetear el formulario después de la creación exitosa del perfil
            setFormData({
                serial: '',
                name: '',
                photo_profile: '',
                photo_portada: '',
                fecha_nacimiento: '',
                fecha_fallecimiento: '',
                lugar_nacimiento: '',
                lugar_fallecimiento: '',
                epitafio: '',
                biografia: '',
                lat: '',
                lng: '',
                direccion: '',
            });

            // Resetear las imágenes y el QR
            setImages({
                profile: '',
                portada: '',
            });
            setQrBase64({
                code_qr: ''
            });

            setPictures([]); // Aquí reseteas el estado de pictures
            // Cerrar el modal o el formulario
            handleClose(); // Ahora se cierra después de subir los archivos

        }
    } catch (error) {
      //  console.error('Error al actualizar o crear el perfil:', error);
        
        // Si hubo un error, eliminar el perfil
        if (error?.response?.data) {
            // Verifica que el perfil se haya creado antes de intentar eliminarlo
            if (error.response.data.profileId) { 
                await deleteProfileMutation({
                    variables: { profileId: error.response.data.profileId }
                });
                toast.error('Perfil eliminado debido a un error en la carga de archivos.');
            } else if (error.response.data.message) {
                // Mostrar el mensaje específico del error
                toast.error(`Error: ${error.response.data.message}`);
            } else {
                // Mostrar un mensaje genérico o la respuesta completa
                toast.error(`Error al crear el perfil: ${JSON.stringify(error.response.data)}`);
            }
        } else {
            // Si no hay respuesta del servidor, mostrar un error genérico
            toast.error('Error: Serial no encontrado o ya usado.');
        }
    }
};

  

  

  const handleDelete = (profileId) => {
    setProfileToDelete(profileId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteProfileMutation({ variables: { profileId: profileToDelete } });
    setShowDeleteModal(false);
    setProfileToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProfileToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Typography variant="body2">Cargando...</Typography>;
  if (error) return <Typography variant="body2">{error.message}</Typography>;
  const profiles = data ? data.getProfiles.items : [];
 // console.log('Perfiles:', profiles);

  return (
    <>
      <ToastContainer />
      <Breadcrumbs aria-label="breadcrumb">
        <Typography component={Link} to="/" color="inherit" variant="subtitle2">
          Dashboard
        </Typography>
        <Typography variant="subtitle2" color="textPrimary">
          Perfiles
        </Typography>
      </Breadcrumbs>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Perfiles"
              action={
                <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
                  Crear nuevo
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Serial Code</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Photo Profile</TableCell>
                      <TableCell>Fecha de Expiracion</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profiles.map((profile, index) => (
                      <TableRow key={profile.profileId}>
                        <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                        <TableCell>{profile.profileId}</TableCell>
                        <TableCell>{profile.serial.serialCode}</TableCell>
                        <TableCell>{profile.name}</TableCell>
                        <TableCell> <img src={profile.photo_profile} alt="Profile" width="50" height="50" /></TableCell>
                        <TableCell>{profile.serial.fecha_finalizacion}</TableCell>
                        <TableCell><Chip
                            label={profile.serial.vigente ? 'activo' : 'inactivo'}
                            style={{
                              backgroundColor: profile.serial.vigente ? 'green' : 'red',
                              color: 'white'
                            }}
                          /></TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => openProfileLink(profile.profileId)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpen(profile)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDelete(profile.profileId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalProfiles}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

     <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProfile ? 'Editar Profile' : 'Crear nuevo Profile'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {!selectedProfile && (
                <Grid item xs={12}>
                  <TextField
                    name="serial"
                    label="Serial"
                    fullWidth
                    value={formData.serial}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              )}
 <Grid item xs={12}>
                <TextField
                  name='name'
                  label="Nombre"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid container spacing={2}sx={{ marginTop: 1}}>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Fecha de Nacimiento"
                        value={formData.fecha_nacimiento ? dayjs(formData.fecha_nacimiento, 'DD-MM-YYYY') : null}
                        onChange={(date) => {
                          handleChange({
                            target: {
                              name: 'fecha_nacimiento',
                              value: date ? date.format('DD-MM-YYYY') : ''
                            }
                          });
                        }}
                        format="DD-MM-YYYY"
                        renderInput={(params) => <TextField {...params} fullWidth required />}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Fecha de Fallecimiento"
                        value={formData.fecha_fallecimiento ? dayjs(formData.fecha_fallecimiento, 'DD-MM-YYYY') : null}
                        onChange={(date) => {
                          handleChange({
                            target: {
                              name: 'fecha_fallecimiento',
                              value: date ? date.format('DD-MM-YYYY') : ''
                            }
                          });
                        }}
                        format="DD-MM-YYYY"
                        renderInput={(params) => <TextField {...params}  required />}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
         
<Grid container spacing={2} sx={{ marginTop: 1}}>
  <Grid item xs={6}>
    <TextField
      fullWidth
      name="lugar_nacimiento"
      label="Lugar de Nacimiento"
      value={formData.lugar_nacimiento}
      onChange={handleChange}
    />
  </Grid>
  <Grid item xs={6}>
    <TextField
      fullWidth
      name="lugar_fallecimiento"
      label="Lugar de Fallecimiento"
      value={formData.lugar_fallecimiento}
      onChange={handleChange}
    />
  </Grid>
</Grid>

              <Grid item xs={12}>
                <TextField
                  name="epitafio"
                  label="Epitafio"
                  fullWidth
                  value={formData.epitafio}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
              <TextField
                name="biografia"
                label="Biografía"
                fullWidth
                value={formData.biografia}
                onChange={handleChange}
                multiline
                rows={4} // Ajusta el número de filas visibles del textarea
                />
                
              </Grid>
              <Grid container spacing={2} sx={{ marginTop: 1 }}>
                  <Grid item xs={12}>
              <TextField
                name="direccion"
                label="Direccion"
                fullWidth
                value={formData.direccion || ''}
                onChange={handleChange}
                />
                </Grid>
              <Grid item xs={6}>
              <TextField
                name="lat"
                label="Latitud"
                fullWidth
                value={formData.lat || ''}
                onChange={handleChange}
                />
                 </Grid>
                 <Grid item xs={6}>
              <TextField
                name="lng"
                label="Longitud"
                fullWidth
                value={formData.lng || ''}
                onChange={handleChange}
          
                />
              </Grid>
            
          </Grid>
              <Grid item xs={12} style={{ height: '400px', width: '300px' }}>
                
  <h1>Ubicación del cementerio</h1>

    <MapComponent 
      markerPosition={markerPosition} 
      onUpdateMarkerPosition={handleLocationSelect} 
    />
 
</Grid>

  {/* Área de subida de imagen con Dropzone */}
   <Grid container spacing={2} sx={{ marginTop: 12 }}>
            <Grid item xs={12}>
                <Typography variant="subtitle1" align="center">Sección de Carga</Typography>
                <Box {...getRootProps()} sx={{ border: '1px dashed grey', padding: 5, marginTop: 2, cursor: 'pointer' }}>
                    <input {...getInputProps()} />
                    <Typography>Cargar imágenes (Drag & Drop)</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: 2 }}>
                    {pictures.map((pic) => (
                        <Chip 
                            key={pic.name} 
                            label={pic.name} 
                            onDelete={() => setPictures((prev) => prev.filter(p => p.name !== pic.name))} 
                        />
                    ))}
                </Box>
            </Grid>
        </Grid>
             
    <Grid container spacing={3} sx={{ marginTop: 1, justifyContent: 'space-between' }}>
  {/* Foto de Perfil */}
  <Grid item xs={4} container direction="column" alignItems="center">
    <Typography variant="subtitle1" align="center">Foto de perfil</Typography>
    {images.profile && (
      <img src={images.profile} alt="Profile" style={{ height: '200px', width: '200px', objectFit: 'cover' }} />
    )}
    <Button variant="contained" component="label" sx={{ marginTop: 1 }}>
      {selectedProfile ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(event) => handleImageChange(event, 'profile')}
      />
    </Button>
  </Grid>

  {/* Foto de Portada */}
  <Grid item xs={4} container direction="column" alignItems="center">
    <Typography variant="subtitle1" align="center">Foto de portada</Typography>
    {images.portada && (
      <img src={images.portada} alt="Portada" style={{ height: '200px', width: '350px', objectFit: 'cover' }} />
    )}
    <Button variant="contained" component="label" sx={{ marginTop: 1 }}>
      {selectedProfile ? 'Cambiar foto de portada' : 'Subir foto de portada'}
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(event) => handleImageChange(event, 'portada')}
      />
    </Button>
  </Grid>

  {/* QR */}
  {selectedProfile && (
    <Grid item xs={4} container direction="column" alignItems="center">
      <Typography variant="subtitle1" align="center">QR del Perfil</Typography>
      {qrBase64 && (
        <img src={qrBase64} alt="QR" style={{ marginTop: '1px', height: '200px', width: '200px' }} />
      )}
      <Button variant="contained" onClick={() => handleGenerateQr(selectedProfile.profileId)} sx={{ marginTop: 1 }}>
        Generar QR
      </Button>
    </Grid>
  )}
</Grid>
              <Grid item xs={12}>
              {selectedProfile && (
                 <GalleryDelete
                 pictures={perfilSeleccionado.listaImagenes}
                 gallery_id={selectedProfile.gallery?.galleryId}
                 onDelete={handleDeleteFile}
               />
                )}
              </Grid>
          
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Cancelar</Button>
            <Button type="submit" color="primary">{selectedProfile ? 'Guardar cambios' : 'Crear Profile'}</Button>
          </DialogActions>
        </form>
    
      </Dialog>

      <ConfirmDeleteModal
        open={showDeleteModal}
        onDelete={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default PerfilPage;
