import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import { Dashboard } from './Pages/Dashboard';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import LiveStreamPage from './Pages/LiveStream/LiveStreamPage';
import { TokenView } from './Pages/TokenView/TokenView';
import { TON_CONNECT_CONFIG } from './config/contracts';
import { NetworkProvider } from './context/NetworkContext';

function App() {
  return (
    <TonConnectUIProvider 
      manifestUrl="https://gold-efficient-shrimp-912.mypinata.cloud/ipfs/QmSTeLxyTyU3C6po1cE52vvZyQwzdSa7moz72zevg6UJ1E" 
      walletsList={TON_CONNECT_CONFIG.walletsList}
    >
      <NetworkProvider>
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/token/:tokenId" element={<TokenView />} />
              <Route path="/live/:streamId?" element={<LiveStreamPage />} />
            </Routes>
          </Router>
        </div>
      </NetworkProvider>
    </TonConnectUIProvider>
  );
}

export default App;
