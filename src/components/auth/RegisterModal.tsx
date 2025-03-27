import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import alertService from '../../services/alertService';
import AnimatedModal from '../ui/AnimatedModal';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const { register, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      alertService.error('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alertService.error('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 8) {
      alertService.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (!formData.acceptTerms) {
      alertService.error('Debes aceptar los términos y condiciones');
      return;
    }
    
    try {
      setLoading(true);
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.phone
      );
      
      // Mostrar mensaje de éxito
      setRegisterSuccess(true);
      
      // No cerramos el modal aquí para mostrar el mensaje de éxito
    } catch (error) {
      // Los errores ya se manejan en el AuthContext
      console.error('Error en registro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-md"
      title="Crear cuenta"
    >
      <div className="p-6">
        {registerSuccess ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-bold text-lg mb-2">Solicitud enviada correctamente</h3>
              <p>Tu solicitud de registro ha sido enviada. Un administrador revisará y aprobará tu cuenta.</p>
              <p className="mt-2">Recibirás un correo electrónico cuando tu cuenta esté activada.</p>
            </div>
            <button
              onClick={onSwitchToLogin}
              className="bg-primario hover:bg-oscuro text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Nombre de usuario *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primario"
                  placeholder="Elige un nombre de usuario"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primario"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primario"
                  placeholder="+57 "
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primario"
                    placeholder="Crea una contraseña segura"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    minLength={8}
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
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primario"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  className="h-4 w-4 text-primario focus:ring-primario border-gray-300 rounded"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  Acepto los <a href="#" className="text-primario hover:text-oscuro">términos y condiciones</a> y la <a href="#" className="text-primario hover:text-oscuro">política de privacidad</a>
                </label>
              </div>
              
              <button
                type="submit"
                className={`w-full bg-primario hover:bg-oscuro text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Enviando solicitud...' : 'Solicitar cuenta'}
              </button>
              
              <div className="text-center">
                <span className="text-gray-600">¿Ya tienes cuenta? </span>
                <button
                  type="button"
                  className="text-primario hover:text-oscuro font-medium transition-colors duration-300"
                  onClick={onSwitchToLogin}
                  disabled={loading}
                >
                  Inicia sesión
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AnimatedModal>
  );
};

export default RegisterModal;
