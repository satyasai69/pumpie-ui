import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<any[]>([]);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    const loadTokens = () => {
      const storedTokens = localStorage.getItem('tokens');
      if (storedTokens) {
        setTokens(JSON.parse(storedTokens));
      }
    };
    loadTokens();
  }, []);

  const handleTokenClick = (tokenId: string) => {
    navigate(`/token/${tokenId}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}m`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}k`;
    }
    return `$${num.toFixed(1)}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex  items-center p-5 mb-6">
        <h1 className="text-2xl font-bold text-white">All Sentient AI Agents</h1>
      
      </div>
      <div className="flex justify-end items-center p-5 ml-4 mb-6">
        <Button onClick={() => navigate('/launch')} className="bg-[#00FFA3] text-black hover:bg-[#00DD8C]">
          Create New AI Agent
        </Button>
        <Button onClick={() => navigate('/tokens')} className="bg-[#00FFA3] text-black hover:bg-[#00DD8C]">
       <ArrowRight/>   Tokens
        </Button>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="p-4">AI Agents</th>
              <th className="p-4">Market Cap</th>
              <th className="p-4">24h</th>
              <th className="p-4">Total Value Locked</th>
              <th className="p-4">Holders Count</th>
              <th className="p-4">24h Vol</th>
              <th className="p-4">Inferences</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr 
                key={token.id}
                onClick={() => handleTokenClick(token.id)}
                className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={token.imageUrl} 
                      alt={token.name} 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-white">{token.name}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">${token.symbol}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          token.agent.type === 'Productivity' ? 'bg-orange-500/20 text-orange-300' :
                          token.agent.type === 'Entertainment' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {token.agent.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-white">{formatNumber(token.marketCap)}</td>
                <td className="p-4">
                  <span className={`${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </span>
                </td>
                <td className="p-4 text-white">{formatNumber(token.totalValueLocked || 0)}</td>
                <td className="p-4 text-white">{token.holders.toLocaleString()}</td>
                <td className="p-4 text-white">{formatNumber(token.volume24h || 0)}</td>
                <td className="p-4 text-white">{token.inferences?.toLocaleString() || '0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
