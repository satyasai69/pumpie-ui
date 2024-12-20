import axios from 'axios';
import { TonClient } from '@ton/ton';

interface AIAgentConfig {
  telegramBotToken?: string;
  twitterConfig?: {
    apiKey: string;
    apiKeySecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
  projectDescription: string;
  tokenName: string;
  tokenSymbol: string;
  aiConfig: {
    handleAnnouncements: boolean;
    handleUserQueries: boolean;
    customInstructions: string;
  };
  platformType: 'telegram' | 'twitter' | 'both';
}

interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  owner: string;
}

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// Store active agents in memory
const activeAgents: Map<string, AIAgent> = new Map();

class AIAgent {
  private tokenId: string;
  private tokenInfo: TokenInfo | null = null;
  private client: TonClient;
  private context: string[] = [];

  constructor(tokenId: string) {
    this.tokenId = tokenId;
    this.client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    });
  }

  async initialize() {
    try {
      // Fetch token information
      const tokenData = await this.fetchTokenInfo();
      this.tokenInfo = tokenData;

      // Initialize context with token information
      this.context = [
        `I am an AI agent specialized in the ${tokenData.name} (${tokenData.symbol}) token.`,
        `Token Details:`,
        `- Total Supply: ${this.formatSupply(tokenData.totalSupply, tokenData.decimals)}`,
        `- Owner: ${tokenData.owner}`,
        `I can help with:`,
        `1. Token analysis and statistics`,
        `2. Price trends and market data`,
        `3. Technical questions about the token`,
        `4. Transaction history and holder information`,
      ];
    } catch (error) {
      console.error('Error initializing AI agent:', error);
      throw new Error('Failed to initialize AI agent');
    }
  }

  private formatSupply(supply: string, decimals: number): string {
    const value = BigInt(supply);
    return (Number(value) / Math.pow(10, decimals)).toLocaleString();
  }

  private async fetchTokenInfo(): Promise<TokenInfo> {
    // Implement token info fetching using TON SDK
    // This is a placeholder implementation
    return {
      name: "Sample Token",
      symbol: "SMPL",
      totalSupply: "1000000000000000000",
      decimals: 9,
      owner: "EQA..."
    };
  }

  async processMessage(message: string): Promise<string> {
    try {
      // Add user message to context
      this.context.push(`User: ${message}`);

      // Generate response based on context and token information
      const response = await this.generateResponse(message);

      // Add response to context
      this.context.push(`Agent: ${response}`);

      // Keep only last 10 messages in context
      if (this.context.length > 10) {
        this.context = this.context.slice(-10);
      }

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  private async generateResponse(message: string): Promise<string> {
    // Implement your response generation logic here
    // You can use the context and token information to generate relevant responses
    
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('price')) {
      return `The current market data for ${this.tokenInfo?.symbol} shows...`;
    }
    
    if (lowercaseMessage.includes('supply')) {
      return `The total supply of ${this.tokenInfo?.symbol} is ${this.formatSupply(this.tokenInfo?.totalSupply || "0", this.tokenInfo?.decimals || 9)}`;
    }
    
    if (lowercaseMessage.includes('owner')) {
      return `The token owner address is ${this.tokenInfo?.owner}`;
    }
    
    if (lowercaseMessage.includes('how') || lowercaseMessage.includes('what')) {
      return `I'd be happy to help you understand more about ${this.tokenInfo?.name}. Could you please be more specific about what you'd like to know?`;
    }
    
    return `I understand you're asking about ${this.tokenInfo?.symbol}. How can I assist you with your query?`;
  }
}

export const createAIAgent = async (agentConfig: AIAgentConfig) => {
  try {
    // Create agent instance
    const tokenInfo = {
      tokenName: agentConfig.tokenName,
      tokenSymbol: agentConfig.tokenSymbol,
      description: agentConfig.projectDescription,
      agentType: agentConfig.platformType === 'twitter' ? 'entertainment' : 'onchain'
    };

    const agent = new AIAgent(tokenInfo.tokenSymbol);
    await agent.initialize();
    activeAgents.set(tokenInfo.tokenSymbol, agent);

    // Still make the API call to handle platform-specific setup
    const response = await axios.post(`${BASE_URL}/api/create-agent`, agentConfig);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to create AI agent');
    }
    throw new Error('Network error occurred');
  }
};

export const chatWithAgent = async (tokenSymbol: string, message: string): Promise<string> => {
  const agent = activeAgents.get(tokenSymbol);
  if (!agent) {
    throw new Error('Agent not found for this token');
  }

  try {
    return await agent.processMessage(message);
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Failed to get response from agent');
  }
};
