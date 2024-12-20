import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createAgent } from './aiAgent.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create AI Agent endpoint
app.post('/api/create-agent', async (req, res) => {
  try {
    const agentConfig = req.body;
    const agent = await createAgent(agentConfig);
    res.json({ success: true, message: 'AI agent created successfully' });
  } catch (error: any) {
    console.error('Error creating AI agent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
