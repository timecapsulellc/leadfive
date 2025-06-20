import React, { useState } from 'react';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const handleWalletConnect = async (connectedAccount, web3Provider, web3Signer) => {
    setAccount(connectedAccount);
    setProvider(web3Provider);
    setSigner(web3Signer);
  };

  const handleDisconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  return (
    <div className="App">
      {!account ? (
        <Welcome onConnect={handleWalletConnect} />
      ) : (
        <Dashboard 
          account={account}
          provider={provider}
          signer={signer}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
}

export default App
