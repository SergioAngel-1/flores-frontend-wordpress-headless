import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';
import 'alertifyjs/build/css/themes/default.css';

// Configuración global de alertify
alertify.defaults.transition = 'slide';
alertify.defaults.theme.ok = 'btn btn-primario';
alertify.defaults.theme.cancel = 'btn btn-secundario';
alertify.defaults.theme.input = 'form-control';
alertify.defaults.notifier.position = 'bottom-left';
alertify.defaults.notifier.delay = 4;
alertify.defaults.notifier.closeButton = false;

// Estilizar las notificaciones mediante CSS
const addCustomStyles = () => {
  // Agregar estilos personalizados al head del documento
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Estilo común para todas las notificaciones */
    .alertify-notifier .ajs-message {
      color: var(--oscuro) !important;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px var(--secundario);
      padding: 12px 18px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.875rem;
      min-width: 250px;
      max-width: 450px;
      border-left: 3px solid var(--primario);
      margin: 0.5rem;
    }
    .alertify-notifier .ajs-message.ajs-success {
      background-color: white;
      border-left-color: var(--primario);
    }
    .alertify-notifier .ajs-message.ajs-error {
      background-color: white;
      border-left-color: var(--error-color);
    }
    .alertify-notifier .ajs-message.ajs-warning {
      background-color: white;
      border-left-color: var(--warning-color);
    }
    /* Animación para entrar desde la izquierda */
    .alertify-notifier.ajs-bottom.ajs-left .ajs-message {
      transform: translateX(-100%);
      animation: slideInLeft 0.3s forwards;
    }
    @keyframes slideInLeft {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Estilo para diálogos de confirmación */
    .alertify .ajs-dialog {
      border-radius: 8px;
      box-shadow: 0 4px 16px var(--secundario);
      border: none;
      max-width: 400px;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    /* Fondo con blur */
    .alertify .ajs-dimmer {
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
    .alertify .ajs-header {
      color: var(--oscuro);
      border-bottom: 1px solid var(--secundario);
      padding: 16px;
      font-weight: 600;
      font-size: 1.1rem;
      text-align: center;
    }
    .alertify .ajs-body {
      color: var(--oscuro);
      padding: 16px;
      text-align: center;
    }
    .alertify .ajs-body .ajs-content {
      padding: 8px 0;
      text-align: center;
    }
    .alertify .ajs-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--secundario);
      text-align: center;
    }
    .alertify .ajs-footer .ajs-buttons {
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .alertify .ajs-footer .ajs-buttons .ajs-button {
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
      min-width: 100px;
    }
    .alertify .ajs-primary .ajs-button.btn-primario, 
    .alertify .ajs-primary .ajs-button.btn.btn-primario {
      background-color: var(--primario) !important;
      color: white !important;
      border: none !important;
    }
    
    .alertify .ajs-primary .ajs-button.btn-primario:hover, 
    .alertify .ajs-primary .ajs-button.btn.btn-primario:hover {
      background-color: var(--hover) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
    }
    
    .alertify .ajs-primary .ajs-button.btn-secundario, 
    .alertify .ajs-primary .ajs-button.btn.btn-secundario {
      border: 1px solid var(--border) !important;
      background-color: white !important;
      color: var(--oscuro) !important;
    }
    
    .alertify .ajs-primary .ajs-button.btn-secundario:hover, 
    .alertify .ajs-primary .ajs-button.btn.btn-secundario:hover {
      background-color: var(--claro) !important;
      color: var(--oscuro) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
    }
  `;
  document.head.appendChild(styleEl);
};

// Ejecutar inmediatamente para aplicar estilos
addCustomStyles();

const alertService = {
  success: (message: string) => {
    alertify.success(message);
  },
  
  error: (message: string) => {
    alertify.error(message);
  },
  
  warning: (message: string) => {
    alertify.warning(message);
  },
  
  info: (message: string) => {
    alertify.message(message);
  },
  
  confirm: (message: string, onOk: () => void, onCancel?: () => void) => {
    alertify.confirm(
      'Confirmación',
      message,
      () => onOk(),
      () => onCancel && onCancel()
    ).set({
      'labels': {ok: 'Aceptar', cancel: 'Cancelar'},
      'defaultFocus': 'ok',
      'movable': false,
      'transition': 'fade',
      'closableByDimmer': true,
      'closable': false,
      'padding': true,
      'overflow': false
    });
  },
  
  prompt: (message: string, defaultValue: string, onOk: (value: string) => void, onCancel?: () => void) => {
    alertify.prompt(
      'Ingresa información',
      message,
      defaultValue,
      (_evt: any, value: string) => onOk(value),
      () => onCancel && onCancel()
    ).set({
      'labels': {ok: 'Aceptar', cancel: 'Cancelar'},
      'defaultFocus': 'input',
      'movable': false,
      'transition': 'fade',
      'closableByDimmer': true,
      'closable': false,
      'padding': true,
      'overflow': false
    });
  }
};

// Función para mostrar una alerta de error del servidor
export const showServerErrorAlert = () => {
  alertify.error('Error de conexión con el servidor de WooCommerce. Intenta reiniciar el servidor Local.', 8);
};

export default alertService;
