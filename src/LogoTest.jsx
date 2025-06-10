import React from 'react';
import OrphiChainLogo from './OrphiChainLogo';
import './OrphiChain.css';

function LogoTest() {
  return (
    <div style={{ padding: '20px', background: '#1A1A2E' }}>
      <h1 style={{ color: 'white' }}>OrphiChain Logo Test</h1>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <OrphiChainLogo size="small" variant="default" />
        <OrphiChainLogo size="medium" variant="default" />
        <OrphiChainLogo size="large" variant="full" />
      </div>
    </div>
  );
}

export default LogoTest;
