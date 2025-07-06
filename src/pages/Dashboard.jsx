import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ErrorBoundary from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LazyLoader';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import '../styles/brandColors.css';
import './Dashboard.css';

// Lazy load the dashboard for better performance
const LazyEnhancedDashboard = lazy(() => import('../components/enhanced/LazyEnhancedDashboard'));

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
      <Suspense fallback={
        <div className="dashboard-loading">
          <LoadingSpinner />
          <p>Loading your dashboard...</p>
        </div>
      }>
        <LazyEnhancedDashboard
          account={account}
          provider={provider}
          onDisconnect={onDisconnect}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
