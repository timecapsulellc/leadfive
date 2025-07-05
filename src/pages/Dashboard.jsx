import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ErrorBoundary from '../components/ErrorBoundary';
import EnhancedDashboard from '../components/enhanced/EnhancedDashboard';
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
    <ErrorBoundary>
      <EnhancedDashboard
        account={account}
        provider={provider}
        onDisconnect={onDisconnect}
      />
    </ErrorBoundary>
  );
}
