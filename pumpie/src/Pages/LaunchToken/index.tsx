import React, { useState, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../../services/agentService';
import { NavBar } from '@/components/Blocks/Navbar';
import { api } from '../../services/api';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useNetwork } from '../../context/NetworkContext';
import { Address } from '@ton/core';

export const LaunchToken: React.FC = () => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const { network } = useNetwork();
  const { addTokenAgent } = useAgentStore();
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    description: '',
    imageFile: null as File | null,
    agentType: 'entertainment',
    projectDescription: '',
  });

  const [step, setStep] = useState(1);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        imageFile: e.target.files![0]
      }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // For now, let's use a mock image URL
      // In production, you would upload to a real image hosting service
      return `https://example.com/images/${file.name}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const getNonBounceableAddress = (address: string, isTestnet: boolean): string => {
    try {
      let addr;
      if (address.match(/^(EQ|UQ|kQ|0Q)/)) {
        const parsed = Address.parseFriendly(address);
        addr = parsed.address;
      } else {
        addr = Address.parse(address);
      }
      return addr.toString({
        testOnly: isTestnet,
        bounceable: false,
        urlSafe: true
      });
    } catch (error) {
      console.error('Address conversion error:', error);
      return address;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    const wallet = tonConnectUI.account;
    console.log('Wallet status:', wallet);
    
    if (!wallet) {
      toast.error('Please connect your TON wallet first');
      return;
    }

    if (!formData.tokenName || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('Checking for existing tokens...');
      const existingTokens = await api.getTokens();
      console.log('Existing tokens response:', existingTokens);
      
      if (existingTokens.success && Array.isArray(existingTokens.tokens)) {
        const tokenExists = existingTokens.tokens.some(
          token => token.name.toLowerCase() === formData.tokenName.toLowerCase()
        );
        if (tokenExists) {
          toast.error('A token with this name already exists');
          return;
        }
      }

      // Show loading toast
      const loadingToast = toast.loading('Creating your token...');
      console.log('Creating token...');

      // First store in local agentStore for backward compatibility
      const agent = {
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        description: formData.description,
        type: formData.agentType,
        projectDescription: formData.projectDescription
      };
      addTokenAgent(agent);
      console.log('Added to agent store:', agent);

      // Get non-bounceable address based on current network
      const isTestnet = network === 'testnet';
      const nonBounceableAddress = getNonBounceableAddress(wallet.address, isTestnet);
      console.log('Non-bounceable address:', nonBounceableAddress);
      
      const tokenData = {
        name: formData.tokenName,
        description: formData.description,
        agentType: formData.agentType,
        creatorAddress: nonBounceableAddress,
        imageUrl: 'https://picsum.photos/200',
        networkType: isTestnet ? 'testnet' : 'mainnet'
      };
      console.log('Sending token data to API:', tokenData);

      const response = await api.createToken(tokenData);
      console.log('API response:', response);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.success) {
        // Show success message
        toast.success('🎉 Token created successfully!');
        console.log('Token created successfully:', response.token);
        
        // Navigate to the token view page
        if (response.token?._id) {
          console.log('Navigating to token view:', response.token._id);
          setTimeout(() => {
            navigate(`/token/${response.token._id}`);
          }, 1000);
        } else {
          console.log('No token ID received, navigating to list');
          navigate('/token-list');
        }
      } else {
        throw new Error(response.error || 'Failed to create token');
      }
    } catch (error: any) {
      console.error('Error creating token:', error);
      toast.error(error.message || 'Failed to create token');
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
                  <option value="entertainment">Entertainment</option>
                  <option value="utility">Utility</option>
                  <option value="social">Social</option>
                  <option value="defi">DeFi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80">Project Description</label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows={5}
                  className="mt-1 block w-full rounded-md bg-white/5 border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  placeholder="Describe your token's purpose and features..."
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
