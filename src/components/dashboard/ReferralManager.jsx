import React, { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ReferralManager = ({ wallet, contract }) => {
  const [directReferrals, setDirectReferrals] = useState(null);
  const [teamSize, setTeamSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const address = wallet?.account || '0x0000...0000';
  const referralLink = address && address !== '0x0000...0000'
    ? `https://orphichain.app/register?sponsor=${address}`
    : '';

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!wallet?.account || !contract) return;
      setLoading(true);
      setError(null);
      try {
        const info = await contract.getUserInfo(wallet.account);
        setDirectReferrals(Number(info.directReferrals));
        setTeamSize(Number(info.teamSize));
      } catch (err) {
        setError('Failed to fetch referral data');
      }
      setLoading(false);
    };
    fetchReferralData();
  }, [wallet?.account, contract]);

  return (
    <div className="referral-manager card">
      <h2>Referral Management</h2>
      {loading ? (
        <LoadingSpinner size={32} />
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <b>Your Referral Link:</b>
            <div style={{ background: '#eee', padding: 8, borderRadius: 4, wordBreak: 'break-all' }}>{referralLink}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>QR Code:</b>
            <div style={{ width: 120, height: 120, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              {/* TODO: Integrate real QR code generator */}
              <span>QR</span>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Direct Referrals:</b> {directReferrals ?? '--'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Team Size:</b> {teamSize ?? '--'}
          </div>
          <Button onClick={() => navigator.clipboard.writeText(referralLink)} disabled={!referralLink} className="btn-secondary" style={{ width: '100%' }}>
            Copy Link
          </Button>
        </>
      )}
    </div>
  );
};

export default ReferralManager;
