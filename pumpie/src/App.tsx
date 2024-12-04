import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import { Dashboard } from './Pages/Dashboard';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import LiveStreamPage from './Pages/LiveStream/LiveStreamPage';
import { TokenView } from './Pages/TokenView/TokenView';


function App() {
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/token/:tokenId" element={<TokenView />} />
          <Route path="/live/:streamId?" element={<LiveStreamPage />} />
        </Routes>
      </Router>
    </TonConnectUIProvider>
  );
}

export default App;
