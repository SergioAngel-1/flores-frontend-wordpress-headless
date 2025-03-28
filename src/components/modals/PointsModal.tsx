import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGift, FiUsers } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import { pointsService } from '../../services/api';
import AnimatedModal from '../ui/AnimatedModal';

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserPoints {
  balance: number;
  total_earned: number;
  used: number;
  monetary_value: number;
  conversion_rate: number;
}

const PointsModal: FC<PointsModalProps> = ({ isOpen, onClose }) => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPoints = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const response = await pointsService.getUserPoints();
        setPoints(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar datos de puntos:', err);
        setError('No se pudieron cargar los datos de puntos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [isOpen]);

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-md"
      title={
        <div className="flex items-center text-primario">
          <FiGift className="mr-2" /> 
          <span>Mis Puntos</span>
        </div>
      }
    >
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primario"></div>
            <p className="ml-3 text-primario font-medium">Cargando...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 bg-primario text-white py-1 px-3 rounded-md hover:bg-hover transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : points ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Puntos Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{points.balance}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Valor: {formatCurrency(points.monetary_value)}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Tipo de Cambio</p>
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(points.conversion_rate)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Puntos por peso
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Total Ganados</p>
                <p className="text-xl font-bold text-blue-600">{points.total_earned}</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Utilizados</p>
                <p className="text-xl font-bold text-purple-600">{points.used}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Link 
                to="/referidos" 
                className="bg-primario hover:text-white text-white py-2 px-4 rounded-md hover:bg-hover transition-colors flex items-center"
                onClick={onClose}
              >
                <FiUsers className="mr-2" /> Ver página completa de referidos
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No hay información de puntos disponible.</p>
          </div>
        )}
      </div>
    </AnimatedModal>
  );
};

export default PointsModal;
