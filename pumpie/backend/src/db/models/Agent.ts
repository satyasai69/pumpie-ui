import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  platformType: {
    type: String,
    enum: ['telegram', 'twitter', 'both'],
    required: true
  },
  telegramBotToken: String,
  twitterConfig: {
    apiKey: String,
    apiKeySecret: String,
    accessToken: String,
    accessTokenSecret: String
  },
  projectDescription: {
    type: String,
    required: true
  },
  aiConfig: {
    handleAnnouncements: {
      type: Boolean,
      default: true
    },
    handleUserQueries: {
      type: Boolean,
      default: true
    },
    customInstructions: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export const Agent = mongoose.model('Agent', AgentSchema);
