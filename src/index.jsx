// src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from 'graphqlApollo';

// assets
import 'assets/scss/style.scss';

// third party
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// project import
import App from 'layout/App';
import reducer from 'store/reducer';
import * as serviceWorker from 'serviceWorker';

const store = configureStore({ reducer });

const root = createRoot(document.getElementById('root'));

// ==============================|| MAIN - REACT DOM RENDER  ||==============

root.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter basename={import.meta.env.VITE_APP_BASE_NAME}>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
);

// Si deseas que tu aplicación funcione offline y cargue más rápido, cambia
// unregister() a register() a continuación. Ten en cuenta que esto tiene algunas advertencias.
// Obtén más información sobre los service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
