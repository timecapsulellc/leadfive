import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { LEAD_FIVE_ABI, LEAD_FIVE_CONFIG } from '../contracts-leadfive.js';

const useContract = provider => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (provider) {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const contractInstance = new ethers.Contract(
        LEAD_FIVE_CONFIG.address,
        LEAD_FIVE_ABI,
        ethersProvider.getSigner()
      );
      setContract(contractInstance);
    } else {
      setContract(null);
    }
  }, [provider]);

  return contract;
};

export default useContract;
