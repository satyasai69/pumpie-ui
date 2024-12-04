import React from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

export const Overview: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Your Address</p>
            <p className="text-sm font-medium text-gray-900 break-all mt-1">
              {tonConnectUI.account?.address}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Network</p>
            <p className="text-sm font-medium text-gray-900 mt-1">TON Mainnet</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-lg font-semibold text-gray-900">0 TON</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-lg font-semibold text-gray-900">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
