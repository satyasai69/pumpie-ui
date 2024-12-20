import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config(); // Load environment variables

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Create a new token with agent
app.post('/api/tokens', async (req, res) => {
  try {
    const {
      tokenName,
      tokenSymbol,
      description,
      imageUrl,
      status,
      platformType,
      projectDescription,
      aiConfig
    } = req.body;

    const token = await prisma.token.create({
      data: {
        name: tokenName,
        symbol: tokenSymbol,
        description,
        imageUrl,
        status,
        agent: {
          create: {
            type: platformType,
            description: projectDescription,
            configJson: JSON.stringify(aiConfig)
          }
        }
      },
      include: {
        agent: true
      }
    });

    if (token.agent) {
      token.agent.config = JSON.parse(token.agent.configJson);
      delete token.agent.configJson;
    }

    res.json(token);
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ error: 'Failed to create token' });
  }
});

// Get token details
app.get('/api/tokens/:id', async (req, res) => {
  try {
    const token = await prisma.token.findUnique({
      where: { id: req.params.id },
      include: {
        agent: true,
        chatMessages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    if (token.agent) {
      token.agent.config = JSON.parse(token.agent.configJson);
      delete token.agent.configJson;
    }

    res.json(token);
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

// Store chat message
app.post('/api/chat/:tokenId', async (req, res) => {
  try {
    const { message, response } = req.body;
    
    // Save user message
    await prisma.chatMessage.create({
      data: {
        content: message,
        sender: 'user',
        tokenId: req.params.tokenId
      }
    });

    // Save agent response
    await prisma.chatMessage.create({
      data: {
        content: response,
        sender: 'agent',
        tokenId: req.params.tokenId
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error storing chat:', error);
    res.status(500).json({ error: 'Failed to store chat message' });
  }
});

// Get chat history
app.get('/api/chat-history/:tokenId', async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { tokenId: req.params.tokenId },
      orderBy: { timestamp: 'asc' }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
