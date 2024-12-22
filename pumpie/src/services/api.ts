import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

interface TokenData {
  _id?: string;
  name: string;
  description: string;
  agentType: string;
  creatorAddress: string;
  imageUrl?: string;
  networkType: 'testnet' | 'mainnet';
  price?: number;
  priceChange24h?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  token?: T;
  tokens?: T[];
}

export const api = {
  // Create a new token and agent
  createToken: async (tokenData: TokenData) => {
    try {
      console.log('API: Creating token with data:', tokenData);
      const response = await axios.post<ApiResponse<TokenData>>(`${API_BASE_URL}/create-agent`, tokenData);
      console.log('API: Create token response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error creating token:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to create token');
    }
  },

  // Get all tokens
  getTokens: async () => {
    try {
      console.log('API: Fetching all tokens');
      const response = await axios.get<ApiResponse<TokenData>>(`${API_BASE_URL}/tokens`);
      console.log('API: Get tokens response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error fetching tokens:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to fetch tokens');
    }
  },

  // Get token by ID
  getToken: async (id: string) => {
    try {
      console.log('API: Fetching token by ID:', id);
      const response = await axios.get<ApiResponse<TokenData>>(`${API_BASE_URL}/token/${id}`);
      console.log('API: Get token response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error fetching token:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to fetch token');
    }
  },

  // Get token by ID
  getTokenById: async (id: string) => {
    try {
      console.log('API: Fetching token by ID:', id);
      const response = await axios.get<ApiResponse<TokenData>>(`${API_BASE_URL}/token/${id}`);
      console.log('API: Get token response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error fetching token:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to fetch token');
    }
  },

  // Update token address
  updateTokenAddress: async (id: string, address: string) => {
    try {
      console.log('API: Updating token address:', { id, address });
      const response = await axios.patch<ApiResponse<TokenData>>(`${API_BASE_URL}/token/${id}/address`, { address });
      console.log('API: Update token address response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error updating token address:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to update token address');
    }
  }
};
