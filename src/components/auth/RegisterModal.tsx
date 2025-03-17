import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import alertService from '../../services/alertService';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, error } = useAuth();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alertService.error('Por favor, completa todos los campos correctamente');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      alertService.error('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      await register(username, email, password);
      setRegistrationSuccess(true);
      // No es necesario mostrar alerta aquí, ya que se maneja en el AuthContext
    } catch (error) {
      // Los errores ya se manejan en el AuthContext
      console.error('Error en registro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validación de contraseña
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  // Validación del formulario completo
  const isFormValid = 
    username && 
    email && 
    password && 
    confirmPassword && 
    passwordsMatch && 
    hasUpperCase && 
    hasLowerCase && 
    hasNumber && 
    hasMinLength;

  // Si el registro fue exitoso, mostrar mensaje de confirmación
  if (registrationSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 className="text-xl font-bold text-center mb-6">¡Registro exitoso!</h2>
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="mb-2">Tu cuenta ha sido creada correctamente.</p>
              <p>Un administrador revisará tu solicitud y aprobará tu cuenta pronto. Recibirás un correo electrónico cuando tu cuenta sea activada.</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-primario hover:bg-primario-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">Crear cuenta</h2>
          
          {/* Mensaje de error */}
          {(error || formError) && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {formError || error}
            </div>
          )}
          
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
            <p className="text-sm">
              Nota: Al registrarte, tu cuenta quedará pendiente de aprobación por un administrador. 
              Recibirás un correo electrónico cuando tu cuenta sea activada.
            </p>
          </div>
          
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario*
              </label>
              <input
                id="username"
                type="text"
                placeholder="Ingrese su nombre de usuario"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico*
              </label>
              <input
                id="email"
                type="email"
                placeholder="Ej.: ejemplo@mail.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña*
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingrese su contraseña"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña*
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme su contraseña"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primario pr-10 ${
                    confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
                )}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col text-sm">
                <div className="flex items-center mb-1">
                  <span className={`${hasUpperCase ? 'text-green-500' : 'text-red-500'} mr-2`}>ABC</span>
                  <span className="text-gray-600">Una letra mayúscula</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className={`${hasLowerCase ? 'text-green-500' : 'text-red-500'} mr-2`}>abc</span>
                  <span className="text-gray-600">Una letra minúscula</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className={`${hasNumber ? 'text-green-500' : 'text-red-500'} mr-2`}>123</span>
                  <span className="text-gray-600">Un número</span>
                </div>
                <div className="flex items-center">
                  <span className={`${hasMinLength ? 'text-green-500' : 'text-red-500'} mr-2`}>***</span>
                  <span className="text-gray-600">Mínimo 8 caracteres</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ${
                isFormValid 
                  ? 'bg-primario hover:bg-primario-dark text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isFormValid || loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <div className="border-t border-gray-200 p-6">
          <p className="text-center mb-4">¿Ya tiene una cuenta? <button onClick={onSwitchToLogin} className="text-primario hover:text-primario-dark" disabled={loading}>Iniciar sesión</button></p>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
