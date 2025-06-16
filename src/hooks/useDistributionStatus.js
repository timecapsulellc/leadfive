import { useState, useEffect } from 'react';
import Web3Service from '../web3';

/**
 * Hook to fetch and update distribution status for GHP and Leader Bonus
 * @param {object} contract - ethers contract instance
 * @returns {object} status including times and readiness
 */
export function useDistributionStatus(contract) {
  const [status, setStatus] = useState({
    lastGHP: 0,
    lastLeader: 0,
    nextGHP: 0,
    nextLeader: 0,
    ghpReady: false,
    leaderReady: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!contract) return;
    let mounted = true;
    async function fetchStatus() {
      try {
        const result = await contract.getDistributionStatusEnhanced();
        if (!mounted) return;
        setStatus({
          lastGHP: result[0].toNumber(),
          lastLeader: result[1].toNumber(),
          nextGHP: result[2].toNumber(),
          nextLeader: result[3].toNumber(),
          ghpReady: result[4],
          leaderReady: result[5],
          loading: false,
          error: null
        });
      } catch (err) {
        if (!mounted) return;
        setStatus(s => ({ ...s, loading: false, error: err }));
      }
    }
    fetchStatus();
    return () => { mounted = false; };
  }, [contract]);

  return status;
}
