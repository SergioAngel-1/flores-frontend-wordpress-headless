import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pointsService } from '../../../services/api';
import { FiUsers, FiLink, FiArrowRight } from 'react-icons/fi';

interface ReferralStats {
  referrals_count: number;
  approved_referrals: number;
  pending_referrals: number;
  points_earned: number;
  referral_code: string;
}

interface ReferralsSectionProps {
  onClose?: () => void;
}

const ReferralsSection = ({ onClose }: ReferralsSectionProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const loadReferralStats = async () => {
      try {
        setLoading(true);
        // Obtener estadísticas de referidos
        const statsResponse = await pointsService.getReferralStats();
        // Obtener código de referido
        const codeResponse = await pointsService.getReferralCode();
        
        if (statsResponse?.data && codeResponse?.data?.code) {
          setStats({
            referrals_count: statsResponse.data.referrals_count || 0,
            approved_referrals: statsResponse.data.approved_referrals || 0,
            pending_referrals: statsResponse.data.pending_referrals || 0,
            points_earned: statsResponse.data.points_earned || 0,
            referral_code: codeResponse.data.code
          });
        }
      } catch (error) {
        console.error('Error al cargar datos de referidos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReferralStats();
  }, []);
  
  const copyReferralLink = () => {
    if (stats?.referral_code) {
      const referralUrl = `${window.location.origin}?ref=${stats.referral_code}`;
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Mis Referidos</h3>
      
      {/* Banner simplificado de referidos */}
      <div className="bg-gradient-to-r from-primario to-hover p-4 rounded-lg text-white mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h4 className="text-lg font-medium mb-2">Comparte y gana</h4>
            <p className="mb-2">Invita a tus amigos y gana Flores Coins por cada referido que se registre.</p>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center bg-white/20 rounded px-2 py-1">
                <FiUsers className="mr-1" />
                <span>Referidos: <strong>{stats?.referrals_count || 0}</strong></span>
              </div>
              
              <div className="flex items-center bg-white/20 rounded px-2 py-1">
                <span>Puntos ganados: <strong>{stats?.points_earned || 0}</strong></span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={copyReferralLink}
            className="mt-3 md:mt-0 flex items-center bg-white text-primario px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100"
          >
            <FiLink className="mr-2" />
            {copied ? 'Enlace copiado!' : 'Copiar mi enlace'}
          </button>
        </div>
      </div>
      
      {/* Enlace a página completa de referidos */}
      <div className="text-center">
        <Link 
          to="/referidos" 
          className="inline-flex items-center text-primario hover:text-hover transition-colors"
          onClick={onClose}
        >
          <span className="font-medium">Ver programa de referidos completo</span>
          <FiArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default ReferralsSection;
