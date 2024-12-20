import { GoogleGenerativeAI } from '@google/generative-ai';
import { Telegraf } from 'telegraf';
import { TwitterApi } from 'twitter-api-v2';
import { Agent } from './db/models/Agent.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

interface TwitterConfig {
  apiKey: string;
  apiKeySecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

interface AgentConfig {
  platformType: 'telegram' | 'twitter' | 'both';
  telegramBotToken?: string | null;
  twitterConfig?: Partial<TwitterConfig> | null;
  projectDescription: string;
  aiConfig?: {
    handleAnnouncements?: boolean;
    handleUserQueries?: boolean;
    customInstructions?: string;
  };
  walletAddress: string;
}

class AIAgent {
  private bot: Telegraf | null = null;
  private twitterClient: TwitterApi | null = null;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private projectDescription: string;
  private aiConfig: AgentConfig['aiConfig'];
  private agentId: string;

  constructor(config: AgentConfig, agentId: string) {
    console.log('Constructing AIAgent...');
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.projectDescription = config.projectDescription;
    this.aiConfig = config.aiConfig;
    this.agentId = agentId;

    // Initialize bots asynchronously
    this.initialize(config).catch(error => {
      console.error('Error initializing agent:', error);
      throw error;
    });
  }

  private async initialize(config: AgentConfig) {
    if (config.telegramBotToken && ['telegram', 'both'].includes(config.platformType)) {
      console.log('About to initialize Telegram bot...');
      await this.initializeTelegramBot(config.telegramBotToken);
      console.log('Telegram bot initialization completed');
    }

    if (config.twitterConfig && ['twitter', 'both'].includes(config.platformType)) {
      await this.initializeTwitterClient(config.twitterConfig);
    }
  }

  private async initializeTelegramBot(token: string) {
    try {
      console.log('Starting Telegram bot initialization with token:', token.substring(0, 10) + '...');
      
      // Create bot instance
      this.bot = new Telegraf(token);
      console.log('Telegraf instance created');
      
      // Verify bot token by getting bot info
      const botInfo = await this.bot.telegram.getMe();
      console.log('Bot verification successful:', botInfo.username);
      
      // Start command
      this.bot.command('start', async (ctx) => {
        console.log('Received /start command');
        await ctx.reply('👋 Hello! I am your AI assistant. How can I help you today?');
      });

      // Help command
      this.bot.command('help', async (ctx) => {
        await ctx.reply(
          'Here are the available commands:\n' +
          '/start - Start the bot\n' +
          '/help - Show this help message\n' +
          '/info - Get information about the project\n' +
          'You can also send me any message and I will try to help you!'
        );
      });

      // Info command
      this.bot.command('info', async (ctx) => {
        await ctx.reply(`About this project:\n${this.projectDescription}`);
      });

      // Handle regular messages
      this.bot.on('text', async (ctx) => {
        if (!ctx.message.text.startsWith('/')) {
          console.log('Received message:', ctx.message.text);
          try {
            const response = await this.generateResponse(ctx.message.text);
            await ctx.reply(response);
          } catch (error) {
            console.error('Error generating response:', error);
            await ctx.reply('Sorry, I encountered an error while processing your message. Please try again.');
          }
        }
      });

      // Launch bot with error handling
      console.log('About to launch Telegram bot...');
      try {
        await this.bot.launch();
        console.log('✅ Telegram bot successfully launched!');
        globalBots.set(this.agentId, this.bot);
      } catch (launchError) {
        console.error('Failed to launch bot:', launchError);
        throw new Error('Failed to launch Telegram bot');
      }

      // Enable graceful stop
      process.once('SIGINT', () => {
        console.log('Stopping bot due to SIGINT');
        this.bot?.stop('SIGINT');
      });
      process.once('SIGTERM', () => {
        console.log('Stopping bot due to SIGTERM');
        this.bot?.stop('SIGTERM');
      });
      
      console.log('Telegram bot initialization completed');
    } catch (error) {
      console.error('❌ Critical error in initializeTelegramBot:', error);
      // Clean up if initialization fails
      if (this.bot) {
        try {
          await this.bot.stop();
        } catch (stopError) {
          console.error('Error stopping bot during cleanup:', stopError);
        }
      }
      throw error;
    }
  }

  private initializeTwitterClient(config: NonNullable<AgentConfig['twitterConfig']>) {
    if (!config.apiKey || !config.apiKeySecret || !config.accessToken || !config.accessTokenSecret) return;

    try {
      this.twitterClient = new TwitterApi({
        appKey: config.apiKey,
        appSecret: config.apiKeySecret,
        accessToken: config.accessToken,
        accessSecret: config.accessTokenSecret,
      });

      console.log(`[Agent ${this.agentId}] Twitter client initialized successfully`);
    } catch (error) {
      console.error(`[Agent ${this.agentId}] Error initializing Twitter client:`, error);
      throw new Error('Failed to initialize Twitter client. Please check your credentials.');
    }
  }

  private async generateResponse(query: string): Promise<string> {
    try {
      console.log(`[Agent ${this.agentId}] Generating response for query:`, query);
      const prompt = `You are an AI assistant for a crypto project. Project description: ${this.projectDescription}. ${this.aiConfig.customInstructions}

User query: ${query}

Please provide a helpful, accurate, and engaging response. If you're not sure about something, be honest about it.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      console.log(`[Agent ${this.agentId}] Generated response:`, response.text());
      return response.text();
    } catch (error) {
      console.error(`[Agent ${this.agentId}] Error generating response:`, error);
      throw error;
    }
  }

  async makeAnnouncement(message: string, generateImage: boolean = false) {
    try {
      // Post to Telegram if bot is initialized
      if (this.bot) {
        const channels = await this.getChannels();
        for (const channel of channels) {
          await this.bot.telegram.sendMessage(channel, message);
        }
      }

      // Post to Twitter if client is initialized
      if (this.twitterClient) {
        await this.twitterClient.v2.tweet(message);
      }
    } catch (error) {
      console.error(`[Agent ${this.agentId}] Error making announcement:`, error);
      throw error;
    }
  }

  private async getChannels(): Promise<string[]> {
    // In a real implementation, this would fetch channels from the database
    return ['@your_channel'];
  }

  stop() {
    if (this.bot) {
      this.bot.stop();
      globalBots.delete(this.agentId);
    }
  }
}

// Global store for bot instances
const globalBots = new Map<string, Telegraf>();

// Temporary local storage solution
const STORAGE_FILE = path.join(process.cwd(), 'agents.json');

async function readAgents() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeAgents(agents: any[]) {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(agents, null, 2));
}

// Function to get all agents for a user
export const getAgentsForUser = async (walletAddress: string) => {
  try {
    const agents = await readAgents();
    const userAgents = agents.filter(agent => agent.walletAddress === walletAddress);
    
    // Add status information
    const agentsWithStatus = userAgents.map(agent => ({
      ...agent,
      isRunning: globalBots.has(agent._id),
      status: globalBots.has(agent._id) ? 'running' : 'stopped'
    }));
    
    return agentsWithStatus;
  } catch (error) {
    console.error('Error getting agents for user:', error);
    throw new Error('Failed to get agents');
  }
};

// Function to get agent status
export const getAgentStatus = async (agentId: string) => {
  try {
    const agents = await readAgents();
    const agent = agents.find(a => a._id === agentId);
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    return {
      ...agent,
      isRunning: globalBots.has(agentId),
      status: globalBots.has(agentId) ? 'running' : 'stopped'
    };
  } catch (error) {
    console.error('Error getting agent status:', error);
    throw new Error('Failed to get agent status');
  }
};

// Update createAgent to include wallet address
export const createAgent = async (config: AgentConfig & { walletAddress: string }) => {
  try {
    console.log('Starting agent creation with config:', {
      platformType: config.platformType,
      hasToken: !!config.telegramBotToken,
      projectDescription: config.projectDescription,
      walletAddress: config.walletAddress
    });

    const agentId = uuidv4();
    const agents = await readAgents();
    
    const newAgent = {
      _id: agentId,
      platformType: config.platformType,
      telegramBotToken: config.telegramBotToken,
      twitterConfig: config.twitterConfig,
      projectDescription: config.projectDescription,
      aiConfig: config.aiConfig,
      isActive: true,
      walletAddress: config.walletAddress,
      createdAt: new Date().toISOString()
    };

    agents.push(newAgent);
    await writeAgents(agents);

    console.log('Agent data saved with ID:', agentId);

    // Create and initialize agent
    console.log('Initializing AI Agent with token:', config.telegramBotToken?.substring(0, 10) + '...');
    const aiAgent = new AIAgent(config, agentId);
    
    // Wait for initialization to complete or timeout after 10 seconds
    try {
      await Promise.race([
        new Promise((_, reject) => setTimeout(() => reject(new Error('Initialization timeout')), 10000)),
        new Promise(resolve => {
          const checkInterval = setInterval(() => {
            const bot = globalBots.get(agentId);
            if (bot) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 500);
        })
      ]);
      console.log('AI Agent initialized and bot is running');
    } catch (initError) {
      console.error('Warning: Bot initialization timed out, but agent was created:', initError);
    }
    
    return agentId;
  } catch (error) {
    console.error('Detailed error in createAgent:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create agent');
  }
};
