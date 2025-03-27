import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import alertService from '../../services/alertService';
import AnimatedModal from '../ui/AnimatedModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const LoginModal = ({ isOpen, onClose, onRegisterClick }: LoginModalProps) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      alertService.error('Por favor, completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      const success = await login(identifier, password);
      
      // Solo cerramos el modal si el inicio de sesión fue exitoso
      if (success) {
        onClose();
      }
      // No es necesario mostrar alerta aquí, ya que se maneja en el AuthContext
    } catch (error) {
      // Los errores ya se manejan en el AuthContext
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-md"
      title="Iniciar sesión"
    >
      <div className="p-6">
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
              Email o nombre de usuario
            </label>
            <input
              id="identifier"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primario"
              placeholder="Ingresa tu email o nombre de usuario"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primario"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className={`bg-primario hover:bg-oscuro text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
            
            <div className="text-center text-sm">
              <button
                type="button"
                className="text-primario hover:text-oscuro transition-colors duration-300"
                onClick={() => alertService.info('Funcionalidad pendiente: Recuperar contraseña')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-gray-600">¿No tienes cuenta? </span>
              <button
                type="button"
                className="text-primario hover:text-oscuro font-medium transition-colors duration-300"
                onClick={onRegisterClick}
              >
                Regístrate
              </button>
            </div>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
};

export default LoginModal;
