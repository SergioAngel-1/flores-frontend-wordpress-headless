import { FC, useState, useEffect } from 'react';
import AnimatedModal from '../ui/AnimatedModal';
import { pointsService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import alertify from 'alertifyjs';
import { FiSend, FiArrowRight, FiCheck, FiX, FiLoader } from 'react-icons/fi';

interface WalletModalProps {
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

const WalletModal: FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [recipientCode, setRecipientCode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [recipientValid, setRecipientValid] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<any>(null);
  const [transferring, setTransferring] = useState(false);

  // Cargar datos de puntos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadUserPoints();
      
      // Limpiar formulario
      setTransferAmount(0);
      setRecipientCode('');
      setNotes('');
      setRecipientValid(false);
      setRecipientInfo(null);
    }
  }, [isOpen]);

  // Cargar puntos del usuario
  const loadUserPoints = async () => {
    try {
      setLoading(true);
      const response = await pointsService.getUserPoints();
      setPoints(response.data);
    } catch (error) {
      console.error('Error al cargar puntos:', error);
      alertify.error('No se pudieron cargar tus Flores Coins. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Validar código de referido
  const validateReferralCode = async () => {
    if (!recipientCode.trim()) {
      alertify.error('Ingresa un código de referido');
      return;
    }

    try {
      setValidatingCode(true);
      const response = await pointsService.validateReferralCode(recipientCode);
      
      if (response.data.success) {
        setRecipientValid(true);
        setRecipientInfo(response.data.user);
        alertify.success(`Código válido para ${response.data.user.name}`);
      } else {
        setRecipientValid(false);
        setRecipientInfo(null);
        alertify.error(response.data.message || 'Código de referido no válido');
      }
    } catch (error: any) {
      setRecipientValid(false);
      setRecipientInfo(null);
      alertify.error(error.response?.data?.message || 'Error al validar el código de referido');
    } finally {
      setValidatingCode(false);
    }
  };

  // Realizar la transferencia
  const handleTransfer = async () => {
    if (!recipientValid) {
      alertify.error('Primero valida el código de referido');
      return;
    }

    if (!transferAmount || transferAmount <= 0) {
      alertify.error('Ingresa una cantidad válida mayor que cero');
      return;
    }

    if (points && transferAmount > points.balance) {
      alertify.error('No tienes suficientes Flores Coins para esta transferencia');
      return;
    }

    try {
      setTransferring(true);
      const response = await pointsService.transferPoints(recipientCode, transferAmount, notes);
      
      if (response.data.success) {
        alertify.success(response.data.message);
        
        // Actualizar el saldo de puntos
        setPoints(prev => prev ? { ...prev, balance: response.data.new_balance } : null);
        
        // Limpiar formulario
        setTransferAmount(0);
        setRecipientCode('');
        setNotes('');
        setRecipientValid(false);
        setRecipientInfo(null);
      } else {
        alertify.error(response.data.message);
      }
    } catch (error: any) {
      alertify.error(error.response?.data?.message || 'Error al realizar la transferencia');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-md"
      title="Mi Billetera"
    >
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primario"></div>
          </div>
        ) : (
          <>
            {/* Saldo actual */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-green-700 mb-1">Mi Saldo</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-green-600 mr-2">
                  {points?.balance ?? 0}
                </span>
                <span className="text-sm text-green-600">Flores Coins</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Valor aproximado: {formatCurrency(points?.monetary_value ?? 0)}
              </p>
            </div>
            
            {/* Formulario de transferencia */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transferir Flores Coins</h3>
              
              {/* Código de referido */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de referido del destinatario
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientCode}
                    onChange={(e) => setRecipientCode(e.target.value)}
                    disabled={recipientValid || validatingCode}
                    placeholder="Ej: ABC123"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  />
                  <button
                    onClick={validateReferralCode}
                    disabled={validatingCode || recipientValid}
                    className="bg-primario text-white px-3 py-2 rounded-md hover:bg-primario-dark transition-colors disabled:bg-gray-400"
                  >
                    {validatingCode ? (
                      <FiLoader className="animate-spin" />
                    ) : recipientValid ? (
                      <FiCheck />
                    ) : (
                      "Validar"
                    )}
                  </button>
                </div>
                
                {/* Información del destinatario */}
                {recipientValid && recipientInfo && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                    <div className="flex items-center text-sm text-green-700">
                      <FiCheck className="mr-1" />
                      <span>Enviar a: <b>{recipientInfo.name}</b></span>
                    </div>
                    <button 
                      onClick={() => {
                        setRecipientValid(false);
                        setRecipientInfo(null);
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Cantidad */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Flores Coins
                </label>
                <input
                  type="number"
                  min="1"
                  max={points?.balance ?? 0}
                  value={transferAmount || ''}
                  onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                  placeholder="Cantidad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  disabled={!recipientValid || transferring}
                />
                {points && (
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo disponible: {points.balance} Flores Coins
                  </p>
                )}
              </div>
              
              {/* Nota */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nota (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade un mensaje para el destinatario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  disabled={!recipientValid || transferring}
                  rows={2}
                />
              </div>
              
              {/* Botón de transferencia */}
              <button
                onClick={handleTransfer}
                disabled={!recipientValid || transferAmount <= 0 || transferring || (points ? transferAmount > points.balance : true)}
                className="w-full bg-primario text-white py-3 px-4 rounded-md hover:bg-primario-dark transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {transferring ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Transferir {transferAmount > 0 ? transferAmount : ''} Flores Coins</span>
                    {transferAmount > 0 && recipientInfo && (
                      <span className="flex items-center">
                        <FiArrowRight className="mx-1" />
                        {recipientInfo.name}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </AnimatedModal>
  );
};

export default WalletModal;
