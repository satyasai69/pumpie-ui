import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import ChatBox from '../../components/Chat/ChatBox';

interface Props {
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
}

const LiveStreamContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  height: calc(100vh - 100px);
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
`;

const StreamControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
`;

const Button = styled.button<{ variant?: 'danger' }>`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: ${props => props.variant === 'danger' ? '#ff4444' : '#4CAF50'};
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChatContainer = styled.div`
  height: 100%;
  min-height: 480px;
`;

const LiveStreamPage: React.FC<Props> = ({ onStreamStart, onStreamEnd }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banEndTime, setBanEndTime] = useState<Date | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const moderationInterval = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        modelRef.current = await tf.loadGraphModel(
          'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1',
          { fromTFHub: true }
        );
        toast.success('Content moderation model loaded successfully');
      } catch (error) {
        console.error('Error loading model:', error);
        toast.error('Failed to load content moderation model');
      }
    };
    loadModel();

    if (window.savedStream && videoRef.current) {
      const tracks = window.savedStream.getTracks();
      const isActive = tracks.some(track => track.enabled && track.readyState === 'live');
      if (isActive) {
        videoRef.current.srcObject = window.savedStream;
        videoRef.current.play().catch(console.error);
        setIsStreaming(true);
        onStreamStart?.();
        startContentModeration(window.savedStream);
      } else {
        window.savedStream = null;
      }
    }

    return () => {
      if (moderationInterval.current) {
        clearInterval(moderationInterval.current);
      }
    };
  }, []);

  const startStream = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Save stream globally for persistence
      window.savedStream = stream;
      
      // Set up video display
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsStreaming(true);
      onStreamStart?.();

      // Start content moderation
      if (stream) {
        startContentModeration(stream);
      }

      toast.success('Stream started successfully!');
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start stream. Please check camera permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = () => {
    try {
      if (window.savedStream) {
        window.savedStream.getTracks().forEach(track => track.stop());
        window.savedStream = null;
      }
      setIsStreaming(false);
      onStreamEnd?.();
      toast.success('Stream ended successfully!');
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Failed to stop stream.');
    }
  };

  const processFrame = async () => {
    if (!videoRef.current || !modelRef.current || !canvasRef.current) return;

    try {
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);

      const tensor = tf.browser.fromPixels(imageData)
        .expandDims(0)
        .toFloat()
        .div(255);

      const predictions = await modelRef.current.predict(tensor) as any;
      
      // Get detection boxes and scores
      const boxes = await predictions[1].array();
      const scores = await predictions[2].array();
      const classes = await predictions[3].array();
      
      tensor.dispose();
      predictions[0].dispose();
      predictions[1].dispose();
      predictions[2].dispose();
      predictions[3].dispose();

      // COCO dataset class indices for sensitive content
      const sensitiveClasses = [1, 2, 3, 4]; // person, bicycle, car, motorcycle (example)
      
      // Check if any sensitive objects are detected with high confidence
      const hasSensitiveContent = scores[0].some((score: number, i: number) => 
        score > 0.5 && sensitiveClasses.includes(classes[0][i])
      );

      if (hasSensitiveContent) {
        stopStream();
        setIsBanned(true);
        const banEndDate = new Date();
        banEndDate.setDate(banEndDate.getDate() + 7);
        setBanEndTime(banEndDate);
        toast.error('Stream ended due to potentially inappropriate content. You are banned for 7 days.');
      }
    } catch (error) {
      console.error('Error in content moderation:', error);
    }
  };

  const startContentModeration = (stream: MediaStream) => {
    if (moderationInterval.current) {
      clearInterval(moderationInterval.current);
    }

    moderationInterval.current = setInterval(() => {
      processFrame().catch(console.error);
    }, 1000);
  };

  return (
    <LiveStreamContainer>
      <VideoContainer>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        <StreamControls>
          {!isStreaming ? (
            <Button 
              onClick={startStream} 
              disabled={isLoading || (isBanned && banEndTime && new Date() < banEndTime)}
            >
              {isLoading ? 'Starting...' : 'Start Stream'}
            </Button>
          ) : (
            <Button 
              variant="danger"
              onClick={stopStream}
            >
              Stop Stream
            </Button>
          )}
        </StreamControls>
      </VideoContainer>
      <ChatContainer>
        <ChatBox />
      </ChatContainer>
    </LiveStreamContainer>
  );
};

export default LiveStreamPage;
