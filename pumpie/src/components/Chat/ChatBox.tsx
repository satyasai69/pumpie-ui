import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send } from 'lucide-react';
import { FaSmile, FaSadTear, FaAngry, FaMagic } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  sentiment: number;
}

interface ChatBoxProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Container = styled.div<{ isOpen?: boolean }>`
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  height: 100%;
  min-height: 480px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 15px;
  background: #4CAF50;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatArea = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div<{ sentiment: number }>`
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 80%;
  align-self: flex-start;
  background: ${props => {
    if (props.sentiment > 0.5) return '#E8F5E9';
    if (props.sentiment < -0.5) return '#FFEBEE';
    return '#F5F5F5';
  }};
  margin: ${props => props.sentiment !== 0 ? '5px 0' : '0'};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const Username = styled.span`
  font-weight: bold;
  color: #1a1a1a;
  margin-right: 8px;
`;

const Timestamp = styled.span`
  font-size: 0.8em;
  color: #666;
  margin-left: 8px;
`;

const InputArea = styled.div`
  padding: 15px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const SendButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }
`;

const EmoteButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? '#4CAF50' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#45a049' : '#f0f0f0'};
  }
`;

const ChatBox: React.FC<ChatBoxProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeEmote, setActiveEmote] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const sentiment = activeEmote === 'happy' ? 1 :
                     activeEmote === 'sad' ? -0.5 :
                     activeEmote === 'angry' ? -1 : 0;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: 'You',
      text: inputText,
      timestamp: new Date(),
      sentiment
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setActiveEmote(null);

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        user: 'Bot',
        text: 'Thanks for your message! 🎉',
        timestamp: new Date(),
        sentiment: 1
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const toggleEmote = (emote: string) => {
    setActiveEmote(prev => prev === emote ? null : emote);
    toast.success(`${emote} mode ${activeEmote === emote ? 'off' : 'on'}! 🎭`, {
      icon: getEmoteIcon(emote),
    });
  };

  const getEmoteIcon = (emote: string) => {
    switch (emote) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'magic': return '✨';
      default: return '🎭';
    }
  };

  return (
    <Container>
      <Header>
        <span>Live Chat</span>
        <span>{messages.length} messages</span>
      </Header>
      <ChatArea ref={chatAreaRef}>
        {messages.map(msg => (
          <Message key={msg.id} sentiment={msg.sentiment}>
            <Username>{msg.user}</Username>
            {msg.text}
            <Timestamp>
              {msg.timestamp.toLocaleTimeString()}
            </Timestamp>
          </Message>
        ))}
      </ChatArea>
      <InputArea>
        <div style={{ display: 'flex', gap: '5px' }}>
          <EmoteButton
            active={activeEmote === 'happy'}
            onClick={() => toggleEmote('happy')}
            title="Happy"
          >
            <FaSmile />
          </EmoteButton>
          <EmoteButton
            active={activeEmote === 'sad'}
            onClick={() => toggleEmote('sad')}
            title="Sad"
          >
            <FaSadTear />
          </EmoteButton>
          <EmoteButton
            active={activeEmote === 'angry'}
            onClick={() => toggleEmote('angry')}
            title="Angry"
          >
            <FaAngry />
          </EmoteButton>
          <EmoteButton
            active={activeEmote === 'magic'}
            onClick={() => toggleEmote('magic')}
            title="Magic"
          >
            <FaMagic />
          </EmoteButton>
        </div>
        <Input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <SendButton onClick={handleSend}>
          <Send size={20} />
        </SendButton>
      </InputArea>
    </Container>
  );
};

export default ChatBox;
