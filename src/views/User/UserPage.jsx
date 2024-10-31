import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  Card, CardHeader, CardContent, Divider, Grid, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  TextField, MenuItem, Checkbox, FormControlLabel, TablePagination
} from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deleteUser, createUser, updateUser } from '../../graphql/users/graphql.mutation';
import { getUsers, getUser } from '../../graphql/users/graphql.queries';
import { gridSpacing } from '../../config';
import { UserRole } from '../../models/UserRole';

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

const UserPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const { loading, error, data } = useQuery(getUsers, {
    variables: { page, size: rowsPerPage },
  });

  useEffect(() => {
    if (data && data.getUsers) {
      setTotalUsers(data.getUsers.pageInfo.totalElementos);
    }
  }, [data]);

  const [showPassword, setShowPassword] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [getUserQuery, { data: userData }] = useLazyQuery(getUser);
  const [deleteUserMutation] = useMutation(deleteUser, {
    refetchQueries: [{ query: getUsers, variables: { page, size: rowsPerPage } }],
    onCompleted: () => toast.success('Usuario eliminado con éxito'),
    onError: () => toast.error('Error al eliminar el usuario')
  });
  const [createUserMutation] = useMutation(createUser, {
    refetchQueries: [{ query: getUsers, variables: { page, size: rowsPerPage } }],
    onCompleted: () => toast.success('Usuario creado con éxito'),
    onError: () => toast.error('Error al crear el usuario')
  });
  const [updateUserMutation] = useMutation(updateUser, {
    refetchQueries: [{ query: getUsers, variables: { page, size: rowsPerPage } }],
    awaitRefetchQueries: true,
    onCompleted: () => toast.success('Usuario actualizado con éxito'),
    onError: () => toast.error('Error al actualizar el usuario')
  });

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    celular: '',
    password: '',
    role: UserRole.USER
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (userData && userData.getUser && selectedUser) {
      const { userId, name, email, celular, password, role } = userData.getUser;
      setFormData({ userId, name, email, celular, password, role });
    } else {
      setFormData({
        name: '',
        email: '',
        celular: '',
        password: '',
        role: UserRole.USER
      });
    }
  }, [userData, selectedUser]);

  const handleOpen = (user) => {
    if (user == null) {
      setSelectedUser(null);
      setOpen(true);
    } else {
      setSelectedUser(user);
      getUserQuery({ variables: { email: user.email } });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setOpen(false);
    setUpdatePassword(false); // Reset update password checkbox
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData };
    if (!updatePassword) {
      delete updatedFormData.password; 
    }
    if (selectedUser) {
      updateUserMutation({ variables: { user: { ...updatedFormData, userId: selectedUser.userId } } });
    } else {
      createUserMutation({
        variables: {
          user: formData
        }
      }).then(() => {
        // Reset
        setFormData({
          name: '',
          email: '',
          celular: '',
          password: '',
          role: UserRole.USER
        });
      });
    }
    handleClose();
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteUserMutation({ variables: { userId: userToDelete } });
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUpdatePasswordChange = (e) => {
    setUpdatePassword(e.target.checked);
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
  const users = data ? data.getUsers.items : [];
  
  return (
    <>
      <ToastContainer />
      <Breadcrumbs aria-label="breadcrumb">
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Inicio
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Usuarios
        </Typography>
      </Breadcrumbs>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={
                <Typography component="div" className="card-header">
                  Usuarios
                </Typography>
              }
              action={
                <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
                  Añadir Usuario
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Celular</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.celular}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleOpen(user)}>
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(user.userId)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalUsers}
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
        <DialogTitle>{selectedUser ? 'Editar Usuario' : 'Añadir Usuario'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                />
              </Grid>
              {selectedUser && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={updatePassword}
                        onChange={handleUpdatePasswordChange}
                        color="primary"
                      />
                    }
                    label="Actualizar contraseña"
                  />
                </Grid>
              )}
              {(!selectedUser || updatePassword) && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required={!selectedUser}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Rol"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {selectedUser ? 'Actualizar' : 'Crear'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
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

export default UserPage;
