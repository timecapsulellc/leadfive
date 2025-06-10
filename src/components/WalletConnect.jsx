import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const WalletConnect = () => {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Button
      variant="contained"
      color={account ? 'success' : 'primary'}
      onClick={account ? disconnectWallet : connectWallet}
      disabled={isConnecting}
      startIcon={<AccountBalanceWalletIcon />}
      sx={{
        borderRadius: '20px',
        textTransform: 'none',
        px: 3,
        py: 1,
      }}
    >
      {isConnecting
        ? 'Connecting...'
        : account
        ? formatAddress(account)
        : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnect; 