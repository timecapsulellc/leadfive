import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import PageWrapper from '../components/PageWrapper';
import ErrorBoundary from '../components/ErrorBoundary';
import ComprehensiveDashboard from '../components/enhanced/ComprehensiveDashboard';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import '../styles/brandColors.css';
import './Dashboard.css';

export default function Dashboard({ account, provider, onDisconnect }) {
  const navigate = useNavigate();

  // Create contract instance when provider is available
  const contractInstance = useMemo(() => {
    if (!provider || !account) return null;
    
    try {
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  }, [provider, account]);

  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
  }, [account, navigate]);

  return (
    <PageWrapper>
      <ErrorBoundary>
        <ComprehensiveDashboard 
          userAddress={account}
          contractInstance={contractInstance}
          web3={provider}
          account={account}
        />
      </ErrorBoundary>
    </PageWrapper>
  );
}

