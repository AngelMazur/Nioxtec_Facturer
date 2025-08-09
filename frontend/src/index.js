import React from 'react';
import ReactDOM from 'react-dom/client';
// Importa el fichero de estilos globales.  Esto asegura que
// Tailwind y nuestros tokens personalizados se apliquen en toda la aplicación.
import './styles.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);