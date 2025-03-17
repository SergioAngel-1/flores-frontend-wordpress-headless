import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSection from './sections/ProfileSection';
import AddressesSection from './sections/AddressesSection';
import OrdersSection from './sections/OrdersSection';
import FavoritesSection from './sections/FavoritesSection';
import alertService from '../../services/alertService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: 'profile' | 'addresses' | 'orders' | 'favorites';
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

  if (!isOpen) return null;

  const handleLogout = () => {
    alertService.confirm('¿Estás seguro de que deseas cerrar sesión?', () => {
      logout();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-medium text-gray-900">Mi cuenta</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-64 bg-gray-50 p-4 md:border-r">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'profile' 
                    ? 'bg-primario text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'addresses' 
                    ? 'bg-primario text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Direcciones
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'orders' 
                    ? 'bg-primario text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Pedidos
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'favorites' 
                    ? 'bg-primario text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favoritos
              </button>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'addresses' && <AddressesSection />}
            {activeTab === 'orders' && <OrdersSection />}
            {activeTab === 'favorites' && <FavoritesSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
