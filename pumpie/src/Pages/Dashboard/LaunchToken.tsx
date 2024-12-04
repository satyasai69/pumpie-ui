import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadToIPFS, uploadJSONToIPFS } from '../../services/ipfs';

interface TokenFormData {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  tokenImage: File | null;
  description: string;
  gptPrompt: string;
}

export const LaunchToken: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TokenFormData>({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    tokenImage: null,
    description: '',
    gptPrompt: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        tokenImage: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Upload image to IPFS
      let imageUrl = '';
      if (formData.tokenImage) {
        imageUrl = await uploadToIPFS(formData.tokenImage);
      }

      // Prepare token metadata
      const tokenMetadata = {
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        totalSupply: formData.totalSupply,
        description: formData.description,
        image: imageUrl,
        gptPrompt: formData.gptPrompt,
        createdAt: new Date().toISOString()
      };

      // Upload metadata to IPFS
      const metadataUrl = await uploadJSONToIPFS(tokenMetadata);

      // Here you would typically make an API call to your backend to:
      // 1. Store the token data in your database
      // 2. Deploy the token contract on TON
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Token launch initiated successfully! 🚀');
      setIsModalOpen(false);
      setCurrentStep(1);
      setFormData({
        tokenName: '',
        tokenSymbol: '',
        totalSupply: '',
        tokenImage: null,
        description: '',
        gptPrompt: ''
      });
    } catch (error) {
      console.error('Error launching token:', error);
      toast.error('Failed to launch token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Launch New Token</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Launch Token
          </button>
        </div>

        {/* Token Launch History or Status Could Go Here */}
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-500">No tokens launched yet. Click the button above to get started!</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Launch New Token</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">Token Details</span>
                <span className="text-sm text-gray-500">GPT Training</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Name
                    </label>
                    <input
                      type="text"
                      name="tokenName"
                      value={formData.tokenName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Symbol
                    </label>
                    <input
                      type="text"
                      name="tokenSymbol"
                      value={formData.tokenSymbol}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Supply
                    </label>
                    <input
                      type="number"
                      name="totalSupply"
                      value={formData.totalSupply}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Image
                    </label>
                    <input
                      type="file"
                      name="tokenImage"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPT Training Prompt
                  </label>
                  <textarea
                    name="gptPrompt"
                    value={formData.gptPrompt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    placeholder="Describe how you want your token's AI to behave and interact..."
                    required
                  />
                </div>
              )}

              <div className="flex justify-between pt-4">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Launch Token
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
