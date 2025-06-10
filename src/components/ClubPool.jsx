import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatUnits } from 'ethers';
import { toast } from 'react-toastify';

const ClubPool = () => {
  const { web3, contract, account, isAdmin } = useWeb3();
  const [clubPoolInfo, setClubPoolInfo] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState('');

  useEffect(() => {
    if (contract && account) {
      fetchClubPoolInfo();
      checkMembership();
    }
  }, [contract, account]);

  const fetchClubPoolInfo = async () => {
    try {
      const info = await contract.methods.clubPool().call();
      setClubPoolInfo({
        balance: formatUnits(info.balance, 6),
        lastDistribution: new Date(info.lastDistribution * 1000),
        memberCount: info.memberCount,
        active: info.active
      });
    } catch (error) {
      console.error('Error fetching club pool info:', error);
      toast.error('Failed to fetch club pool information');
    }
  };

  const checkMembership = async () => {
    try {
      const member = await contract.methods.clubPoolMembers(account).call();
      setIsMember(member);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const handleJoinClub = async () => {
    if (!contract || !account) return;
    
    setLoading(true);
    try {
      const tx = await contract.methods.addToClubPool().send({ from: account });
      toast.success('Successfully joined the club pool!');
      await checkMembership();
      await fetchClubPoolInfo();
    } catch (error) {
      console.error('Error joining club pool:', error);
      toast.error('Failed to join club pool');
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!contract || !account || !isAdmin) return;
    
    setLoading(true);
    try {
      const tx = await contract.methods.distributeClubPool().send({ from: account });
      toast.success('Club pool distributed successfully!');
      await fetchClubPoolInfo();
    } catch (error) {
      console.error('Error distributing club pool:', error);
      toast.error('Failed to distribute club pool');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!contract || !account || !isAdmin || !memberToRemove) return;
    
    setLoading(true);
    try {
      const tx = await contract.methods.removeFromClubPool(memberToRemove).send({ from: account });
      toast.success('Member removed successfully!');
      setMemberToRemove('');
      await fetchClubPoolInfo();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  if (!clubPoolInfo) {
    return <div className="loading">Loading club pool information...</div>;
  }

  return (
    <div className="club-pool-container">
      <h2>Club Pool</h2>
      
      <div className="club-pool-info">
        <div className="info-card">
          <h3>Pool Balance</h3>
          <p>{clubPoolInfo.balance} USDT</p>
        </div>
        
        <div className="info-card">
          <h3>Members</h3>
          <p>{clubPoolInfo.memberCount}</p>
        </div>
        
        <div className="info-card">
          <h3>Last Distribution</h3>
          <p>{clubPoolInfo.lastDistribution.toLocaleString()}</p>
        </div>
        
        <div className="info-card">
          <h3>Status</h3>
          <p>{clubPoolInfo.active ? 'Active' : 'Inactive'}</p>
        </div>
      </div>

      {!isMember && (
        <button 
          className="join-button"
          onClick={handleJoinClub}
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Club Pool'}
        </button>
      )}

      {isAdmin && (
        <div className="admin-controls">
          <button 
            className="distribute-button"
            onClick={handleDistribute}
            disabled={loading || !clubPoolInfo.active}
          >
            {loading ? 'Distributing...' : 'Distribute Pool'}
          </button>

          <div className="remove-member">
            <input
              type="text"
              placeholder="Member address to remove"
              value={memberToRemove}
              onChange={(e) => setMemberToRemove(e.target.value)}
            />
            <button
              onClick={handleRemoveMember}
              disabled={loading || !memberToRemove}
            >
              {loading ? 'Removing...' : 'Remove Member'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubPool; 