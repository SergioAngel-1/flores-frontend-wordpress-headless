import { FC } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AddressBarProps {
  openProfileModal: () => void;
  openAddressSection?: () => void;
}

const AddressBar: FC<AddressBarProps> = ({ openProfileModal, openAddressSection }) => {
  const { isAuthenticated } = useAuth();
  
  // Dirección de ejemplo - en producción vendría del perfil del usuario
  const defaultAddress = {
    street: 'Calle 123 #45-67',
    city: 'Bogotá',
    neighborhood: 'Chapinero'
  };

  const handleAddressClick = () => {
    if (isAuthenticated) {
      openProfileModal();
      // Si existe la función para abrir la sección de direcciones, la llamamos
      if (openAddressSection) {
        openAddressSection();
      }
    } else {
      // Aquí podríamos abrir el modal de login
      console.log('Abrir modal de login');
    }
  };

  return (
    <span 
      className="text-primario text-sm font-bold hidden md:inline-block relative group px-2 pt-0 pb-1 shadow-sm rounded-b-lg overflow-hidden border-b-2 border-l-2 border-r-2 border-primario cursor-pointer"
      onClick={handleAddressClick}
    >
      <span className="absolute inset-0 bg-white group-hover:bg-gray-50 transition-colors duration-300 -z-10 rounded-b-lg"></span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="font-bold">
        {defaultAddress.neighborhood}, {defaultAddress.city}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
};

export default AddressBar;
