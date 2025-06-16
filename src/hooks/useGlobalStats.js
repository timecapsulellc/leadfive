import { useState, useEffect } from 'react';

/**
 * Hook to fetch global contract stats: totalUsers, totalVolume, pool balances, etc.
 * @param {object} contract - ethers contract instance
 */
export function useGlobalStats(contract) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolume: 0,
    ghpBalance: 0,
    leaderBonus: 0,
    clubPool: 0,
    freeRegs: 0,
    flexRegs: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!contract) return;
    let mounted = true;
    async function fetchStats() {
      try {
        const result = await contract.getGlobalStats();
        if (!mounted) return;
        setStats({
          totalUsers: result[0].toNumber(),
          totalVolume: result[1].toNumber(),
          ghpBalance: result[2].toNumber(),
          leaderBonus: result[3].toNumber(),
          clubPool: result[4].toNumber(),
          freeRegs: result[5].toNumber(),
          flexRegs: result[6].toNumber(),
          loading: false,
          error: null
        });
      } catch (err) {
        if (!mounted) return;
        setStats(s => ({ ...s, loading: false, error: err }));
      }
    }
    fetchStats();
    return () => { mounted = false; };
  }, [contract]);

  return stats;
}
