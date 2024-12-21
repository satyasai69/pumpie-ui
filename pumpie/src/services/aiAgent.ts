import axios from 'axios';
import { TonClient } from '@ton/ton';
import { agentTemplates } from '../config/agentTemplates';

export interface AIAgentConfig {
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

export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  owner: string;
  description?: string;
  projectDescription?: string;
  agentType: 'entertainment' | 'utility' | 'social' | 'defi';
}

interface AgentData {
  tokenId: string;
  agentType: 'entertainment' | 'utility' | 'social' | 'defi';
  personality: any;
  context: string[];
  lastActive: Date;
}

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.3-70B-Instruct/v1/chat/completions';
const HUGGING_FACE_API_KEY = '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'; // Free API key for testing

// Store active agents in memory
const activeAgents: Map<string, AIAgent> = new Map();

export class AIAgent {
  private tokenId: string;
  private tokenInfo: TokenInfo | null = null;
  private client: TonClient;
  private context: string[] = [];
  private personality: any;

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
      this.personality = agentTemplates[tokenData.agentType];
      this.initializeContext();
    } catch (error) {
      console.error('Error initializing AI agent:', error);
      throw new Error('Failed to initialize AI agent');
    }
  }

  private initializeContext() {
    const { personality } = this.personality;
    this.context = [
      `I am an AI agent for ${this.tokenInfo?.name}, a ${this.tokenInfo?.agentType} token.`,
      `My personality traits: ${personality.traits.join(', ')}`,
      `I communicate in a ${personality.communication_style} manner`,
      `My interests include: ${personality.interests.join(', ')}`,
      `Token Description: ${this.tokenInfo?.description}`
    ];
  }

  private formatSupply(supply: string, decimals: number): string {
    const value = BigInt(supply);
    return (Number(value) / Math.pow(10, decimals)).toLocaleString();
  }

  private async fetchTokenInfo(): Promise<TokenInfo> {
    try {
      // Fetch token info from your API
      const response = await axios.get(`${BASE_URL}/api/tokens/${this.tokenId}`);
      if (response.data && response.data.success) {
        return {
          name: response.data.token.name,
          symbol: response.data.token.symbol,
          totalSupply: response.data.token.totalSupply || "0",
          decimals: response.data.token.decimals || 9,
          owner: response.data.token.creatorAddress,
          description: response.data.token.description,
          projectDescription: response.data.token.projectDescription,
          agentType: response.data.token.agentType
        };
      }
      throw new Error('Failed to fetch token info');
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  async saveToDatabase() {
    try {
      const agentData: AgentData = {
        tokenId: this.tokenId,
        agentType: this.tokenInfo?.agentType || 'utility',
        personality: this.personality,
        context: this.context,
        lastActive: new Date()
      };

      await axios.post(`${BASE_URL}/api/agents`, agentData);
    } catch (error) {
      console.error('Error saving agent to database:', error);
    }
  }

  static async loadFromDatabase(tokenId: string): Promise<AIAgent | null> {
    try {
      const response = await axios.get(`${BASE_URL}/api/agents/${tokenId}`);
      if (response.data) {
        const agent = new AIAgent(tokenId);
        await agent.initialize();
        agent.context = response.data.context;
        agent.personality = response.data.personality;
        return agent;
      }
      return null;
    } catch (error) {
      console.error('Error loading agent from database:', error);
      return null;
    }
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await this.generateResponse(message);
      this.context.push(`User: ${message}`);
      this.context.push(`Assistant: ${response}`);
      
      if (this.context.length > 10) {
        this.context = this.context.slice(-10);
      }
      
      // Save updated context to database
      await this.saveToDatabase();
      
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      return this.personality.default_responses.error;
    }
  }

  async processMessage(message: string): Promise<string> {
    try {
      // Add user message to context
      this.context.push(`User: ${message}`);

      // Generate response based on context and token information
      const response = await this.generateResponse(message);

      // Add response to context
      this.context.push(`Assistant: ${response}`);

      // Keep only last 10 messages in context to avoid token limit
      if (this.context.length > 13) { // 3 system messages + 10 conversation messages
        this.context = [
          ...this.context.slice(0, 3), // Keep system messages
          ...this.context.slice(-10) // Keep last 10 conversation messages
        ];
      }

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I apologize, but I'm having trouble processing your message right now. Please try again later.";
    }
  }

  private async generateResponse(message: string): Promise<string> {
    try {
      const prompt = `
        Context:
        ${this.context.join('\n')}
        
        Personality:
        - Type: ${this.tokenInfo?.agentType} agent
        - Traits: ${this.personality.personality.traits.join(', ')}
        - Tone: ${this.personality.personality.tone}
        - Style: ${this.personality.personality.communication_style}
        
        Functions I can perform:
        ${this.personality.functions.join('\n')}
        
        User: ${message}
        Assistant (respond in the defined personality style):`;

      const response = await axios.post(
        HUGGING_FACE_API_URL,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data[0]?.generated_text || '';
      const assistantResponse = generatedText.split('Assistant:').pop()?.trim() || '';
      
      return assistantResponse || this.personality.default_responses.error;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.personality.default_responses.error;
    }
  }
}

export async function createAIAgent(agentConfig: AIAgentConfig) {
  try {
    const response = await axios.post(`${BASE_URL}/api/agents`, agentConfig);
    
    if (response.data && response.data.success) {
      const agent = new AIAgent(response.data.agent.id);
      await agent.initialize();
      activeAgents.set(response.data.agent.id, agent);
      return response.data.agent;
    }
    
    throw new Error('Failed to create AI agent');
  } catch (error) {
    console.error('Error creating AI agent:', error);
    throw error;
  }
}

export async function chatWithAgent(tokenId: string, message: string): Promise<string> {
  try {
    let agent = activeAgents.get(tokenId);
    
    if (!agent) {
      agent = await AIAgent.loadFromDatabase(tokenId);
      if (!agent) {
        agent = new AIAgent(tokenId);
        await agent.initialize();
      }
      activeAgents.set(tokenId, agent);
    }
    
    return await agent.chat(message);
  } catch (error) {
    console.error('Error chatting with agent:', error);
    throw error;
  }
}
