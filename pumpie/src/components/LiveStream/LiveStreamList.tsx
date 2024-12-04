import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Play, Users } from 'lucide-react';
import toast from 'react-hot-toast';

type AnimeEffect = 'rainbow' | 'ninja' | 'neko' | 'kawaii' | 'none';

interface Stream {
  id: string;
  title: string;
  streamer: string;
  thumbnail: string;
  viewers: number;
}

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a1a1a;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const StreamCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
`;

const VideoContainer = styled.div<{ effectType: AnimeEffect }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #000;

  ${props => props.effectType === 'rainbow' && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(255, 182, 193, 0.3),
        rgba(255, 218, 185, 0.3),
        rgba(255, 192, 203, 0.3)
      );
      mix-blend-mode: screen;
      animation: rainbowAnime 3s linear infinite;
      pointer-events: none;
    }

    @keyframes rainbowAnime {
      0% { opacity: 0.5; }
      50% { opacity: 0.8; }
      100% { opacity: 0.5; }
    }
  `}

  ${props => props.effectType === 'ninja' && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.4) 0%,
        transparent 40%,
        transparent 60%,
        rgba(0, 0, 0, 0.4) 100%
      );
      mix-blend-mode: multiply;
      animation: ninjaSlice 2s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes ninjaSlice {
      0% { transform: translateX(-100%) rotate(-45deg); }
      50% { transform: translateX(0%) rotate(-45deg); }
      100% { transform: translateX(100%) rotate(-45deg); }
    }
  `}

  ${props => props.effectType === 'neko' && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
        rgba(255, 182, 193, 0.3) 0%, 
        transparent 50%);
      mix-blend-mode: screen;
      pointer-events: none;
      animation: nekoGlow 2s ease-in-out infinite;
    }

    @keyframes nekoGlow {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(30deg); }
      100% { filter: hue-rotate(0deg); }
    }
  `}

  ${props => props.effectType === 'kawaii' && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(
          45deg,
          rgba(255, 182, 193, 0.3) 0%,
          rgba(255, 218, 185, 0.3) 50%,
          rgba(255, 192, 203, 0.3) 100%
        );
      mix-blend-mode: screen;
      animation: kawaiiSparkle 3s ease infinite;
      pointer-events: none;
    }

    @keyframes kawaiiSparkle {
      0% { 
        opacity: 0.5;
        filter: hue-rotate(0deg) brightness(1);
      }
      50% { 
        opacity: 0.8;
        filter: hue-rotate(15deg) brightness(1.2);
      }
      100% { 
        opacity: 0.5;
        filter: hue-rotate(0deg) brightness(1);
      }
    }
  `}
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const EffectControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 2;
`;

const EffectButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'};
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background: rgba(255,255,255,0.9);
  }
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ViewerCount = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StreamInfo = styled.div`
  padding: 12px;
`;

const StreamTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #1a1a1a;
`;

const StreamerName = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
`;

// Mock data for demonstration
const mockStreams: Stream[] = [
  {
    id: '1',
    title: 'Building DeFi Applications',
    streamer: 'CryptoMaster',
    thumbnail: 'https://picsum.photos/400/225',
    viewers: 156
  },
  {
    id: '2',
    title: 'TON Network Development',
    streamer: 'BlockchainDev',
    thumbnail: 'https://picsum.photos/401/225',
    viewers: 89
  },
  {
    id: '3',
    title: 'Smart Contract Security',
    streamer: 'SecurityExpert',
    thumbnail: 'https://picsum.photos/402/225',
    viewers: 234
  }
];

const LiveStreamList: React.FC = () => {
  const navigate = useNavigate();
  const [effectType, setEffectType] = useState<AnimeEffect>('kawaii');
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupVideo = async () => {
      if (videoRef.current && window.savedStream) {
        videoRef.current.srcObject = window.savedStream;
        try {
          await videoRef.current.play();
          setIsStreaming(true);
        } catch (error) {
          console.error('Error playing video:', error);
          setIsStreaming(false);
        }
      }
    };

    setupVideo();

    // Check stream status periodically
    const streamCheck = setInterval(() => {
      if (window.savedStream) {
        const tracks = window.savedStream.getTracks();
        const isActive = tracks.some(track => track.enabled && track.readyState === 'live');
        setIsStreaming(isActive);
      } else {
        setIsStreaming(false);
      }
    }, 1000);

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        containerRef.current.style.setProperty('--mouse-x', `${x}%`);
        containerRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(streamCheck);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const toggleEffect = (newEffect: AnimeEffect) => {
    setEffectType(prev => prev === newEffect ? 'none' : newEffect);
    toast.success(`${newEffect} mode ${effectType === newEffect ? 'off' : 'on'}! ✨`, {
      icon: getEffectIcon(newEffect),
      style: {
        borderRadius: '10px',
        background: '#fff',
        color: '#333',
      },
    });
  };

  const getEffectIcon = (effect: AnimeEffect) => {
    switch (effect) {
      case 'rainbow': return '🌈';
      case 'ninja': return '🥷';
      case 'neko': return '😺';
      case 'kawaii': return '🌸';
      default: return '✨';
    }
  };

  const handleStreamClick = (streamId: string) => {
    if (!isStreaming) {
      toast.error('Stream is not available');
      return;
    }
    navigate(`/live/${streamId}`);
  };

  return (
    <Container>
      <Title>Live Streams</Title>
      <Grid>
        {mockStreams.map(stream => (
          <StreamCard key={stream.id} onClick={() => handleStreamClick(stream.id)}>
            <ThumbnailContainer ref={containerRef}>
              <VideoContainer effectType={effectType}>
                <Video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                />
                {isStreaming && (
                  <EffectControls>
                    <EffectButton 
                      active={effectType === 'rainbow'} 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEffect('rainbow');
                      }}
                      title="Rainbow Mode"
                    >
                      🌈
                    </EffectButton>
                    <EffectButton 
                      active={effectType === 'ninja'} 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEffect('ninja');
                      }}
                      title="Ninja Mode"
                    >
                      🥷
                    </EffectButton>
                    <EffectButton 
                      active={effectType === 'neko'} 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEffect('neko');
                      }}
                      title="Neko Mode"
                    >
                      😺
                    </EffectButton>
                    <EffectButton 
                      active={effectType === 'kawaii'} 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEffect('kawaii');
                      }}
                      title="Kawaii Mode"
                    >
                      🌸
                    </EffectButton>
                  </EffectControls>
                )}
              </VideoContainer>
              {isStreaming ? (
                <LiveBadge>
                  <Play size={12} />
                  LIVE
                </LiveBadge>
              ) : (
                <LiveBadge style={{ background: '#6c757d' }}>
                  OFFLINE
                </LiveBadge>
              )}
              <ViewerCount>
                <Users size={12} />
                {stream.viewers}
              </ViewerCount>
            </ThumbnailContainer>
            <StreamInfo>
              <StreamTitle>{stream.title}</StreamTitle>
              <StreamerName>{stream.streamer}</StreamerName>
            </StreamInfo>
          </StreamCard>
        ))}
      </Grid>
    </Container>
  );
};

export default LiveStreamList;
