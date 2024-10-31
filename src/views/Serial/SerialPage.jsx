import React, { useState, useEffect,useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  Card, CardHeader, CardContent, Divider, Grid, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  TextField, MenuItem, Select, FormControl, InputLabel, TablePagination
} from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deleteSerial, createSerial, updateSerial } from '../../graphql/serials/graphql.mutation';
import { getSerials, getSerial,getAllSerials} from '../../graphql/serials/graphql.queries';
import { gridSpacing } from '../../config';
import { Chip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


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

const SerialPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalSerials, setTotalSerials] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); 
  let [filteredSerials, setFilteredSerials] = useState([]);  // Estado para los seriales filtrados
  const { loading, error, data, refetch } = useQuery(getSerials, {
    variables: { page, size: rowsPerPage },
    fetchPolicy: "cache-and-network"
  });
  const inputRef = useRef(null);


  const [getAllSerialQuery, { data: AllserialData }] = useLazyQuery(getAllSerials);
  // Ejecuta la consulta cuando el componente carga por primera vez
  useEffect(() => {
    getAllSerialQuery();  // Ejecuta la consulta para obtener todos los seriales
  }, [getAllSerialQuery]);


    // Cada vez que los datos o el término de búsqueda cambien, actualizamos la lista filtrada
  useEffect(() => {
    if (AllserialData && AllserialData.getAllSerials) {
      const filtered = searchTerm
        ? AllserialData.getAllSerials.filter(serial => 
            serial.serialCode.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : data?.getSerials?.items || [];  // Asegurarse que siempre se asigne un array

      setFilteredSerials(filtered);
    }
  }, [AllserialData, searchTerm, data])



  useEffect(() => {
    if (data && data.getSerials) {
      setTotalSerials(data.getSerials.pageInfo.totalElementos);
    }
  }, [data]);

  const [getSerialQuery, { data: serialData }] = useLazyQuery(getSerial);
  const [deleteSerialMutation] = useMutation(deleteSerial, {
    refetchQueries: [{ query: getSerials, variables: { page, size: rowsPerPage } }],
    onCompleted: () => toast.success('Serial eliminado con éxito'),
    onError: () => toast.error('Error al eliminar el serial')
  });
  const [createSerialMutation] = useMutation(createSerial, {
    refetchQueries: [{ query: getSerials, variables: { page, size: rowsPerPage } }],
    onCompleted: () => toast.success('Serial creado con éxito'),
    onError: () => toast.error('Error al crear el serial.')
  });
  const [updateSerialMutation] = useMutation(updateSerial, {
    refetchQueries: [{ query: getSerials, variables: { page, size: rowsPerPage } }],
    awaitRefetchQueries: true,
    onCompleted: () => toast.success('Serial actualizado con éxito'),
    onError: () => toast.error('Error al actualizar el serial.')
  });
  

 


  // Si filteredSerials está vacío, asignamos serials
  if (filteredSerials.length === 0) {
    filteredSerials = data ? data.getSerials.items : [];
  }
  
  const [open, setOpen] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [formData, setFormData] = useState({
    serialId: '',
    serialCode: '',
    duracion: 0,
    dias_restantes:0,
    fecha_activacion: '',
    fecha_finalizacion:'',
    vigente: '',
    activado: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serialToDelete, setSerialToDelete] = useState(null);

  useEffect(() => {
    if (serialData && serialData.getSerial && selectedSerial) {
      const { serialId, serialCode, duracion, dias_restantes, fecha_activacion, fecha_finalizacion, vigente, activado } = selectedSerial;
      setFormData({ serialId, serialCode, duracion, dias_restantes, fecha_activacion, fecha_finalizacion, vigente, activado });
    } else {
      setFormData({
        serialId: '',
        serialCode: '',
        duracion: '',
        dias_restantes:'',
        fecha_activacion: '',
        fecha_finalizacion:'',
        vigente: '',
        activado: ''
      });
    }
  }, [serialData, selectedSerial]);

  const handleOpen = (serial) => {
    if (serial == null) {
      setSelectedSerial(null);
      setOpen(true);
    } else {
      setSelectedSerial(serial);
      getSerialQuery({ variables: { serialCode: serial.serialCode } });
      setOpen(true);
    }
  };



  const handleClose = () => {
    setSelectedSerial(null);
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData };
    updatedFormData.duracion = parseInt(updatedFormData.duracion, 10);
    updatedFormData.dias_restantes = parseInt(updatedFormData.dias_restantes, 10);
    if (selectedSerial) {
     // console.log("Seria code:"+selectedSerial.serialId);
      updateSerialMutation({ variables: { serial: { ...updatedFormData, serialId: selectedSerial.serialId } } });
    } else {
      createSerialMutation({
        variables: {
          duracion: updatedFormData.duracion
        }
      }).then(() => {
        // Reset
        setFormData({
          serialId: '',
          serialCode: '',
          duracion: '',
          dias_restantes:'',
          fecha_activacion: '',
          fecha_finalizacion:'',
          vigente: '',
          activado: ''
        });
      });
    }
    handleClose();
  };

  const handleDelete = (serialId) => {
    setSerialToDelete(serialId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteSerialMutation({ variables: { serialId: serialToDelete } });
    setShowDeleteModal(false);
    setSerialToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSerialToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch({ page: newPage, size: rowsPerPage });  // Forzar la consulta con la nueva página
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Typography variant="body2">Cargando...</Typography>;
  if (error) return <Typography variant="body2">{error.message}</Typography>;
 
 
  return (
    <>
      <ToastContainer />
      <Breadcrumbs aria-label="breadcrumb">
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Inicio
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Seriales
        </Typography>
      </Breadcrumbs>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
          <CardHeader
  title={
    <Typography component="div" className="card-header">
      Seriales
    </Typography>
  }
  action={
    <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
      {/* Campo de búsqueda en el centro */}
       <Grid item xs={12} sm={8} md={6}>
            <TextField
              inputRef={inputRef}
              label="Buscar Serial"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
           
              onFocus={() => console.log('Foco en el campo de búsqueda')}
              fullWidth
            />
          </Grid>


      
      <Grid item>
        {/* Botón para abrir el modal de creación */}
        <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
          Agregar Serial
        </Button>
      </Grid>
    </Grid>
  }
  
/>

          
            <CardContent>
            {filteredSerials.length === 0 ? (
                <Typography variant="body2">No se encontraron seriales.</Typography>
              ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Serial Code</TableCell>
                      <TableCell>Duracion</TableCell>
                      <TableCell>Dias Restantes</TableCell>
                      <TableCell>Fecha de Activacion</TableCell>
                      <TableCell>Fecha de Finalizacion</TableCell>
                      <TableCell>Vigente</TableCell>
                      <TableCell>Activado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {filteredSerials.map((serial) => (
                      <TableRow key={serial.serialId}>
                        <TableCell>{serial.serialId}</TableCell>
                        <TableCell>{serial.serialCode}</TableCell>
                        <TableCell>{serial.duracion}</TableCell>
                        <TableCell>{serial.dias_restantes}</TableCell>
                        <TableCell>{serial.fecha_activacion}</TableCell>                   
                        <TableCell>{serial.fecha_finalizacion}</TableCell>
                        <TableCell>
                          <Chip
                            label={serial.vigente ? 'vigente' : 'vencido'}
                            style={{
                              backgroundColor: serial.vigente ? 'green' : 'red',
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell> <Chip
                            label={serial.activado ? 'activado' : 'no activado'}
                            style={{
                              backgroundColor: serial.activado ? 'green' : 'red',
                              color: 'white'
                            }}
                          /></TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleOpen(serial)}>
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(serial.serialId)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                   )}
              <TablePagination
                component="div"
                count={totalSerials}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedSerial ? 'Editar Serial' : 'Añadir Serial'}</DialogTitle>
        <form onSubmit={handleSubmit}>
        <DialogContent>
         
            <Grid container spacing={2}>
              {selectedSerial ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Serial Code"
                      name="serialCode"
                      value={formData.serialCode}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Duracion"
                      name="duracion"
                      value={formData.duracion}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dias Restantes"
                      name="dias_restantes"
                      value={formData.dias_restantes}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Fecha de Activacion"
                  value={formData.fecha_activacion ? dayjs(formData.fecha_activacion,'DD-MM-YYYY') : null}
                  onChange={(date) => {
                    handleChange({
                      target: {
                        name: 'fecha_activacion',
                       value: date ? date.format('DD-MM-YYYY') : ''
                      }
                    });
                  }}
                    format="DD-MM-YYYY"
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Fecha de Vencimiento"
                  value={formData.fecha_finalizacion ? dayjs(formData.fecha_finalizacion,'DD-MM-YYYY') : null}
                  onChange={(date) => {
                    handleChange({
                      target: {
                        name: 'fecha_finalizacion',
                       value: date ? date.format('DD-MM-YYYY') : ''
                      }
                    });
                  }}
                    format="DD-MM-YYYY"
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
              </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Vigente</InputLabel>
                      <Select
                        name="vigente"
                        value={formData.vigente}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value={true}>VIGENTE</MenuItem>
                        <MenuItem value={false}>VENCIDO</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Activado</InputLabel>
                      <Select
                        name="activado"
                        value={formData.activado}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value={true}>ACTIVADO</MenuItem>
                        <MenuItem value={false}>NO ACTIVADO</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Duracion"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {selectedSerial ? 'Actualizar' : 'Crear'}
                </Button>
              </Grid>
            </Grid>
          
          </DialogContent>
          </form>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDeleteModal 
        open={showDeleteModal} 
        onDelete={confirmDelete} 
        onCancel={cancelDelete} 
      />
    </>
  );
};

export default SerialPage;
