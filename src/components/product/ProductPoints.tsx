import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import styled from 'styled-components';
import { FaCoins } from 'react-icons/fa';

interface ProductPointsProps {
  productId: number;
}

interface PointsData {
  product_id: number;
  points: number;
}

const ProductPoints: React.FC<ProductPointsProps> = ({ productId }) => {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductPoints = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/floresinc/v1/product/${productId}/points`);
        setPointsData(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los puntos del producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductPoints();
    }
  }, [productId]);

  if (loading) return null;
  if (error || !pointsData || pointsData.points <= 0) return null;

  return (
    <PointsContainer>
      <PointsIcon>
        <FaCoins />
      </PointsIcon>
      <PointsContent>
        <PointsValue>{pointsData.points}</PointsValue>
        <PointsLabel>puntos al comprar</PointsLabel>
      </PointsContent>
    </PointsContainer>
  );
};

const PointsContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #e6f7e6;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  padding: 10px 15px;
  margin: 15px 0;
  max-width: 300px;
`;

const PointsIcon = styled.div`
  color: #2e7d32;
  margin-right: 10px;
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const PointsContent = styled.div`
  display: flex;
  align-items: baseline;
`;

const PointsValue = styled.span`
  font-weight: bold;
  font-size: 18px;
  color: #2e7d32;
  margin-right: 5px;
`;

const PointsLabel = styled.span`
  color: #2e7d32;
  font-size: 14px;
`;

export default ProductPoints;
