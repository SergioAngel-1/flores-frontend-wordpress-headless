import { useState } from 'react';

interface RegisterFormProps {
  onSubmit: (username: string, email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const RegisterForm = ({ onSubmit, loading, error }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    if (username.trim() && email.trim() && password) {
      await onSubmit(username, email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de usuario
        </label>
        <input
          type="text"
          id="register-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          La contraseña debe tener al menos 8 caracteres
        </p>
      </div>
      
      <div>
        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar contraseña
        </label>
        <input
          type="password"
          id="register-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      {passwordError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {passwordError}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="register-terms"
          required
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="register-terms" className="ml-2 block text-sm text-gray-700">
          Acepto los <a href="#" className="text-primary-600 hover:text-primary-800">términos y condiciones</a>
        </label>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Registrando...
          </span>
        ) : (
          'Registrarse'
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
