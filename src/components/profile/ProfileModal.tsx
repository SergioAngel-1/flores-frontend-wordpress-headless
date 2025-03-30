import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSection from './sections/ProfileSection';
import AddressesSection from './sections/AddressesSection';
import OrdersSection from './sections/OrdersSection';
import ReferralsSection from './sections/ReferralsSection';
import alertService from '../../services/alertService';
import AnimatedModal from '../ui/AnimatedModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: 'profile' | 'addresses' | 'orders' | 'referrals';
}

const ProfileModal = ({ isOpen, onClose, activeSection = 'profile' }: ProfileModalProps) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(activeSection);
  
  // Actualizar la pestaña activa cuando cambia activeSection
  useEffect(() => {
    if (activeSection) {
      setActiveTab(activeSection);
    }
  }, [activeSection]);

  const handleLogout = () => {
    alertService.confirm('¿Estás seguro de que deseas cerrar sesión?', () => {
      logout();
      onClose();
    });
  };

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-4xl"
      title="Mi cuenta"
    >
      <div className="flex flex-col md:flex-row rounded-lg">
        {/* Barra lateral con tabs */}
        <div className="md:w-1/4 bg-gray-50 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200 rounded-l-lg">
          <div className="space-y-2">
            <button
              className={`w-full text-left p-3 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'profile' ? 'bg-primario text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Perfil</span>
            </button>
            
            <button
              className={`w-full text-left p-3 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'addresses' ? 'bg-primario text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('addresses')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Direcciones</span>
            </button>
            
            <button
              className={`w-full text-left p-3 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'orders' ? 'bg-primario text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Pedidos</span>
            </button>
            
            <button
              className={`w-full text-left p-3 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'referrals' ? 'bg-primario text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('referrals')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Mis Referidos</span>
            </button>
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                className="w-full text-left p-3 rounded-md flex items-center space-x-2 text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenido de la tab activa */}
        <div className="md:w-3/4 p-4 md:p-6">
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'addresses' && <AddressesSection />}
          {activeTab === 'orders' && <OrdersSection />}
          {activeTab === 'referrals' && <ReferralsSection onClose={onClose} />}
        </div>
      </div>
    </AnimatedModal>
  );
};

export default ProfileModal;
