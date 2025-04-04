import React, { useRef, useState } from 'react';
import floresCoinsImage from '../../assets/images/Flores-coins.png';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ReferralInfoModal from '../modals/ReferralInfoModal';

// Registrar el plugin useGSAP
gsap.registerPlugin(useGSAP);

const FloresCoinsBannerNew: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Usar useGSAP para manejar la animación de rotación
  useGSAP(() => {
    // Crear la animación de rotación con GSAP en lugar de CSS
    gsap.to('.coin-image', {
      rotateZ: 360,
      repeat: -1, // Repetir infinitamente
      duration: 5,
      ease: 'linear',
      transformOrigin: 'center center'
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      <div className="mt-6 bg-gradient-to-r from-primario to-secundario rounded-lg p-4 text-white">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <img 
              src={floresCoinsImage} 
              alt="Flores Coins" 
              className="w-16 h-16 coin-image" 
            />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Flores Coins</h3>
            <p className="text-sm mb-2">Acumula puntos en cada compra y canjéalos por descuentos exclusivos.</p>
            <button 
              onClick={() => setModalOpen(true)}
              className="inline-block px-3 py-1 bg-white text-primario rounded-md text-xs font-medium hover:bg-opacity-90 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Conoce más
            </button>
          </div>
        </div>
      </div>
      {/* Modal informativo sobre Flores Coins y Referidos */}
      <ReferralInfoModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};

export default FloresCoinsBannerNew;
