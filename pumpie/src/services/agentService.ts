import { create } from 'zustand';
import { ForumPost, ForumReply } from '../types/forum';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: Date;
}

interface TokenAgent {
  tokenId: string;
  agentType: string;
  description: string;
  projectDescription: string;
  chatHistory: ChatMessage[];
  trainingData: {
    projectDescription: string;
    forumPosts: ForumPost[];
  };
}

interface AgentState {
  tokenAgents: TokenAgent[];
  forumPosts: Record<string, ForumPost[]>;
  addTokenAgent: (tokenId: string, agentType: string, description: string, projectDescription: string) => void;
  addChatMessage: (tokenId: string, message: string, sender: 'user' | 'agent') => void;
  getAgentByToken: (tokenId: string) => TokenAgent | undefined;
  createForumPost: (tokenId: string, post: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => Promise<ForumPost>;
  addForumReply: (tokenId: string, postId: string, reply: Omit<ForumReply, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ForumReply>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  tokenAgents: [],
  forumPosts: {},

  addTokenAgent: (tokenId: string, agentType: string, description: string, projectDescription: string) => {
    set((state) => ({
      tokenAgents: [
        ...state.tokenAgents,
        {
          tokenId,
          agentType,
          description,
          projectDescription,
          chatHistory: [],
          trainingData: {
            projectDescription,
            forumPosts: []
          }
        }
      ]
    }));
  },

  addChatMessage: (tokenId: string, message: string, sender: 'user' | 'agent') => {
    set((state) => ({
      tokenAgents: state.tokenAgents.map((agent) => {
        if (agent.tokenId === tokenId) {
          return {
            ...agent,
            chatHistory: [
              ...agent.chatHistory,
              {
                id: Date.now().toString(),
                sender,
                message,
                timestamp: new Date()
              }
            ]
          };
        }
        return agent;
      })
    }));
  },

  getAgentByToken: (tokenId: string) => {
    return get().tokenAgents.find((agent) => agent.tokenId === tokenId);
  },

  createForumPost: async (tokenId: string, post) => {
    const newPost: ForumPost = {
      id: Date.now().toString(),
      tokenId,
      ...post,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      upvotes: 0,
      downvotes: 0
    };

    set((state) => ({
      forumPosts: {
        ...state.forumPosts,
        [tokenId]: [...(state.forumPosts[tokenId] || []), newPost]
      }
    }));

    // Generate agent response
    const agentReply = await generateAgentResponse(tokenId, post.content);
    if (agentReply) {
      await get().addForumReply(tokenId, newPost.id, {
        postId: newPost.id,
        content: agentReply,
        authorAddress: 'agent',
        isAgentResponse: true,
        upvotes: 0,
        downvotes: 0
      });
    }

    return newPost;
  },

  addForumReply: async (tokenId: string, postId: string, reply) => {
    const newReply: ForumReply = {
      id: Date.now().toString(),
      ...reply,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      forumPosts: {
        ...state.forumPosts,
        [tokenId]: state.forumPosts[tokenId].map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: [...post.replies, newReply]
            };
          }
          return post;
        })
      }
    }));

    return newReply;
  }
}));

// Function to generate agent response based on token description and project context
export const generateAgentResponse = async (
  tokenId: string,
  userMessage: string
): Promise<string> => {
  const agent = useAgentStore.getState().getAgentByToken(tokenId);
  if (!agent) return "I'm sorry, I couldn't find the token agent.";

  // Context-aware response generation based on project description and agent type
  const context = {
    projectDescription: agent.projectDescription,
    agentType: agent.agentType,
    previousPosts: useAgentStore.getState().forumPosts[tokenId] || []
  };

  // Generate response based on agent type and context
  switch (agent.agentType) {
    case 'entertainment':
      return generateEntertainmentResponse(context, userMessage);
    case 'defi':
      return generateDeFiResponse(context, userMessage);
    case 'gaming':
      return generateGamingResponse(context, userMessage);
    case 'social':
      return generateSocialResponse(context, userMessage);
    default:
      return generateDefaultResponse(context, userMessage);
  }
};

const generateEntertainmentResponse = (context: any, userMessage: string): string => {
  // Entertainment-focused response
  return `Based on ${context.projectDescription}, here's what I think about your question regarding entertainment: [Response based on context]`;
};

const generateDeFiResponse = (context: any, userMessage: string): string => {
  // DeFi-focused response
  return `From a DeFi perspective and considering ${context.projectDescription}, here's my analysis: [Response based on context]`;
};

const generateGamingResponse = (context: any, userMessage: string): string => {
  // Gaming-focused response
  return `As a gaming project described as ${context.projectDescription}, here's my take: [Response based on context]`;
};

const generateSocialResponse = (context: any, userMessage: string): string => {
  // Social-focused response
  return `Considering the social aspects of ${context.projectDescription}, here's my response: [Response based on context]`;
};

const generateDefaultResponse = (context: any, userMessage: string): string => {
  // Default response with project context
  return `Based on the project description: ${context.projectDescription}, here's my response: [Response based on context]`;
};
