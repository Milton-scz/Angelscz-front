import React, { lazy } from 'react';
// project import
import Loadable from 'component/Loadable';

const PerfilPageWeb = Loadable(lazy(() => import('views/Perfiles/ProfilePage')));

// ==============================|| PUBLIC ROUTES ||============================== //

const PublicRoutes = {
  path: '/profiles/:profileId',
  element: <PerfilPageWeb />,
};

export default PublicRoutes;
