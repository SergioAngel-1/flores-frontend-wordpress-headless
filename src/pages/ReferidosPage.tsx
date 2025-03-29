import { useState, useEffect } from 'react';
import { FiUsers, FiCopy, FiGift, FiClock, FiBarChart } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import alertify from 'alertifyjs';
import { pointsService } from '../services/api';
import { 
  FaFacebook, 
  FaInstagram,
  FaWhatsapp,
  FaTelegram,
  FaGlobe,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaPinterest
} from 'react-icons/fa';

interface UserPoints {
  balance: number;
  total_earned: number;
  used: number;
  monetary_value: number;
  conversion_rate: number;
}

interface Transaction {
  id: number;
  date: string;
  type: string;
  points: number;
  description: string;
  expires_at: string | null;
}

interface ReferralStats {
  total_referrals: number;
  direct_referrals: number;
  indirect_referrals: number;
  total_points_generated: number;
}

interface ReferralInfo {
  code: string;
  url: string;
}

const ReferidosPage = () => {
  // Estados
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener puntos del usuario
        const pointsResponse = await pointsService.getUserPoints();
        
        // Obtener transacciones
        const transactionsResponse = await pointsService.getPointsTransactions(page);
        
        // Obtener estadísticas de referidos
        const referralStatsResponse = await pointsService.getReferralStats();
        console.log('Datos de estadísticas de referidos en componente:', referralStatsResponse.data);
        
        // Obtener código de referido
        const referralCodeResponse = await pointsService.getReferralCode();
        
        // Actualizar estados
        setPoints(pointsResponse.data);
        setTransactions(transactionsResponse.data.transactions);
        setTotalPages(transactionsResponse.data.total_pages);
        setReferralStats(referralStatsResponse.data);
        
        // Modificar la URL para usar el dominio del frontend en lugar del backend
        if (referralCodeResponse.data) {
          const frontendUrl = window.location.origin; // Obtiene el dominio actual del frontend
          const code = referralCodeResponse.data.code;
          
          // Crear la URL de referido con el dominio del frontend
          const referralUrl = `${frontendUrl}?ref=${code}`;
          
          setReferralInfo({
            code: code,
            url: referralUrl
          });
        } else {
          setReferralInfo(referralCodeResponse.data);
        }
        
        setError('');
      } catch (err) {
        console.error('Error al cargar datos de referidos y puntos:', err);
        setError('No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  // Cargar más transacciones
  const loadMoreTransactions = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Función para copiar al portapapeles
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alertify.success(message);
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        alertify.error('No se pudo copiar al portapapeles');
      });
  };

  // Función para compartir en redes sociales
  const shareViaNetwork = (network: string) => {
    if (!referralInfo) return;
    
    const message = `¡Usa mi código de referido ${referralInfo.code} para obtener descuentos en tu primera compra!`;
    const url = referralInfo.url;
    
    let shareUrl = '';
    
    switch (network.toLowerCase()) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(message)}`;
        break;
      default:
        shareUrl = url;
    }
    
    window.open(shareUrl, '_blank');
  };

  // Renderizar icono de red social
  const renderSocialIcon = (socialIcon: string, size: number = 20) => {
    switch (socialIcon.toLowerCase()) {
      case 'facebook':
        return <FaFacebook size={size} />;
      case 'instagram':
        return <FaInstagram size={size} />;
      case 'whatsapp':
        return <FaWhatsapp size={size} />;
      case 'telegram':
        return <FaTelegram size={size} />;
      case 'twitter':
        return <FaTwitter size={size} />;
      case 'youtube':
        return <FaYoutube size={size} />;
      case 'tiktok':
        return <FaTiktok size={size} />;
      case 'pinterest':
        return <FaPinterest size={size} />;
      default:
        return <FaGlobe size={size} />;
    }
  };

  // Obtener color de la red social
  const getSocialColor = (socialIcon: string): string => {
    switch (socialIcon.toLowerCase()) {
      case 'facebook':
        return 'bg-[#3b5998] hover:bg-[#2d4373]';
      case 'instagram':
        return 'bg-[#e1306c] hover:bg-[#c13584]';
      case 'whatsapp':
        return 'bg-[#25D366] hover:bg-[#128C7E]';
      case 'telegram':
        return 'bg-[#0088cc] hover:bg-[#0077b5]';
      case 'twitter':
        return 'bg-[#1DA1F2] hover:bg-[#0c85d0]';
      case 'youtube':
        return 'bg-[#FF0000] hover:bg-[#cc0000]';
      case 'tiktok':
        return 'bg-[#000000] hover:bg-[#333333]';
      case 'pinterest':
        return 'bg-[#E60023] hover:bg-[#bd001f]';
      default:
        return 'bg-[#3b5998] hover:bg-[#2d4373]';
    }
  };

  // Lista de redes sociales disponibles
  const socialNetworks = [
    { id: 'facebook', name: 'Facebook' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'whatsapp', name: 'WhatsApp' },
    { id: 'telegram', name: 'Telegram' },
    { id: 'twitter', name: 'Twitter' }
  ];

  // Renderizar tipo de transacción
  const renderTransactionType = (type: string) => {
    const types: Record<string, { label: string, icon: React.ReactNode, color: string }> = {
      earned: { 
        label: 'Ganado por compra', 
        icon: <FiGift className="mr-1" />, 
        color: 'text-green-600' 
      },
      used: { 
        label: 'Usado en compra', 
        icon: <FiClock className="mr-1" />, 
        color: 'text-red-600' 
      },
      expired: { 
        label: 'Expirado', 
        icon: <FiClock className="mr-1" />, 
        color: 'text-red-600' 
      },
      admin_add: { 
        label: 'Añadido por admin', 
        icon: <FiBarChart className="mr-1" />, 
        color: 'text-blue-600' 
      },
      admin_deduct: { 
        label: 'Deducido por admin', 
        icon: <FiBarChart className="mr-1" />, 
        color: 'text-orange-600' 
      },
      referral: { 
        label: 'Comisión de referido', 
        icon: <FiUsers className="mr-1" />, 
        color: 'text-purple-600' 
      }
    };
    
    const defaultType = { label: type, icon: <FiGift className="mr-1" />, color: 'text-gray-600' };
    const typeInfo = types[type] || defaultType;
    
    return (
      <span className={`flex items-center ${typeInfo.color}`}>
        {typeInfo.icon} {typeInfo.label}
      </span>
    );
  };

  // Si está cargando, mostrar spinner
  if (loading && !points && !referralInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
          <p className="ml-3 text-primario font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-primario text-white py-2 px-4 rounded-md hover:bg-hover transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-oscuro mb-6 flex items-center">
        <FiUsers className="mr-2 text-primario" />
        Mis Referidos y Flores Coins
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sección de Flores Coins y Estadísticas */}
        <div className="lg:col-span-2">
          {/* Sección de Flores Coins */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold text-oscuro mb-3 border-b pb-2">Mi Saldo de Flores Coins</h2>
            
            {points && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Flores Coins Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{points.balance}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor: {formatCurrency(points.monetary_value)}
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Ganados</p>
                  <p className="text-2xl font-bold text-blue-600">{points.total_earned}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Histórico
                  </p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Utilizados</p>
                  <p className="text-2xl font-bold text-purple-600">{points.used}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    En compras
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Tipo de Cambio</p>
                  <p className="text-2xl font-bold text-yellow-600" data-component-name="ReferidosPage">
                    {points.conversion_rate ? `1 : ${points.conversion_rate}` : 'No disponible'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Peso por Flores Coin
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Sección de Estadísticas de Referidos */}
          {referralStats && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h2 className="text-lg font-semibold text-oscuro mb-3 border-b pb-2">Estadísticas de Referidos</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Referidos</p>
                  <p className="text-2xl font-bold text-indigo-600">{referralStats.total_referrals}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Todos los niveles
                  </p>
                </div>
                
                <div className="bg-teal-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Directos</p>
                  <p className="text-2xl font-bold text-teal-600">{referralStats.direct_referrals}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Primer nivel
                  </p>
                </div>
                
                <div className="bg-pink-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Indirectos</p>
                  <p className="text-2xl font-bold text-pink-600">{referralStats.indirect_referrals}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Otros niveles
                  </p>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Flores Coins Generados</p>
                  <p className="text-2xl font-bold text-amber-600">{referralStats.total_points_generated}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Por referidos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Sección de Código de Referido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold text-oscuro mb-3 border-b pb-2">Mi Código de Referido</h2>
            
            {referralInfo && (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Tu código único:</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-mono font-bold text-primario tracking-wider">{referralInfo.code}</p>
                    <button 
                      onClick={() => copyToClipboard(referralInfo.code, 'Código copiado al portapapeles')}
                      className="bg-primario text-white p-2 rounded-md hover:bg-hover transition-colors"
                      aria-label="Copiar código"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1">Tu enlace de referido:</p>
                  <div className="flex items-stretch">
                    <input 
                      type="text" 
                      value={referralInfo.url} 
                      readOnly 
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primario"
                    />
                    <button 
                      onClick={() => copyToClipboard(referralInfo.url, 'Enlace copiado al portapapeles')}
                      className="bg-primario text-white px-2 py-1 rounded-r-md hover:bg-hover transition-colors"
                      aria-label="Copiar enlace"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-2">Compartir con amigos:</p>
                  <div className="flex flex-wrap gap-2">
                    {socialNetworks.map(network => (
                      <button 
                        key={network.id}
                        onClick={() => shareViaNetwork(network.id)}
                        className={`text-white px-3 py-1 rounded-md transition-colors flex items-center text-sm ${getSocialColor(network.id)}`}
                      >
                        <span className="mr-1">{renderSocialIcon(network.id)}</span>
                        {network.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sección de Historial de Flores Coins */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <h2 className="text-lg font-semibold text-oscuro mb-3 border-b pb-2">Historial de Flores Coins</h2>
        
        {transactions.length === 0 ? (
          <div className="bg-gray-50 p-4 text-center rounded-md">
            <p className="text-gray-600">No tienes transacciones de Flores Coins.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flores Coins</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiración</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {renderTransactionType(transaction.type)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <span className={transaction.points > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {transaction.description}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {transaction.expires_at ? new Date(transaction.expires_at).toLocaleDateString() : 'No expira'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {page < totalPages && (
              <div className="flex justify-center mt-4">
                <button 
                  onClick={loadMoreTransactions}
                  className="bg-primario text-white px-3 py-1 text-sm rounded-md hover:bg-secundario transition-colors"
                >
                  Cargar más transacciones
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReferidosPage;
