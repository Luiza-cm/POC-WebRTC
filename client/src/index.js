import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
// import { ContextProvider } from './Context';
import { ContextoProvider } from './Contexto';

import './styles.css';

ReactDOM.render(
  <ContextoProvider>
    <App />
  </ContextoProvider>,
  document.getElementById('root'),
);
