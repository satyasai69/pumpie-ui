import React, { useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { useNetwork } from '../../context/NetworkContext';

interface WalletInfo {
  balance: string;
  wallet_type: string;
  user_friendly_address: string;
}

const getApiBaseUrl = (isTestnet: boolean) => {
  return isTestnet 
    ? 'https://testnet.toncenter.com/api/v2'
    : 'https://toncenter.com/api/v2';
};

function convertToUserFriendly(address: string, isTestnet: boolean): string {
  try {
    let rawAddress = address;
    
    // If it's already in a friendly format, parse it first
    if (address.match(/^(EQ|UQ|kQ|0Q)/)) {
      const addr = Address.parseFriendly(address);
      rawAddress = addr.address.toString();
    }
    
    const addr = Address.parse(rawAddress);
    // Use the correct method for non-bounceable address
    return addr.toString({
      testOnly: isTestnet,
      bounceable: false,
      urlSafe: true
    });
  } catch (error) {
    console.log('Address conversion error:', error);
    return address;
  }
}

export const Overview: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { network } = useNetwork();
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    balance: '0.0000',
    wallet_type: 'unknown',
    user_friendly_address: 'Not Connected'
  });
  const [transactions, setTransactions] = useState<number>(0);

  const fetchWalletData = async (address: string) => {
    try {
      const isTestnet = network === 'testnet';
      const baseUrl = getApiBaseUrl(isTestnet);
      
      const balanceResponse = await fetch(
        `${baseUrl}/getAddressBalance?address=${address}`
      );
      const balanceData = await balanceResponse.json();
      
      const txResponse = await fetch(
        `${baseUrl}/getTransactions?address=${address}`
      );
      const txData = await txResponse.json();

      setWalletInfo(prev => ({
        ...prev,
        balance: (Number(balanceData.result) / 1e9).toFixed(4),
        user_friendly_address: address,
        wallet_type: tonConnectUI.account?.wallet?.name || 'unknown'
      }));
      
      setTransactions(txData.result?.length || 0);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  useEffect(() => {
    if (tonConnectUI.account?.address) {
      const userFriendlyAddress = convertToUserFriendly(
        tonConnectUI.account.address,
        network === 'testnet'
      );
      fetchWalletData(userFriendlyAddress);
      
      const interval = setInterval(() => {
        fetchWalletData(userFriendlyAddress);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [tonConnectUI.account?.address, network]);

  const formatAddress = (address: string) => {
    if (!address || address === 'Not Connected') return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const shortAddress = formatAddress(walletInfo.user_friendly_address);
  const networkType = network === 'testnet' ? 'TON Testnet' : 'TON Mainnet';

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Your Address</p>
            <p 
              className="text-sm font-medium text-gray-900 break-all mt-1 cursor-copy"
              onClick={() => {
                if (walletInfo.user_friendly_address !== 'Not Connected') {
                  navigator.clipboard.writeText(walletInfo.user_friendly_address);
                }
              }}
              title="Click to copy full address"
            >
              {shortAddress}
            </p>
            <p className="text-xs text-gray-500 mt-1">{walletInfo.user_friendly_address}</p>
            <p className="text-xs text-gray-500 mt-1">Wallet Type: {walletInfo.wallet_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Network</p>
            <p className={`text-sm font-medium ${network === 'testnet' ? 'text-yellow-500' : 'text-green-500'}`}>
              {networkType}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-lg font-semibold text-gray-900">{walletInfo.balance} TON</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-lg font-semibold text-gray-900">{transactions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
