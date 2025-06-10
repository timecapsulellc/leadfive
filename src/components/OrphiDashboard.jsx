import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from '../contracts';
import { ethers, formatEther } from 'ethers';
import { toast } from 'react-toastify';

const OrphiDashboard = () => {
  const { account, provider } = useWeb3();
  const [userInfo, setUserInfo] = useState(null);
  const [matrixInfo, setMatrixInfo] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (account && provider) {
      fetchData();
      setReferralLink(`${window.location.origin}?ref=${account}`);
    }
  }, [account, provider]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.bscTestnet.orphiCrowdFund,
        CONTRACT_ABI,
        provider.getSigner()
      );
      
      // Fetch user info
      const userInfo = await contract.getUserInfo();
      setUserInfo({
        referrer: userInfo.referrer,
        level: userInfo.level.toNumber(),
        earnings: formatEther(userInfo.earnings)
      });

      // Fetch matrix info
      const matrixInfo = await contract.getMatrixInfo();
      setMatrixInfo({
        currentLevel: matrixInfo.currentLevel.toNumber(),
        matrixSize: matrixInfo.matrixSize.toNumber(),
        rewards: formatEther(matrixInfo.rewards)
      });

      // Fetch club info
      const clubInfo = await contract.getClubPoolInfo();
      setClubInfo({
        totalMembers: clubInfo.totalMembers.toNumber(),
        poolBalance: formatEther(clubInfo.poolBalance),
        rewards: formatEther(clubInfo.rewards)
      });

      // Fetch system stats
      const stats = await contract.getSystemStats();
      setSystemStats({
        totalUsers: stats.totalUsers.toNumber(),
        totalVolume: formatEther(stats.totalVolume),
        totalRewards: formatEther(stats.totalRewards)
      });

      // Fetch leaderboard
      const leaderboardData = await contract.getLeaderboard();
      setLeaderboard(leaderboardData.map(entry => ({
        user: entry.user,
        earnings: formatEther(entry.earnings),
        referrals: entry.referrals.toNumber()
      })));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.bscTestnet.orphiCrowdFund,
        CONTRACT_ABI,
        provider.getSigner()
      );
      const tx = await contract.withdrawEarnings();
      await tx.wait();
      toast.success('Withdrawal successful!');
      fetchData();
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast.error('Failed to withdraw. Please try again.');
    }
  };

  const handleJoinClub = async () => {
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.bscTestnet.orphiCrowdFund,
        CONTRACT_ABI,
        provider.getSigner()
      );
      const tx = await contract.joinClub();
      await tx.wait();
      toast.success('Successfully joined the club!');
      fetchData();
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('Failed to join club. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Level</p>
              <p className="text-xl font-semibold">{userInfo?.level || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Earnings</p>
              <p className="text-xl font-semibold">{userInfo?.earnings || 0} BNB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Referrer</p>
              <p className="text-xl font-semibold truncate">
                {userInfo?.referrer || 'None'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 mb-2">Your Referral Link:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 p-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast.success('Referral link copied!');
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Copy
              </button>
            </div>
          </div>
        </motion.div>

        {/* Matrix Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Matrix Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Current Level</p>
              <p className="text-xl font-semibold">{matrixInfo?.currentLevel || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Matrix Size</p>
              <p className="text-xl font-semibold">{matrixInfo?.matrixSize || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Matrix Rewards</p>
              <p className="text-xl font-semibold">{matrixInfo?.rewards || 0} BNB</p>
            </div>
          </div>
        </motion.div>

        {/* Club Pool Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Club Pool</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Total Members</p>
              <p className="text-xl font-semibold">{clubInfo?.totalMembers || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Pool Balance</p>
              <p className="text-xl font-semibold">{clubInfo?.poolBalance || 0} BNB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Your Rewards</p>
              <p className="text-xl font-semibold">{clubInfo?.rewards || 0} BNB</p>
            </div>
          </div>
          <button
            onClick={handleJoinClub}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Join Club
          </button>
        </motion.div>

        {/* System Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Total Users</p>
              <p className="text-xl font-semibold">{systemStats?.totalUsers || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Total Volume</p>
              <p className="text-xl font-semibold">{systemStats?.totalVolume || 0} BNB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Total Rewards</p>
              <p className="text-xl font-semibold">{systemStats?.totalRewards || 0} BNB</p>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4">Top Performers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.user}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.user.slice(0, 6)}...{entry.user.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.earnings} BNB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.referrals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Withdraw Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={handleWithdraw}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark text-lg font-semibold"
          >
            Withdraw Earnings
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrphiDashboard; 