import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import dragonfly from '../../assets/grass-with-dragon-fly-.png';
import treecharacter from '../../assets/treecharacter.png';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";

const Container = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 30px;
  overflow: hidden;
`;

const DragonfliesContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  pointer-events: none;
  z-index: -1;
  background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%);
`;

const Dragonfly = styled.img`
  width: 80px;
  opacity: 0.6;
  transform-origin: center;
  filter: brightness(0.95);
  animation: floatDragonfly 4s ease-in-out infinite;

  &:nth-child(2n) {
    animation-delay: -1.5s;
    width: 60px;
  }

  &:nth-child(3n) {
    animation-delay: -2.2s;
    width: 70px;
  }

  &:nth-child(4n) {
    animation-delay: -3s;
    width: 65px;
  }

  &:nth-child(5n) {
    animation-delay: -2.7s;
    width: 75px;
  }

  @keyframes floatDragonfly {
    0%, 100% {
      transform: translateY(0) rotate(3deg);
    }
    50% {
      transform: translateY(-15px) rotate(-3deg);
    }
  }
`;

const SwapCardContainer = styled.div`
  position: relative;
`;

const AnimalImage = styled(motion.img)`
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  pointer-events: none;
  z-index: -2;
`;

const SwapCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 20px;
  width: 400px;
  margin: 50px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const TokenInfoCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  gap: 20px;
`;

const StreamSection = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
`;

const ChatSection = styled.div`
  flex: 1;
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(4px);

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #6e8efb;
  }

  .info {
    h3 {
      margin: 0;
      font-size: 16px;
    }
    p {
      margin: 4px 0 0;
      font-size: 14px;
      color: #666;
    }
  }
`;

const ChatBox = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;

  margin-top: 50px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const Tab = styled(motion.button)<{ active?: boolean }>`
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: ${props => props.active ? '#FFE897' : 'white'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 10px;
`;

const SocialButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  margin: 0 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  text-decoration: none;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
`;

const StatTitle = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const SwapInput = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
`;

const SwapButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background: #45a049;
  }
`;

const RecentTradesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: #4CAF50;
  color: white;
  cursor: pointer;
`;

const ChartContainer = styled.div`
  position: relative;
  height: 400px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: white;
`;

const PriceChange = styled(motion.div)<{ isPositive: boolean }>`
  color: ${props => props.isPositive ? '#4CAF50' : '#f44336'};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0;
`;

const KawaiiIndicator = styled(motion.div)`
  position: absolute;
  top: -40px;
  right: -40px;
  font-size: 24px;
  transform-origin: center;
`;

const SparkleEffect = styled(motion.div)`
  position: absolute;
  pointer-events: none;
  font-size: 20px;
`;

interface Props {
  tokenId: string;
  onBack: () => void;
}

export const TokenView: React.FC<Props> = ({ tokenId, onBack }) => {
  const [activeTab, setActiveTab] = useState('CHART');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [priceChangePercent, setPriceChangePercent] = useState(2.5);
  const [showKawaiiEffect, setShowKawaiiEffect] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#666',
      },
      grid: {
        vertLines: { color: '#f5f5f5' },
        horzLines: { color: '#f5f5f5' },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const lineSeries = chart.addBaselineSeries({
      baseValue: { type: 'price', price: 20000 },
      topLineColor: '#4CAF50',
      topFillColor1: 'rgba(76, 175, 80, 0.28)',
      topFillColor2: 'rgba(76, 175, 80, 0.05)',
      bottomLineColor: '#FF5252',
      bottomFillColor1: 'rgba(255, 82, 82, 0.28)',
      bottomFillColor2: 'rgba(255, 82, 82, 0.05)',
    });

    const data = [
      { time: '2024-01-01', value: 21000 },
      { time: '2024-01-15', value: 21000 },
      { time: '2024-02-01', value: 22000 },
      { time: '2024-02-15', value: 22500 },
      { time: '2024-03-01', value: 23000 },
      { time: '2024-03-15', value: 23000 },
      { time: '2024-04-01', value: 23500 },
      { time: '2024-04-15', value: 24000 },
      { time: '2024-05-01', value: 24500 },
      { time: '2024-05-15', value: 25000 },
    ];

    lineSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const mockStats = {
    marketCap: '134.4M',
    holders: '134.4M',
    volume24h: '134.4M',
    recentTrades: [
      { date: 'Feb 1 - 17:25:30', type: 'BUY', amountETH: '30.325', amountMEME: '20,000,000' },
      { date: 'Feb 1 - 17:25:30', type: 'BUY', amountETH: '30.325', amountMEME: '20,000,000' },
      { date: 'Feb 1 - 17:25:30', type: 'BUY', amountETH: '30.325', amountMEME: '20,000,000' },
    ],
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'CHART':
        return (
          <>
            <ChartContainer ref={chartContainerRef} />
            
            <StatsContainer>
              <StatCard>
                <StatTitle>Marketcap</StatTitle>
                <StatValue>{mockStats.marketCap}</StatValue>
              </StatCard>
              <StatCard>
                <StatTitle>Holders</StatTitle>
                <StatValue>{mockStats.holders}</StatValue>
              </StatCard>
              <StatCard>
                <StatTitle>24H Vol</StatTitle>
                <StatValue>{mockStats.volume24h}</StatValue>
              </StatCard>
            </StatsContainer>

            <div style={{ marginTop: '20px' }}>
              <h3>Recent Trades</h3>
              <RecentTradesTable>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount ETH</th>
                    <th>Amount MEME</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStats.recentTrades.map((trade, index) => (
                    <tr key={index}>
                      <td>{trade.date} <span style={{ color: '#4CAF50' }}>{trade.type}</span></td>
                      <td>{trade.amountETH}</td>
                      <td>{trade.amountMEME}</td>
                    </tr>
                  ))}
                </tbody>
              </RecentTradesTable>
            </div>
          </>
        );
      case 'INFO':
        return (
          <InfoContainer>
            <StreamSection>
              <Video
                autoPlay={isPlaying}
                playsInline
                muted
                loop
                poster="/creator-stream-placeholder.jpg"
              />
            </StreamSection>
            
            <CreatorInfo>
              <img src="/creator-avatar.jpg" alt="Creator" />
              <div className="info">
                <h3>Token Creator</h3>
                <p>Live streaming now</p>
              </div>
            </CreatorInfo>

            <ChatSection>
              <ChatBox isOpen={true} onClose={() => {}} />
            </ChatSection>
          </InfoContainer>
        );
      default:
        return null;
    }
  };

  const handleSwapHover = () => {
    setShowKawaiiEffect(true);
    toast('✨ Kawaii mode activated!', {
      icon: '🌸',
      style: {
        borderRadius: '10px',
        background: '#fff',
        color: '#333',
      },
    });
  };

  const handleSwapLeave = () => {
    setShowKawaiiEffect(false);
  };

  const addSparkle = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newSparkle = {
      id: Date.now(),
      x,
      y
    };
    
    setSparkles(prev => [...prev, newSparkle]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
    }, 1000);
  };

  const handleSocialClick = (platform: string) => {
    toast(`Connecting to ${platform}... ✨`, {
      icon: '🌐',
      style: {
        borderRadius: '10px',
        background: '#fff',
        color: '#333',
      },
    });
  };

  return (
    <Container>
      <BackButton onClick={onBack}>← Back</BackButton>
      
      <CardContainer>
        <SwapCardContainer>
          <AnimalImage 
            src={treecharacter} 
            alt="Cute Animal"
          />
          <SwapCard>
            <h2>Swap Responsibly</h2>
            <SwapInput>
              <input type="number" defaultValue="7.23" style={{ width: '100%', border: 'none', background: 'transparent' }} />
              <select style={{ width: '100px', marginTop: '10px' }}>
                <option>ETH</option>
              </select>
            </SwapInput>
            
            <SwapInput>
              <input type="number" defaultValue="100420.690" style={{ width: '100%', border: 'none', background: 'transparent' }} />
              <select style={{ width: '100px', marginTop: '10px' }}>
                <option>MEME</option>
              </select>
            </SwapInput>
            
            <div style={{ fontSize: '12px', color: '#666', margin: '10px 0' }}>
              1 MEME = 0.00000154 ETH ($0.001)
            </div>
            
            <SwapButton>Review Swap</SwapButton>
          </SwapCard>
        </SwapCardContainer>

        <TokenInfoCard>
          <TabContainer>
            <Tab active={activeTab === 'CHART'} onClick={() => setActiveTab('CHART')}>
              CHART
            </Tab>
            <Tab active={activeTab === 'INFO'} onClick={() => setActiveTab('INFO')}>
              INFO
            </Tab>
          </TabContainer>

          <SocialLinks>
            <SocialButton href="#" target="_blank">🌐 Website</SocialButton>
            <SocialButton href="#" target="_blank">𝕏 Twitter</SocialButton>
            <SocialButton href="#" target="_blank">✈️ Telegram</SocialButton>
          </SocialLinks>

          {renderContent()}
        </TokenInfoCard>
      </CardContainer>

      <DragonfliesContainer>
        <Dragonfly src={dragonfly} alt="Dragonfly" />
        <Dragonfly src={dragonfly} alt="Dragonfly" />
        <Dragonfly src={dragonfly} alt="Dragonfly" />
        <Dragonfly src={dragonfly} alt="Dragonfly" />
        <Dragonfly src={dragonfly} alt="Dragonfly" />
      </DragonfliesContainer>
    </Container>
  );
};
