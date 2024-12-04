import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const TokenGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TokenCard = styled.div<{ isAnimating?: boolean; animationType?: 'positive' | 'negative' }>`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  backdrop-filter: blur(8px);
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${props => props.isAnimating 
    ? props.animationType === 'positive' 
      ? 'tokenPump 1s ease infinite'
      : 'tokenDump 1s ease infinite'
    : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  }

  @keyframes tokenPump {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-10px) scale(1.02); 
          box-shadow: 0 15px 40px rgba(52, 211, 153, 0.3); }
  }

  @keyframes tokenDump {
    0%, 100% { transform: translateY(0) rotate(0); }
    25% { transform: translateY(5px) rotate(-2deg); }
    75% { transform: translateY(5px) rotate(2deg); }
  }
`;

const TokenHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const TokenIcon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const TokenName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
`;

const TokenSymbol = styled.div`
  color: #666;
  font-size: 14px;
  margin-left: 8px;
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 150px;
`;

const Price = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
`;

const PriceChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  font-weight: 500;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props => props.positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
`;

const BondingCurveAnimation = keyframes`
  0% {
    transform: scaleX(0.1);
    background-position: 0% 50%;
  }
  50% {
    transform: scaleX(1.2);
  }
  100% {
    transform: scaleX(1);
    background-position: 100% 50%;
  }
`;

const BondingCurveBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 14px;
  background: green;
  border-radius: 10px;

  background-size: 200% 100%;
  margin-top: 8px;
  transform-origin: left;
  transform: scaleX(${props => props.progress});
  animation: ${BondingCurveAnimation} 2s ease-out;
`;

const TokenStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatLabel = styled.span`
  color: #999;
  font-size: 10px;
`;

const StatValue = styled.span`
  color: #333;
  font-weight: 600;
`;

interface Token {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  priceHistory: number[];
  holders: number;
  website?: string;
  twitter?: string;
  youtube?: string;
  telegram?: string;
  creatorId?: string;
  bondingProgress?: number;
  liquidity?: number;
}

interface Props {
  onTokenSelect: (tokenId: string) => void;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  elements: {
    point: {
      radius: 0,
    },
    line: {
      tension: 0.4,
    },
  },
};

export const TokenList: React.FC<Props> = ({ onTokenSelect }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [animatingToken, setAnimatingToken] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<'positive' | 'negative'>('positive');

  useEffect(() => {
    // Mock data - Replace with actual API calls
    const mockTokens: Token[] = [
      {
        id: '1',
        name: 'Pumpie Token',
        symbol: 'PUMP',
        imageUrl: 'https://picsum.photos/200',  // Placeholder image
        price: 1.5,
        priceChange24h: 5.2,
        marketCap: 1000000,
        volume24h: 250000,
        holders: 1200,
        priceHistory: [1.2, 1.3, 1.4, 1.5, 1.45, 1.6, 1.5],
        website: 'https://example.com',
        twitter: 'https://twitter.com/example',
        youtube: 'https://youtube.com/example',
        telegram: 'https://t.me/example',
        creatorId: '123',
        bondingProgress: 0.5,
        liquidity: 500000,
      },
      {
        id: '2',
        name: 'Sample Token',
        symbol: 'SMPL',
        imageUrl: 'https://picsum.photos/201',  // Different placeholder image
        price: 2.5,
        priceChange24h: -3.1,
        marketCap: 2000000,
        volume24h: 350000,
        holders: 2200,
        priceHistory: [2.3, 2.4, 2.2, 2.5, 2.4, 2.3, 2.5],
        website: 'https://example.com',
        twitter: 'https://twitter.com/example',
        youtube: 'https://youtube.com/example',
        telegram: 'https://t.me/example',
        creatorId: '124',
        bondingProgress: 0.8,
        liquidity: 750000,
      },
    ];
    setTokens(mockTokens);
  }, []);

  useEffect(() => {
    // Listen for sentiment events from chat
    const handleTokenAnimation = (event: CustomEvent<{ sentiment: 'positive' | 'negative' }>) => {
      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
      setAnimatingToken(randomToken.id);
      setAnimationType(event.detail.sentiment);
      
      // Reset animation after delay
      setTimeout(() => {
        setAnimatingToken(null);
      }, 2000);
    };

    window.addEventListener('tokenAnimation', handleTokenAnimation as EventListener);
    return () => {
      window.removeEventListener('tokenAnimation', handleTokenAnimation as EventListener);
    };
  }, [tokens]);

  return (
    <TokenGrid>
      {tokens.map((token) => (
        <TokenCard 
          key={token.id}
          onClick={() => onTokenSelect(token.id)}
          isAnimating={animatingToken === token.id}
          animationType={animationType}
        >
          <TokenHeader>
            <TokenInfo>
              <TokenIcon src={token.imageUrl} alt={token.name} />
              <div>
                <TokenName>{token.name}</TokenName>
                <TokenSymbol>{token.symbol}</TokenSymbol>
              </div>
            </TokenInfo>
            <PriceInfo>
              <Price>${token.price.toFixed(2)}</Price>
              <PriceChange positive={token.priceChange24h > 0}>
                {token.priceChange24h.toFixed(2)}%
              </PriceChange>
            </PriceInfo>
          </TokenHeader>
          
          <BondingCurveBar progress={token.bondingProgress || Math.random()} />
          
          <TokenStats>
            <StatItem>
              <StatLabel>Market Cap</StatLabel>
              <StatValue>${(token.marketCap / 1000000).toFixed(1)}M</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Volume 24h</StatLabel>
              <StatValue>${(token.volume24h / 1000000).toFixed(1)}M</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Liquidity</StatLabel>
              <StatValue>${(token.liquidity ?? 0 / 1000000).toFixed(1)}M</StatValue>
            </StatItem>
          </TokenStats>
        </TokenCard>
      ))}
    </TokenGrid>
  );
};
