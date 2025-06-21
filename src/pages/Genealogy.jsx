import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FaUsers, FaNetworkWired, FaChartLine, FaSitemap } from 'react-icons/fa';
import NetworkTreeVisualization from '../components/NetworkTreeVisualization';
import MatrixVisualization from '../components/MatrixVisualization';
import './Genealogy.css';

const CONTRACT_ADDRESS = '0x18f7550B5B3e8b6101712D26083B6d1181Ee550a';
const CONTRACT_ABI = [
  { inputs: [{ internalType: 'address', name: '_user', type: 'address' }], name: 'getUserDirectReferrals', outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'users', outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'address', name: 'referrer', type: 'address' },
      { internalType: 'uint256', name: 'partnersCount', type: 'uint256' }
    ], stateMutability: 'view', type: 'function' }
];

const Genealogy = ({ account, provider }) => {
  const [viewMode, setViewMode] = useState('tree');
  const [networkData, setNetworkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState({ totalMembers: 0, directReferrals: 0, levels: 0, activeMembers: 0 });

  useEffect(() => {
    if (account && provider) loadNetworkData();
  }, [account, provider]);

  const loadNetworkData = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const userInfo = await contract.users(account);
      const directRefs = await contract.getUserDirectReferrals(account);
      const network = await buildNetworkStructure(contract, account, 5);
      const stats = calculateNetworkStats(network);
      setNetworkData(network);
      setNetworkStats({ ...stats, directReferrals: directRefs.length });
    } catch (err) {
      console.error('Error loading network data:', err);
    }
    setIsLoading(false);
  };

  const buildNetworkStructure = async (contract, address, maxLevel, currentLevel = 0) => {
    if (currentLevel >= maxLevel) return null;
    try {
      const user = await contract.users(address);
      const refs = await contract.getUserDirectReferrals(address);
      const children = await Promise.all(
        refs.slice(0, 5).map(addr => buildNetworkStructure(contract, addr, maxLevel, currentLevel + 1))
      );
      return { address, id: user.id.toNumber(), level: currentLevel, children: children.filter(c => c), isActive: user.id.toNumber() > 0 };
    } catch {
      return null;
    }
  };

  const calculateNetworkStats = (node) => {
    let total = 0, active = 0, depth = 0;
    const traverse = n => { if (!n) return; total++; if (n.isActive) active++; depth = Math.max(depth, n.level); n.children?.forEach(c => traverse(c)); };
    traverse(node);
    return { totalMembers: total, activeMembers: active, levels: depth + 1 };
  };

  if (!account) return <div className="genealogy-page"><p>Connect your wallet to view genealogy</p></div>;
  if (isLoading) return <div className="genealogy-page"><p>Loading your network...</p></div>;

  return (
    <div className="genealogy-page">
      <div className="genealogy-header">
        <h1>Network Genealogy</h1>
        <p>Visualize your complete network structure and growth</p>
      </div>
      <div className="network-stats">
        <div className="stat-card"><FaUsers className="stat-icon" /><div><h3>Direct Referrals</h3><p>{networkStats.directReferrals}</p></div></div>
        <div className="stat-card"><FaSitemap className="stat-icon" /><div><h3>Total Network</h3><p>{networkStats.totalMembers}</p></div></div>
        <div className="stat-card"><FaChartLine className="stat-icon" /><div><h3>Active Members</h3><p>{networkStats.activeMembers}</p></div></div>
        <div className="stat-card"><FaNetworkWired className="stat-icon" /><div><h3>Network Depth</h3><p>{networkStats.levels} Levels</p></div></div>
      </div>
      <div className="view-toggle">
        <button className={viewMode==='tree'?'active':''} onClick={()=>setViewMode('tree')}><FaSitemap /> Tree View</button>
        <button className={viewMode==='matrix'?'active':''} onClick={()=>setViewMode('matrix')}><FaNetworkWired /> Matrix View</button>
      </div>
      <div className="visualization-container">
        {viewMode==='tree'?(
          <NetworkTreeVisualization userAddress={account} networkData={networkData}/>
        ):(
          <MatrixVisualization userAddress={account} networkData={networkData}/>
        )}
      </div>
      <div className="network-legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div><span className="legend-color active"></span> Active Member</div>
          <div><span className="legend-color inactive"></span> Inactive Position</div>
          <div><span className="legend-color you"></span> You</div>
          <div><span className="legend-color direct"></span> Direct Referral</div>
        </div>
      </div>
    </div>
  );
};

export default Genealogy;
