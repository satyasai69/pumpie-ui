const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  agentType: {
    type: String,
    required: true
  },
  creatorAddress: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  networkType: {
    type: String,
    enum: ['testnet', 'mainnet'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Token', tokenSchema);
