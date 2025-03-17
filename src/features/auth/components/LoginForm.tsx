import { useState } from 'react';

interface LoginFormProps {
  onSubmit: (identifier: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LoginForm = ({ onSubmit, loading, error }: LoginFormProps) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim() && password) {
      await onSubmit(identifier, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-identifier" className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico o nombre de usuario
        </label>
        <input
          type="text"
          id="login-identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <a href="#" className="text-xs text-primary-600 hover:text-primary-800">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
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
            Iniciando sesión...
          </span>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
