import React from 'react';

export const Transactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
        <div className="space-y-4">
          {/* Transaction list */}
          <div className="bg-white rounded-lg divide-y divide-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">No transactions yet</p>
                  <p className="text-sm text-gray-500">Your transactions will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Analytics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Sent</p>
            <p className="text-lg font-semibold text-gray-900">0 TON</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Received</p>
            <p className="text-lg font-semibold text-gray-900">0 TON</p>
          </div>
        </div>
      </div>
    </div>
  );
};
