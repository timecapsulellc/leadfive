import React, { useState, useEffect } from 'react';
import Web3Service from '../services/Web3Service';

// 1. Secure Admin Controls
export const SecureAdminPanel = ({ userAddress }) => {
  const [adminVerified, setAdminVerified] = useState(false);

  useEffect(() => {
    verifyAdminAccess();
    // eslint-disable-next-line
  }, []);

  const verifyAdminAccess = async () => {
    try {
      const isAdmin = await Web3Service.isAdmin(userAddress);
      if (!isAdmin) {
        throw new Error('Unauthorized access attempt');
      }
      setAdminVerified(true);
    } catch (error) {
      console.error('Admin verification failed:', error);
      // Log security incident (implement this function as needed)
      // logSecurityEvent('unauthorized_admin_access', userAddress);
    }
  };

  if (!adminVerified) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="secure-admin-panel">
      {/* Admin controls with proper authorization */}
      <h2>Admin Panel</h2>
      {/* Add admin-only controls here */}
    </div>
  );
};

// 2. Secure Smart Contract Interactions
export const secureContractCall = async (method, params = []) => {
  try {
    await Web3Service.ensureInitialized();
    const contract = Web3Service.contract;
    // Estimate gas before transaction
    const gasEstimate = await contract.estimateGas[method](...params);
    const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
    // Execute with proper error handling
    const tx = await contract[method](...params, { gasLimit });
    // Wait for confirmation
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error(`Contract call failed: ${method}`, error);
    throw error;
  }
};

// 3. Security Monitoring Dashboard
export const SecurityMonitor = () => {
  const [securityMetrics, setSecurityMetrics] = useState({
    totalUsers: 0,
    suspiciousActivity: 0,
    contractHealth: 'healthy',
    lastAudit: null,
  });

  // You can add useEffect here to fetch real metrics from backend or contract

  return (
    <div className="security-monitor">
      <h3>🛡️ Security Status</h3>
      <div className="security-grid">
        <div className="metric">
          <span>Contract Status</span>
          <span className={`status ${securityMetrics.contractHealth}`}>
            {securityMetrics.contractHealth}
          </span>
        </div>
        <div className="metric">
          <span>Active Users</span>
          <span>{securityMetrics.totalUsers}</span>
        </div>
        <div className="metric">
          <span>Security Events</span>
          <span className="alert">{securityMetrics.suspiciousActivity}</span>
        </div>
      </div>
    </div>
  );
};
