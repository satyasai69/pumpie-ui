import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { Globe, Twitter, Send, MessageCircle } from 'lucide-react';
import LiveStreamPage from '../LiveStream/LiveStreamPage';

const Container = styled.div`
  padding: 20px;
  background: #f0f9ff;
  min-height: 100vh;
  position: relative;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const SwapCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const SwapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SwapTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const SwapInput = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const InputField = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 24px;
  outline: none;
  margin-bottom: 8px;
`;

const TokenSelect = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
`;

const TokenLogo = styled.img`
  width: 24px;
  height: 24px;
`;

const SwapButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background: #059669;
  }
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 8px 24px;
  border-radius: 20px;
  border: none;
  background: ${props => props.active ? '#10b981' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#4b5563'};
  font-weight: bold;
  cursor: pointer;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const SocialLink = styled.a`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #4b5563;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #f3f4f6;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #111827;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin: 24px 0;
`;

const TokenDetail: React.FC = () => {
  const { tokenId } = useParams();
  const [activeTab, setActiveTab] = useState('chart');
  const [swapAmount, setSwapAmount] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Token Price',
        data: [1000, 2000, 1500, 3000, 2500, 4000, 3500],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: (value: any) => '$' + value + 'K',
        },
      },
    },
  };

  const handleSwap = () => {
    console.log('Swapping:', swapAmount);
    // Implement swap logic
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage('');
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <SwapCard>
          <SwapHeader>
            <SwapTitle>Swap Responsibly</SwapTitle>
          </SwapHeader>
          <SwapInput>
            <InputField
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="0.0"
            />
            <TokenSelect>
              <TokenLogo src="/assets/eth-logo.png" alt="ETH" />
              <span>ETH</span>
            </TokenSelect>
          </SwapInput>
          <SwapInput>
            <InputField type="number" placeholder="0.0" disabled />
            <TokenSelect>
              <TokenLogo src="/assets/token-logo.png" alt="Token" />
              <span>TOKEN</span>
            </TokenSelect>
          </SwapInput>
          <SwapButton onClick={handleSwap}>Review Swap</SwapButton>
        </SwapCard>

        <InfoCard>
          <TabContainer>
            <Tab active={activeTab === 'chart'} onClick={() => setActiveTab('chart')}>
              CHART
            </Tab>
            <Tab active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
              INFO
            </Tab>
          </TabContainer>

          <SocialLinks>
            <SocialLink href="#" target="_blank">
              <Globe size={18} />
              Website
            </SocialLink>
            <SocialLink href="#" target="_blank">
              <Twitter size={18} />
              Twitter
            </SocialLink>
            <SocialLink href="#" target="_blank">
              <Send size={18} />
              Telegram
            </SocialLink>
          </SocialLinks>

          {activeTab === 'chart' && (
            <>
              <ChartContainer>
                <Line data={chartData} options={chartOptions} />
              </ChartContainer>

              <StatsGrid>
                <StatCard>
                  <StatLabel>Market Cap</StatLabel>
                  <StatValue>$134.4M</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Holders</StatLabel>
                  <StatValue>134.4M</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>24H Vol</StatLabel>
                  <StatValue>134.4M</StatValue>
                </StatCard>
              </StatsGrid>
            </>
          )}
        </InfoCard>
      </ContentWrapper>

      {/* Live Stream and Chat Section */}
      <div style={{ marginTop: '24px' }}>
        <LiveStreamPage />
      </div>
    </Container>
  );
};

export default TokenDetail;
