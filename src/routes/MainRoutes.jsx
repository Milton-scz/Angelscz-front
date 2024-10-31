import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
import PrivateRoute from './PrivateRoute';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const UtilsTypography = Loadable(lazy(() => import('views/Utils/Typography')));
const PerfilPage = Loadable(lazy(() => import('views/Perfiles/index')));
const UserPage = Loadable(lazy(() => import('views/User/UserPage')));
const SerialPage = Loadable(lazy(() => import('views/Serial/SerialPage')));
const PerfilPageWeb = Loadable(lazy(() => import('views/Perfiles/ProfilePage')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />, // Layout principal para las rutas protegidas
  children: [
    {
      path: '/', // Ruta raíz
      element: <PrivateRoute />, // Asegúrate de que esta ruta verifique la autenticación
      children: [
        {
          path: '/', 
          element: <DashboardDefault />
        },
        {
          path: '/dashboard',
          element: <DashboardDefault />
        },
        {
          path: '/utils/util-typography',
          element: <UtilsTypography />
        },
        {
          path: '/perfiles',
          element: <PerfilPage />
        },
        {
          path: '/users',
          element: <UserPage />
        },
        {
          path: '/serials',
          element: <SerialPage />
        },
      ]
    },
   
    // Ruta de redirección para rutas no encontradas
    { path: '*', element: <Navigate to="/" /> } // Redirige a la raíz si no se encuentra la ruta
  ],
};

export default MainRoutes;
