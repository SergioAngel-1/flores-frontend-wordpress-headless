import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'alertifyjs/build/css/alertify.css'
import 'alertifyjs/build/css/themes/default.css'

// Desactivar el modo estricto en producción para evitar doble renderizado
const StrictModeWrapper = import.meta.env.DEV 
  ? React.StrictMode 
  : React.Fragment;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictModeWrapper>
    <App />
  </StrictModeWrapper>
)
