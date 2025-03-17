import { useState } from 'react';
import { useAuth } from '../../../core/contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Modal from '../../../core/components/ui/Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { login, register, loading, error } = useAuth();

  const handleLogin = async (identifier: string, password: string) => {
    try {
      await login(identifier, password);
      onClose();
    } catch (error) {
      // Error ya manejado en el contexto de autenticación
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      await register(username, email, password);
      // No cerramos el modal automáticamente después del registro
      // porque el usuario queda pendiente de aprobación
      setActiveTab('login');
    } catch (error) {
      // Error ya manejado en el contexto de autenticación
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mi cuenta">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'login'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('login')}
        >
          Iniciar sesión
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'register'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('register')}
        >
          Registrarse
        </button>
      </div>
      
      {/* Formularios */}
      {activeTab === 'login' ? (
        <LoginForm 
          onSubmit={handleLogin} 
          loading={loading} 
          error={error} 
        />
      ) : (
        <RegisterForm 
          onSubmit={handleRegister} 
          loading={loading} 
          error={error} 
        />
      )}
    </Modal>
  );
};

export default LoginModal;
