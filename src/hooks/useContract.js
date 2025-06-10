import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ORPHI_CROWDFUND_ABI, ORPHI_CROWDFUND_CONFIG } from '../contracts';

const useContract = (provider) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (provider) {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const contractInstance = new ethers.Contract(
        ORPHI_CROWDFUND_CONFIG.address,
        ORPHI_CROWDFUND_ABI,
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
