import React, { useState, ChangeEvent } from 'react';
import { Address, toNano } from '@ton/core';
import { Jetton } from '../../../wrappers/Jetton';
import { buildOnchainMetadata, createCompactUrl } from '../../../utils/jetton-helpers';
import { uploadToIPFS, validateImageFile } from '../../utils/ipfs-upload';
import { toast } from 'react-hot-toast';

interface TokenFormData {
  tokenName: string;
  tokenSymbol: string;
  description: string;
  imageUrl: string;
  totalSupply: string;
}

export const LaunchToken: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<TokenFormData>({
    tokenName: '',
    tokenSymbol: '',
    description: '',
    imageUrl: '',
    totalSupply: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate file
      validateImageFile(file);
      
      // Set local file for preview
      setImageFile(file);
      
      // Start upload
      setIsUploading(true);
      const ipfsUrl = await uploadToIPFS(file);
      
      // Update form data with IPFS URL
      setFormData(prev => ({
        ...prev,
        imageUrl: ipfsUrl
      }));
      
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message);
      setImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTokenLaunch = async () => {
    try {
      // Validate input lengths
      if (formData.tokenName.length > 32) {
        throw new Error('Token name must be less than 32 characters');
      }
      if (formData.description.length > 64) {
        throw new Error('Description must be less than 64 characters');
      }
      if (!formData.imageUrl) {
        throw new Error('Please upload an image first');
      }

      // Create compact URL for the image
      const compactImageUrl = createCompactUrl(formData.imageUrl);
      console.log('Original URL:', formData.imageUrl);
      console.log('Compact URL:', compactImageUrl);

      // Create metadata cell with compact URL
      const metadata = buildOnchainMetadata({
        name: formData.tokenName,
        description: formData.description,
        image: compactImageUrl
      });

      // Rest of deployment logic remains the same...
      const provider = window.ton;
      if (!provider) {
        throw new Error("TON wallet not connected");
      }

      try {
        // Get the connected wallet address
        const walletAddress = await provider.send('ton_requestAccounts');
        if (!walletAddress || !walletAddress.length) {
          throw new Error("Failed to get wallet address");
        }

        const senderAddress = Address.parse(walletAddress[0]);

        const jetton = Jetton.createFromConfig({
          adminAddress: senderAddress,
          content: metadata,
          workchain: 0
        });

        // Deploy contract
        setIsLoading(true);
        await jetton.sendDeploy(
          provider,
          { address: senderAddress },
          toNano('0.5')
        );

        // Wait and initialize
        await new Promise(resolve => setTimeout(resolve, 5000));
        await jetton.send(
          provider,
          { address: senderAddress },
          {
            value: toNano('0.3'),
            bounce: true
          }
        );

        toast.success('Token deployed successfully!');
        setIsModalOpen(false);
        setCurrentStep(1);
        setFormData({
          tokenName: '',
          tokenSymbol: '',
          description: '',
          imageUrl: '',
          totalSupply: ''
        });
        setImageFile(null);

      } catch (error: any) {
        console.error('Deployment error:', error);
        toast.error(error.message || 'Failed to deploy token');
      }
    } catch (error: any) {
      console.error('Deployment error:', error);
      toast.error(error.message || 'Failed to deploy token');
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

            <form className="space-y-6">
              {currentStep === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Name *
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
                      Token Symbol *
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Image *
                    </label>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="mt-1 block w-full"
                    />
                    {imageFile && (
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview" 
                        className="mt-2 max-w-[200px] max-h-[200px] object-cover" 
                      />
                    )}
                    {isUploading && (
                      <p className="text-blue-500 mt-2">Uploading to IPFS...</p>
                    )}
                    {formData.imageUrl && (
                      <p className="text-green-500 mt-2 text-sm">
                        IPFS URL: {formData.imageUrl}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
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
                    type="button"
                    onClick={handleTokenLaunch}
                    className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Launching...' : 'Launch Token'}
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
