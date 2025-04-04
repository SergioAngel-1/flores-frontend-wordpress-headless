import { FC } from 'react';
import { Link } from 'react-router-dom';
import { FiGift, FiUsers, FiShare2 } from 'react-icons/fi';
import AnimatedModal from '../ui/AnimatedModal';

interface ReferralInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralInfoModal: FC<ReferralInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-md"
      title={
        <div className="flex items-center text-primario">
          <FiGift className="mr-2" /> 
          <span>Programa de Referidos y Flores Coins</span>
        </div>
      }
    >
      <div className="p-5">
        <div className="space-y-4">
          {/* Sección de información */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-primario mb-2 flex items-center">
              <FiShare2 className="mr-2" /> ¿Qué son los Flores Coins?
            </h3>
            <p className="text-gray-700 mb-3">
              Flores Coins es nuestro programa de recompensas que te permite ganar 
              puntos por cada compra y por referir a tus amigos y familiares.
            </p>
            <p className="text-gray-700">
              Los Flores Coins pueden ser canjeados por descuentos en tus próximas compras.
              ¡Mientras más compartas, más ahorras!
            </p>
          </div>

          {/* Sección de beneficios */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Gana por referir</p>
              <p className="text-2xl font-bold text-green-600">100</p>
              <p className="text-xs text-gray-500 mt-1">
                Flores Coins por referido
              </p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Beneficio adicional</p>
              <p className="text-xl font-bold text-yellow-600">5%</p>
              <p className="text-xs text-gray-500 mt-1">
                De las compras de tus referidos
              </p>
            </div>
          </div>
          
          {/* Cómo funciona */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold text-primario mb-2">¿Cómo funciona?</h3>
            <ol className="list-decimal pl-5 text-gray-700 space-y-1">
              <li>Comparte tu código único de referido con amigos y familiares</li>
              <li>Ellos se registran usando tu código</li>
              <li>Cuando realicen su primera compra, ambos ganan Flores Coins</li>
              <li>Además, seguirás ganando un porcentaje de sus compras futuras</li>
            </ol>
          </div>
          
          {/* Botón CTA */}
          <div className="mt-4 flex justify-center">
            <Link 
              to="/referidos" 
              className="bg-primario hover:text-white text-white py-2 px-4 rounded-md hover:bg-hover transition-colors flex items-center"
              onClick={onClose}
            >
              <FiUsers className="mr-2" /> Ir a mi página de Referidos
            </Link>
          </div>
          
          {/* Nota adicional */}
          <p className="text-xs text-gray-500 text-center mt-2">
            Consulta los términos y condiciones completos en tu área de referidos.
          </p>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default ReferralInfoModal;
