import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiConfig';
import { pointsService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styled from 'styled-components';
import { FaCoins, FaUsers, FaCopy, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Tipos de datos
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

interface Referral {
  id: number;
  name: string;
  registration_date: string;
  level: number;
  total_points_generated: number;
}

interface ReferralCode {
  code: string;
  url: string;
}

interface ReferralStats {
  total_referrals: number;
  direct_referrals: number;
  indirect_referrals: number;
  total_points_generated: number;
}

// Componente principal
const PointsRewards: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'referrals'>('summary');
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPoints();
      fetchReferralCode();

      if (activeTab === 'transactions') {
        fetchTransactions();
      } else if (activeTab === 'referrals') {
        fetchReferrals();
      }
    }
  }, [isAuthenticated, activeTab]);

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      const response = await pointsService.getUserPoints();
      setUserPoints(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar tus puntos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await pointsService.getPointsTransactions();
      setTransactions(response.data.transactions);
      setError(null);
    } catch (err) {
      setError('Error al cargar el historial de transacciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await pointsService.getReferralStats();
      setReferrals(response.data.referrals);
      setReferralStats(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar tus referidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const response = await pointsService.getReferralCode();
      setReferralCode(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('¡Copiado al portapapeles!'))
      .catch(err => console.error('Error al copiar: ', err));
  };

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'earned': return 'Ganado por compra';
      case 'used': return 'Usado en compra';
      case 'expired': return 'Expirado';
      case 'admin_add': return 'Añadido por admin';
      case 'admin_deduct': return 'Deducido por admin';
      case 'referral': return 'Comisión de referido';
      default: return type;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Message>Debes iniciar sesión para ver tus puntos y referidos</Message>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Mis Puntos y Referidos</Title>

      <TabsContainer>
        <Tab 
          active={activeTab === 'summary'} 
          onClick={() => setActiveTab('summary')}
        >
          Resumen
        </Tab>
        <Tab 
          active={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')}
        >
          Historial de Transacciones
        </Tab>
        <Tab 
          active={activeTab === 'referrals'} 
          onClick={() => setActiveTab('referrals')}
        >
          Mis Referidos
        </Tab>
      </TabsContainer>

      {loading && <Loading>Cargando...</Loading>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {activeTab === 'summary' && userPoints && referralCode && (
        <SummaryContainer>
          <PointsSummary>
            <SummaryCard>
              <CardIcon><FaCoins size={36} /></CardIcon>
              <CardContent>
                <CardTitle>Mis Puntos</CardTitle>
                <PointsBalance>{userPoints.balance}</PointsBalance>
                <PointsValue>
                  Valor aproximado: ${userPoints.monetary_value.toFixed(2)}
                </PointsValue>
                <StatsRow>
                  <StatItem>
                    <StatLabel>Total ganado:</StatLabel>
                    <StatValue>{userPoints.total_earned}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Total usado:</StatLabel>
                    <StatValue>{userPoints.used}</StatValue>
                  </StatItem>
                </StatsRow>
              </CardContent>
            </SummaryCard>
          </PointsSummary>

          <ReferralSection>
            <SectionTitle>Invita a tus amigos</SectionTitle>
            <SectionDescription>
              Invita a tus amigos y gana puntos por sus compras. ¡Es muy fácil!
            </SectionDescription>

            <ReferralCard>
              <ReferralTitle>Tu código de referido:</ReferralTitle>
              <ReferralCodeDisplay>
                <CodeValue>{referralCode.code}</CodeValue>
                <CopyButton onClick={() => copyToClipboard(referralCode.code)}>
                  <FaCopy /> Copiar
                </CopyButton>
              </ReferralCodeDisplay>

              <ReferralTitle>Tu enlace de referido:</ReferralTitle>
              <ReferralLinkDisplay>
                <LinkInput readOnly value={referralCode.url} onClick={e => (e.target as HTMLInputElement).select()} />
                <CopyButton onClick={() => copyToClipboard(referralCode.url)}>
                  <FaCopy /> Copiar
                </CopyButton>
              </ReferralLinkDisplay>

              <ShareButtons>
                <ShareTitle>Compartir:</ShareTitle>
                <SocialButton 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralCode.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="#3b5998"
                >
                  <FaFacebook /> Facebook
                </SocialButton>
                <SocialButton 
                  href={`https://wa.me/?text=${encodeURIComponent(`¡Usa mi código de referido para obtener beneficios al comprar! ${referralCode.url}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="#25d366"
                >
                  <FaWhatsapp /> WhatsApp
                </SocialButton>
              </ShareButtons>
            </ReferralCard>
          </ReferralSection>
        </SummaryContainer>
      )}

      {activeTab === 'transactions' && (
        <TransactionsContainer>
          {transactions.length === 0 ? (
            <EmptyState>
              <EmptyMessage>No tienes transacciones de puntos aún</EmptyMessage>
            </EmptyState>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Fecha</TableHeader>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Puntos</TableHeader>
                  <TableHeader>Descripción</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{getTransactionTypeLabel(transaction.type)}</TableCell>
                    <TableCell className={transaction.points >= 0 ? 'positive' : 'negative'}>
                      {transaction.points > 0 ? `+${transaction.points}` : transaction.points}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TransactionsContainer>
      )}

      {activeTab === 'referrals' && referralStats && (
        <ReferralsContainer>
          <ReferralStatsCard>
            <StatBlock>
              <StatBlockTitle>Total de Referidos</StatBlockTitle>
              <StatBlockValue>{referralStats.total_referrals}</StatBlockValue>
            </StatBlock>
            <StatBlock>
              <StatBlockTitle>Referidos Directos</StatBlockTitle>
              <StatBlockValue>{referralStats.direct_referrals}</StatBlockValue>
            </StatBlock>
            <StatBlock>
              <StatBlockTitle>Referidos Indirectos</StatBlockTitle>
              <StatBlockValue>{referralStats.indirect_referrals}</StatBlockValue>
            </StatBlock>
            <StatBlock>
              <StatBlockTitle>Puntos Generados</StatBlockTitle>
              <StatBlockValue>{referralStats.total_points_generated}</StatBlockValue>
            </StatBlock>
          </ReferralStatsCard>

          {referrals.length === 0 ? (
            <EmptyState>
              <EmptyIcon><FaUsers size={48} /></EmptyIcon>
              <EmptyMessage>No tienes referidos aún. ¡Comparte tu código y comienza a ganar puntos!</EmptyMessage>
            </EmptyState>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Fecha de registro</TableHeader>
                  <TableHeader>Nivel</TableHeader>
                  <TableHeader>Puntos generados</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.map(referral => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.name}</TableCell>
                    <TableCell>{formatDate(referral.registration_date)}</TableCell>
                    <TableCell>{referral.level === 1 ? 'Directo' : 'Indirecto'}</TableCell>
                    <TableCell>{referral.total_points_generated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ReferralsContainer>
      )}
    </Container>
  );
};

// Estilos
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 25px;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  background-color: ${props => props.active ? '#fff' : '#f5f5f5'};
  border: 1px solid #ddd;
  border-bottom: ${props => props.active ? '1px solid #fff' : '1px solid #ddd'};
  border-radius: 4px 4px 0 0;
  margin-right: 5px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  position: relative;
  bottom: -1px;

  &:hover {
    background-color: ${props => props.active ? '#fff' : '#eee'};
  }
`;

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const PointsSummary = styled.div``;

const SummaryCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
`;

const CardIcon = styled.div`
  background-color: #f0f8ff;
  color: #0066cc;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  color: #555;
  margin: 0 0 10px 0;
`;

const PointsBalance = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #0066cc;
  margin-bottom: 5px;
`;

const PointsValue = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 20px;
`;

const StatItem = styled.div`
  flex: 1;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: #777;
  margin-right: 5px;
`;

const StatValue = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const ReferralSection = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  color: #333;
  margin: 0 0 10px 0;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
`;

const ReferralCard = styled.div`
  background-color: #f7f9fc;
  border-radius: 6px;
  padding: 20px;
  border: 1px solid #e0e6ed;
`;

const ReferralTitle = styled.h4`
  font-size: 15px;
  color: #555;
  margin: 0 0 10px 0;
`;

const ReferralCodeDisplay = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const CodeValue = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 12px 15px;
  border-radius: 4px;
  font-size: 18px;
  letter-spacing: 1px;
  font-family: monospace;
  flex: 1;
  text-align: center;
  margin-right: 10px;
`;

const CopyButton = styled.button`
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #0055bb;
  }
`;

const ReferralLinkDisplay = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const LinkInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 10px;
`;

const ShareButtons = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const ShareTitle = styled.span`
  font-size: 14px;
  color: #555;
  margin-right: 10px;
`;

const SocialButton = styled.a<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }
`;

const TransactionsContainer = styled.div``;

const ReferralsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const ReferralStatsCard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const StatBlock = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatBlockTitle = styled.h4`
  font-size: 14px;
  color: #555;
  margin: 0 0 8px 0;
`;

const StatBlockValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #0066cc;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
`;

const TableBody = styled.tbody`
  & tr:nth-child(odd) {
    background-color: #fafafa;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f0f7ff;
  }
`;

const TableHeader = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-size: 14px;
  color: #555;
  border-bottom: 2px solid #eee;
`;

const TableCell = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #333;

  &.positive {
    color: #28a745;
    font-weight: bold;
  }

  &.negative {
    color: #dc3545;
    font-weight: bold;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #fff0f0;
  color: #c00;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
`;

const Message = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  color: #555;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: #bbb;
  margin-bottom: 15px;
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  color: #777;
  max-width: 500px;
  margin: 0;
`;

export default PointsRewards;
