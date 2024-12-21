import React, { useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Transaction {
  hash: string;
  time: number;
  from: string;
  to: string;
  amount: string;
  fee: string;
}

export const Settings = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();
  const [balance, setBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState<'bounceable' | 'non-bounceable' | null>(null);
  const [bounceableAddress, setBounceableAddress] = useState<string>('');
  const [nonBounceableAddress, setNonBounceableAddress] = useState<string>('');

  // Initialize TON Client
  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  });

  useEffect(() => {
    const fetchAddressInfo = async () => {
      if (!tonConnectUI.account?.address) return;

      try {
        // Convert raw address to TON Address object
        const rawAddress = tonConnectUI.account.address;
        const address = Address.parse(rawAddress);

        // Get bounceable and non-bounceable formats
        setBounceableAddress(address.toString({ bounceable: true, urlSafe: true }));
        setNonBounceableAddress(address.toString({ bounceable: false, urlSafe: true }));

        // Fetch balance
        const balance = await client.getBalance(address);
        setBalance(formatTonAmount(balance));

        // Fetch transactions
        const transactions = await client.getTransactions(address, { limit: 20 });
        console.log(transactions); // Log the transactions to inspect their structure
        const formattedTransactions: Transaction[] = transactions.map((tx): Transaction => ({
          hash: tx.hash,
          time: tx.time,
          from: tx.inMessage?.source?.toString() || 'Unknown',
          to: tx.inMessage?.destination?.toString() || 'Unknown',
          amount: formatTonAmount(tx.inMessage?.value || '0'),
          fee: formatTonAmount(tx.fee)
        }));
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching address info:', error);
        toast({
          title: "Error",
          description: "Failed to fetch wallet information. Please try again.",
        });
      }
    };

    fetchAddressInfo();
  }, [tonConnectUI.account?.address]);

  const formatTonAmount = (amount: string | bigint): string => {
    const value = typeof amount === 'string' ? BigInt(amount) : amount;
    return (Number(value) / 1e9).toFixed(2);
  };

  const handleCopy = (type: 'bounceable' | 'non-bounceable') => {
    const address = type === 'bounceable' ? bounceableAddress : nonBounceableAddress;
    navigator.clipboard.writeText(address);
    setCopied(type);
    toast({
      title: "Address copied!",
      description: "The address has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!tonConnectUI.account?.address) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Please connect your wallet to view settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Wallet Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Wallet</h2>
        
        {/* Balance */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Balance</p>
          <p className="text-2xl font-bold">{balance} TON</p>
        </div>

        {/* Addresses */}
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">Bounceable Address</p>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-900 px-3 py-2 rounded-lg flex-1 font-mono text-sm">
                {bounceableAddress}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy('bounceable')}
                className="hover:bg-gray-700"
              >
                {copied === 'bounceable' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Non-bounceable Address</p>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-900 px-3 py-2 rounded-lg flex-1 font-mono text-sm">
                {nonBounceableAddress}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy('non-bounceable')}
                className="hover:bg-gray-700"
              >
                {copied === 'non-bounceable' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-4">Time</th>
                <th className="pb-4">From</th>
                <th className="pb-4">To</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4">Fee</th>
                <th className="pb-4">Hash</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.map((tx) => (
                <tr key={tx.hash} className="border-t border-gray-700">
                  <td className="py-4">{formatDate(tx.time)}</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1">
                      <span className="truncate max-w-[100px]">{tx.from}</span>
                      <a
                        href={`https://tonscan.org/address/${tx.from}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1">
                      <span className="truncate max-w-[100px]">{tx.to}</span>
                      <a
                        href={`https://tonscan.org/address/${tx.to}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                  <td className="py-4">{tx.amount} TON</td>
                  <td className="py-4">{tx.fee} TON</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1">
                      <span className="truncate max-w-[100px]">{tx.hash}</span>
                      <a
                        href={`https://tonscan.org/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
