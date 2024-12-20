import React, { useState, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../../services/agentService';
import { NavBar } from '@/components/Blocks/Navbar';

export const LaunchToken: React.FC = () => {
  const navigate = useNavigate();
  const { addTokenAgent } = useAgentStore();
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    description: '',
    imageFile: null as File | null,
    agentType: 'entertainment',
    projectDescription: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        imageFile: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate a unique ID for the token
      const tokenId = Date.now().toString();
      
      // Create token object
      const newToken = {
        id: tokenId,
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        description: formData.description,
        imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : 'https://picsum.photos/200',
        price: 0,
        priceChange24h: 0,
        marketCap: 0,
        volume24h: 0,
        holders: 0,
        type: formData.agentType,
        agent: {
          type: formData.agentType,
          description: formData.projectDescription
        }
      };

      // Get existing tokens from localStorage
      const existingTokens = localStorage.getItem('tokens');
      const tokens = existingTokens ? JSON.parse(existingTokens) : [];

      // Add new token
      tokens.push(newToken);

      // Save back to localStorage
      localStorage.setItem('tokens', JSON.stringify(tokens));

      // Create agent for the token
      await addTokenAgent(tokenId, {
        type: formData.agentType,
        description: formData.projectDescription
      });

      // Show success message
      toast.success('Token launched successfully!', {
        duration: 3000,
        position: 'top-center',
      });

      // Navigate to token list
      setTimeout(() => {
        navigate('/tokens');
      }, 1000);

    } catch (error) {
      console.error('Error launching token:', error);
      toast.error('Failed to launch token. Please try again.');
    }
  };

  return (
    <>
      <NavBar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Launch Your Token</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Token Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80">Token Name</label>
                <input
                  type="text"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80">Token Symbol</label>
                <input
                  type="text"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80">Token Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-white/80
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-500/10 file:text-indigo-400
                    hover:file:bg-indigo-500/20"
                />
                {formData.imageFile && (
                  <p className="mt-2 text-sm text-white/60">
                    Selected: {formData.imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Agent Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80">Agent Type</label>
                <select
                  name="agentType"
                  value={formData.agentType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="entertainment">Entertainment Agent</option>
                  <option value="onchain">On-chain Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80">Project Description (for AI)</label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  placeholder="Describe your token's purpose and features for the AI agent..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Launch Token
          </button>
        </form>
      </div>
    </>
  );
};
