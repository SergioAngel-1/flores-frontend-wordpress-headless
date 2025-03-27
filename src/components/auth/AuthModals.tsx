import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const AuthModals = () => {
  const { 
    showLoginModal, 
    setShowLoginModal, 
    showRegisterModal, 
    setShowRegisterModal 
  } = useAuth();

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onRegisterClick={handleSwitchToRegister} 
      />
      
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
        onSwitchToLogin={handleSwitchToLogin} 
      />
    </>
  );
};

export default AuthModals;
