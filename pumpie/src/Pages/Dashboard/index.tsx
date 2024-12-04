import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Overview } from './Overview';
import { Transactions } from './Transactions';
import { Settings } from './Settings';
import { LaunchToken } from './LaunchToken';
import { TokenList } from './TokenList';
import { TokenView } from '../TokenView/TokenView';
import './Dashboard.css';
import LiveStreamPage from '../LiveStream/LiveStreamPage';
import { Toaster } from 'react-hot-toast';
import { NavBar } from '../../components/Blocks/Navbar';
import grassImage from '../../assets/grass1.png';
import styled from 'styled-components';
import {MiniPlayer }  from '../../components/MiniPlayer/MiniPlayer';

const BackgroundImage = styled.img`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  object-fit: cover;
  object-position: bottom;
  pointer-events: none;
  z-index: 0;
`;

const DashboardContent = styled.div`
  position: relative;
  z-index: 1;
  padding-bottom: 200px;
`;

const ContentArea = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  min-height: calc(100vh - 12rem);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 1;
  margin-top: 2rem;
`;

const MiniPlayerContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
  transform: translateY(${props => props.isVisible ? '0' : '200%'});
  opacity: ${props => props.isVisible ? '1' : '0'};
`;

type TabType = 'overview' | 'transactions' | 'settings' | 'launch' | 'tokens' | 'live';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  useEffect(() => {
    if (!tonConnectUI.connected) {
      navigate('/');
    }
  }, [tonConnectUI.connected, navigate]);

  useEffect(() => {
    // Check if there's an existing stream
    if (window.savedStream) {
      const tracks = window.savedStream.getTracks();
      const isActive = tracks.some(track => track.enabled && track.readyState === 'live');
      if (isActive) {
        setIsLiveStreamActive(true);
        setShowMiniPlayer(activeTab !== 'live');
      } else {
        window.savedStream = null;
        setIsLiveStreamActive(false);
        setShowMiniPlayer(false);
      }
    }

    // Periodic check for stream health
    const streamCheck = setInterval(() => {
      if (window.savedStream) {
        const tracks = window.savedStream.getTracks();
        const isActive = tracks.some(track => track.enabled && track.readyState === 'live');
        setIsLiveStreamActive(isActive);
        if (!isActive) {
          window.savedStream = null;
          setShowMiniPlayer(false);
        } else {
          setShowMiniPlayer(activeTab !== 'live');
        }
      } else {
        setIsLiveStreamActive(false);
        setShowMiniPlayer(false);
      }
    }, 1000);

    return () => clearInterval(streamCheck);
  }, [activeTab]);

  const handleStreamStart = () => {
    setIsLiveStreamActive(true);
    setShowMiniPlayer(activeTab !== 'live');
  };

  const handleStreamEnd = () => {
    setIsLiveStreamActive(false);
    setShowMiniPlayer(false);
    if (window.savedStream) {
      window.savedStream.getTracks().forEach(track => track.stop());
      window.savedStream = null;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (isLiveStreamActive) {
      setShowMiniPlayer(tab !== 'live');
    }
  };

  const handleCloseMiniPlayer = () => {
    handleStreamEnd();
  };

  const handleMiniPlayerClick = () => {
    handleTabChange('live');
  };

  const renderTabContent = () => {
    if (activeTab === 'tokens' && selectedTokenId) {
      return <TokenView tokenId={selectedTokenId} onBack={() => setSelectedTokenId(null)} />;
    }

    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'transactions':
        return <Transactions />;
      case 'settings':
        return <Settings />;
      case 'launch':
        return <LaunchToken />;
      case 'tokens':
        return <TokenList onTokenSelect={setSelectedTokenId} />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="dashboard-container">
      <BackgroundImage src={grassImage} alt="Grass" />
      <NavBar />
      <DashboardContent>
        <div className="dashboard-content">
          <div className="tab-container">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => handleTabChange('transactions')}
            >
              Transactions
            </button>
            <button
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              Settings
            </button>
            <button
              className={`tab-button ${activeTab === 'launch' ? 'active' : ''}`}
              onClick={() => handleTabChange('launch')}
            >
              Launch Token
            </button>
            <button
              className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
              onClick={() => handleTabChange('tokens')}
            >
              Tokens
            </button>
            <button
              className={`tab-button ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => handleTabChange('live')}
            >
              Live Stream {isLiveStreamActive && '🔴'}
            </button>
          </div>
          <ContentArea>
            {activeTab === 'live' ? (
              <LiveStreamPage
                onStreamStart={handleStreamStart}
                onStreamEnd={handleStreamEnd}
              />
            ) : renderTabContent()}
          </ContentArea>
        </div>
      </DashboardContent>

      {showMiniPlayer && (
        <MiniPlayer
          onClose={handleCloseMiniPlayer}
          onClick={handleMiniPlayerClick}
        />
      )}
      <Toaster position="bottom-right" />
    </div>
  );
};
