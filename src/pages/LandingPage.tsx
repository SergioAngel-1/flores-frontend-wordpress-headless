import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone } from 'react-icons/fa';
import alertService from '../services/alertService';

const LandingPage = () => {
  const { login, register } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      alertService.error('Por favor, ingresa tu usuario/email y contraseña');
      return;
    }

    try {
      setLoading(true);
      const success = await login(identifier, password);
      
      if (!success) {
        alertService.error('Credenciales incorrectas. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alertService.error('Error al iniciar sesión. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password || !email) {
      alertService.error('Por favor, completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await register(identifier, email, password, phone);
      alertService.success('Registro exitoso. Tu cuenta está pendiente de aprobación.');
      // Volver al formulario de login
      setIsLoginForm(true);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      alertService.error('Error al registrar. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    // Limpiar los campos al cambiar de formulario
    setIdentifier('');
    setPassword('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado izquierdo - Información de la empresa */}
      <div className="bg-primario text-white md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Flores Inc.</h1>
          <p className="text-xl mb-8">
            Bienvenido al portal exclusivo para clientes de Flores Inc. Accede a nuestra plataforma para gestionar tus pedidos, revisar catálogos y mucho más.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-white text-primario rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg">Gestión de pedidos en tiempo real</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white text-primario rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg">Catálogo de productos actualizado</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white text-primario rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg">Soporte personalizado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario de inicio de sesión o registro */}
      <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <img 
              src="/src/assets/images/flores-logo.png" 
              alt="Flores Inc Logo" 
              className="h-20 mx-auto mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/200x80?text=Flores+Inc';
              }}
            />
            <h2 className="text-3xl font-bold text-gray-800">
              {isLoginForm ? 'Iniciar Sesión' : 'Solicitud de Cuenta'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLoginForm 
                ? 'Ingresa tus credenciales para acceder' 
                : 'Completa el formulario para solicitar una cuenta'}
            </p>
          </div>

          {isLoginForm ? (
            // Formulario de Login
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario o Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primario focus:border-primario"
                    placeholder="Ingresa tu usuario o email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primario focus:border-primario"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primario focus:ring-primario border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primario hover:text-primario-dark">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-primario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Iniciar Sesión
                </button>
              </div>
            </form>
          ) : (
            // Formulario de Registro
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primario focus:border-primario"
                    placeholder="Elige un nombre de usuario"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primario focus:border-primario"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primario focus:border-primario"
                    placeholder="Crea una contraseña segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primario focus:border-primario"
                    placeholder="+XX XXX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-primario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Solicitar Cuenta
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  {isLoginForm ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={toggleForm}
                className="w-full flex justify-center py-3 px-4 border border-primario rounded-md shadow-sm text-sm font-medium text-primario bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
              >
                {isLoginForm ? 'Solicitar una cuenta' : 'Iniciar sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
