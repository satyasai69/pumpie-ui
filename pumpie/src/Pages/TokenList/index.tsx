import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { NavBar } from '@/components/Blocks/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const TokenImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
`;

const TokenName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const TokenSymbol = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
`;

const TokenStats = styled.div`
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TokenType = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 9999px;
  color: #818cf8;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }
`;

interface Token {
  id: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  type: string;
  agent: {
    type: string;
    description: string;
  };
}

export const TokenList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    // Load tokens from localStorage
    const storedTokens = localStorage.getItem('tokens');
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
      } catch (error) {
        console.error('Error parsing tokens:', error);
        toast.error('Error loading tokens');
      }
    }
  }, []);

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTokenClick = (tokenId: string) => {
    navigate(`/token/${tokenId}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <>


     
      <Container>
      <Button onClick={() => navigate('/dashboard')} className="bg-[#00FFA3] text-black hover:bg-[#00DD8C] text-center ">
        <ArrowLeft/>  Agents
        </Button>
        <Header>
          <Title>Your Tokens</Title>
          <Subtitle>View and manage your launched tokens</Subtitle>
        </Header>

        <SearchInput
          type="text"
          placeholder="Search tokens by name, symbol, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

<Button onClick={() => navigate('/launch')} className="bg-[#00FFA3] text-black hover:bg-[#00DD8C] text-center ">
          Create New AI Agent
        </Button>
        

        <Grid>
          {filteredTokens.map(token => (
            <Card key={token.id} onClick={() => handleTokenClick(token.id)}>
              <TokenImage src={token.imageUrl} alt={token.name} />
              <TokenType>{token.type}</TokenType>
              <TokenName>{token.name}</TokenName>
              <TokenSymbol>{token.symbol}</TokenSymbol>
              
              <TokenStats>
                <StatItem>
                  <span>Price</span>
                  <span>${token.price.toFixed(2)}</span>
                </StatItem>
                <StatItem>
                  <span>24h Change</span>
                  <span style={{ color: token.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}>
                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </span>
                </StatItem>
                <StatItem>
                  <span>Market Cap</span>
                  <span>${formatNumber(token.marketCap)}</span>
                </StatItem>
                <StatItem>
                  <span>Holders</span>
                  <span>{formatNumber(token.holders)}</span>
                </StatItem>
              </TokenStats>
            </Card>
          ))}

          {filteredTokens.length === 0 && (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '2rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              {searchTerm ? 'No tokens found matching your search' : 'No tokens launched yet'}
            </div>
          )}
        </Grid>
      </Container>
    </>
  );
};
