import React, { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ReferralManager = ({ wallet, contract }) => {
  const [directReferrals, setDirectReferrals] = useState(0);
  const [teamSize, setTeamSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const address = wallet?.account || '0x0000...0000';
  const referralLink = address && address !== '0x0000...0000'
    ? `https://orphichain.app/register?sponsor=${address}`
    : 'https://orphichain.app/register';

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!wallet?.account || !contract) {
        // Set demo data when wallet is not connected
        setDirectReferrals(0);
        setTeamSize(0);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const info = await contract.getUserInfo(wallet.account);
        setDirectReferrals(Number(info.directReferrals));
        setTeamSize(Number(info.teamSize));
      } catch (err) {
        console.error('Error fetching referral data:', err);
        setError('Failed to fetch referral data');
        // Set demo data on error
        setDirectReferrals(0);
        setTeamSize(0);
      }
      setLoading(false);
    };
    fetchReferralData();
  }, [wallet?.account, contract]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="referral-manager card">
      <h2>🔗 Referral Management</h2>
      {loading && <LoadingSpinner size={32} />}
      
      {error && (
        <div className="error-message" style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--accent-bg)', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      
      <div className="referral-section">
        <div className="referral-stats">
          <div className="stat-item">
            <div className="label">Direct Referrals</div>
            <div className="value">{directReferrals}</div>
          </div>
          <div className="stat-item">
            <div className="label">Team Size</div>
            <div className="value">{teamSize}</div>
          </div>
        </div>

        <div className="referral-link-section">
          <h3>Your Referral Link</h3>
          <div className="link-container">
            <input 
              type="text" 
              value={referralLink} 
              readOnly 
              className="referral-link-input"
            />
          </div>
        </div>

        <div className="qr-code-container">
          <h3>QR Code</h3>
          <div className="qr-placeholder">
            QR
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Share this QR code for easy referrals
          </p>
        </div>

        <Button 
          onClick={copyToClipboard}
          className="btn-primary copy-link-btn"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );
};

export default ReferralManager;
