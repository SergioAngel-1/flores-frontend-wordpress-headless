import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';
import 'alertifyjs/build/css/themes/default.css';

// Configuración global de alertify
alertify.defaults.transition = 'slide';
alertify.defaults.theme.ok = 'btn btn-primario';
alertify.defaults.theme.cancel = 'btn btn-secundario';
alertify.defaults.theme.input = 'form-control';
alertify.defaults.notifier.position = 'top-right';
alertify.defaults.notifier.delay = 5;
alertify.defaults.notifier.closeButton = true;

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
    );
  },
  
  prompt: (message: string, defaultValue: string, onOk: (value: string) => void, onCancel?: () => void) => {
    alertify.prompt(
      'Entrada',
      message,
      defaultValue,
      (evt, value) => onOk(value),
      () => onCancel && onCancel()
    );
  }
};

export default alertService;
