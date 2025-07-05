import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedWelcome from '../components/AnimatedWelcome';
import UnifiedAIAssistant from '../components/unified/UnifiedAIAssistant';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home({
  account,
  provider,
  signer,
  onConnect,
  onDisconnect,
}) {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <main className="home-page" style={{ minHeight: '100vh' }}>
        <AnimatedWelcome account={account} onConnect={onConnect} />

        <UnifiedAIAssistant
          mode="floating"
          position="bottom-right"
          account={account}
          userInfo={{
            packageLevel: 1,
            teamSize: 0,
            directCount: 0,
            totalEarnings: 0,
            balance: 0,
            isRegistered: false,
          }}
          userStats={{
            level: 1,
            teamSize: 0,
            activeNodes: 0,
            totalEarnings: 0,
          }}
        />
      </main>
    </ErrorBoundary>
  );
}
