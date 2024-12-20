import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { createChart, ColorType } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Forum } from '@/components/Forum/Forum';

export const TokenView: React.FC = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'agent', content: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'developer' | 'registry'>('summary');
  const [selectedInterval, setSelectedInterval] = useState<'5m' | '15m' | '1h' | '4h' | '1d'>('1h');
  const [fromAmount, setFromAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load token data from localStorage
    const loadToken = () => {
      try {
        const storedTokens = localStorage.getItem('tokens');
        if (storedTokens) {
          const tokens = JSON.parse(storedTokens);
          const foundToken = tokens.find((t: any) => t.id === tokenId);
          if (foundToken) {
            setToken(foundToken);
          } else {
            toast.error('Token not found');
            navigate('/tokens');
          }
        }
      } catch (error) {
        console.error('Error loading token:', error);
        toast.error('Error loading token data');
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, [tokenId, navigate]);

  // Chart setup effect
  useEffect(() => {
    if (!chartContainerRef.current || !token) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#C3BCDB44',
          width: 0.5,
          style: 1,
          visible: true,
          labelVisible: false,
        },
        horzLine: {
          color: '#C3BCDB44',
          width: 0.5,
          style: 0,
          visible: true,
          labelVisible: true,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    // Candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as an overlay
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Generate realistic data
    const generateData = () => {
      const data = [];
      const volumeData = [];
      let lastClose = token.price;
      const numberOfPoints = 100;
      
      const now = new Date();
      for (let i = numberOfPoints; i >= 0; i--) {
        const time = Math.floor(now.getTime() / 1000) - i * 3600;
        const volatility = 0.02;
        const open = lastClose * (1 + (Math.random() - 0.5) * volatility);
        const close = open * (1 + (Math.random() - 0.5) * volatility);
        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        const volume = Math.floor(Math.random() * 1000000);

        data.push({
          time,
          open,
          high,
          low,
          close,
        });

        volumeData.push({
          time,
          value: volume,
          color: close >= open ? '#26a69a77' : '#ef535077',
        });

        lastClose = close;
      }
      return { data, volumeData };
    };

    const { data, volumeData } = generateData();
    candlestickSeries.setData(data);
    volumeSeries.setData(volumeData);

    // Real-time updates
    const interval = setInterval(() => {
      const lastCandle = data[data.length - 1];
      const time = Math.floor(Date.now() / 1000);
      
      if (time - lastCandle.time >= 3600) {
        // New candle
        const newClose = lastCandle.close * (1 + (Math.random() - 0.5) * 0.005);
        const newCandle = {
          time,
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newClose),
          low: Math.min(lastCandle.close, newClose),
          close: newClose
        };
        const newVolume = {
          time,
          value: Math.floor(Math.random() * 100000),
          color: newClose >= lastCandle.close ? '#26a69a77' : '#ef535077'
        };
        
        candlestickSeries.update(newCandle);
        volumeSeries.update(newVolume);
      } else {
        // Update last candle
        const updatedClose = lastCandle.close * (1 + (Math.random() - 0.5) * 0.002);
        const updatedCandle = {
          ...lastCandle,
          high: Math.max(lastCandle.high, updatedClose),
          low: Math.min(lastCandle.low, updatedClose),
          close: updatedClose
        };
        const updatedVolume = {
          time: lastCandle.time,
          value: Math.floor(Math.random() * 100000),
          color: updatedClose >= lastCandle.open ? '#26a69a77' : '#ef535077'
        };
        
        candlestickSeries.update(updatedCandle);
        volumeSeries.update(updatedVolume);
      }
    }, 1000);

    // Add price line
    candlestickSeries.createPriceLine({
      price: token.price,
      color: '#2962FF',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Current Price',
    });

    // Handle resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [token]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    // Implement trade functionality
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: newMessage };
    setChatMessages(prev => [...prev, userMessage]);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage = {
        role: 'agent' as const,
        content: `I'm the ${token.agent.type} agent for ${token.name}. ${token.agent.description}`
      };
      setChatMessages(prev => [...prev, agentMessage]);
    }, 1000);

    setNewMessage('');
  };

  const HandleBackButton = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Button onClick={HandleBackButton} className="m-4"><ArrowLeft/>Back</Button>
      
      <div className="container mx-auto p-4">
        {/* Token Header */}
        <div className="flex items-center space-x-4 mb-6">
          <img src={token.imageUrl} alt={token.name} className="w-12 h-12 rounded-full"/>
          <div>
            <h1 className="text-2xl font-bold text-white">{token.name}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">{token.symbol}</span>
              <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">
                {token.agent.type}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Price</div>
                <div className="text-white text-lg font-semibold">${token.price.toFixed(4)}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">24h Change</div>
                <div className={`text-lg font-semibold ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Market Cap</div>
                <div className="text-white text-lg font-semibold">${token.marketCap.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Holders</div>
                <div className="text-white text-lg font-semibold">{token.holders.toLocaleString()}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-800 rounded-lg p-4">
              {/* Time Intervals */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  {['5m', '15m', '1h', '4h', '1d'].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setSelectedInterval(interval)}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedInterval === interval
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
                
                {/* Price Stats */}
                <div className="flex space-x-4 text-sm">
                  <div className="text-gray-400">24h Change: 
                    <span className={`ml-1 ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-gray-400">24h Volume: 
                    <span className="ml-1 text-white">${formatNumber(token.volume24h)}</span>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div ref={chartContainerRef} className="w-full h-[400px]" />
            </div>

            {/* Tabs */}
            <div className="bg-gray-800 rounded-lg">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setSelectedTab('summary')}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTab === 'summary'
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setSelectedTab('developer')}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTab === 'developer'
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Developer Logs
                </button>
                <button
                  onClick={() => setSelectedTab('registry')}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTab === 'registry'
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Registry
                </button>
              </div>
              <div className="p-4">
                {selectedTab === 'summary' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-medium mb-2">Description</h3>
                      <p className="text-gray-400">{token.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-white font-medium mb-2">Market Cap (FDV)</h3>
                        <p className="text-gray-400">${token.marketCap.toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-2">24h Volume</h3>
                        <p className="text-gray-400">${token.volume24h.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedTab === 'developer' && (
                  <div className="text-gray-400">
                    Developer activity and logs will be shown here
                  </div>
                )}
                {selectedTab === 'registry' && (
                  <div className="text-gray-400">
                    Token registry information will be shown here
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Buy/Sell and Chat */}
          <div className="space-y-6">
            {/* Buy/Sell Interface */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Trade</h2>
                <div className="text-sm text-gray-400">
                  Balance: 100 TON
                </div>
              </div>

              {/* Amount Input */}
              <div className="bg-gray-900 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount ({token.symbol})</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="number" 
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl text-white outline-none flex-1"
                  />
                  <div className="flex items-center space-x-2">
                    <img src={token.imageUrl} alt={token.symbol} className="w-6 h-6 rounded-full"/>
                    <span className="text-white font-medium">{token.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-900 p-4 rounded-lg space-y-2 mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Price</span>
                  <span>1 {token.symbol} = {token.price.toFixed(4)} TON</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Total</span>
                  <span>{(parseFloat(fromAmount || '0') * token.price).toFixed(4)} TON</span>
                </div>
              </div>

              {/* Buy/Sell Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleTrade('buy')}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Buy
                </button>
                <button 
                  onClick={() => handleTrade('sell')}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Forum Chat</h2>
                <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                  Live
                </span>
              </div>

              <div className="h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-gray-700 ml-8'
                          : 'bg-gray-900 mr-8'
                      }`}
                    >
                      <p className="text-gray-200">{message.content}</p>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      Start chatting with your token's AI agent!
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="mt-auto">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>


        
          </div>
        </div>
      </div>
    </div>
  );
};
