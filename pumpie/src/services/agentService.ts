import { create } from 'zustand';

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
  chatHistory: ChatMessage[];
}

interface AgentState {
  tokenAgents: TokenAgent[];
  addTokenAgent: (tokenId: string, agentType: string, description: string) => void;
  addChatMessage: (tokenId: string, message: string, sender: 'user' | 'agent') => void;
  getAgentByToken: (tokenId: string) => TokenAgent | undefined;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  tokenAgents: [],

  addTokenAgent: (tokenId: string, agentType: string, description: string) => {
    set((state) => ({
      tokenAgents: [
        ...state.tokenAgents,
        {
          tokenId,
          agentType,
          description,
          chatHistory: []
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
  }
}));

// Function to generate agent response based on token description and chat history
export const generateAgentResponse = async (
  tokenId: string,
  userMessage: string
): Promise<string> => {
  const agent = useAgentStore.getState().getAgentByToken(tokenId);
  if (!agent) return "I'm sorry, I couldn't find the token agent.";

  // For now, return a simple response based on agent type
  const responses = {
    entertainment: [
      "That's a great meme reference! 🚀",
      "To the moon! 🌕",
      "This is the way! 💎🙌",
      "WAGMI! Let's build something amazing together!",
      "Now that's what I call diamond hands! 💎",
    ],
    onchain: [
      "Based on the on-chain metrics...",
      "Looking at the trading volume...",
      "The market indicators suggest...",
      "Analyzing the blockchain data...",
      "The technical analysis shows...",
    ]
  };

  const agentResponses = responses[agent.agentType as keyof typeof responses] || responses.entertainment;
  const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
  
  return randomResponse;
};
