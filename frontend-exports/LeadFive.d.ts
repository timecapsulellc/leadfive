/**
 * LeadFive Smart Contract TypeScript Definitions
 * Auto-generated for frontend integration
 */

export interface LeadFiveConfig {
    address: string;
    abi: any[];
    network: {
        chainId: number;
        name: string;
        rpcUrl: string;
        explorerUrl: string;
    };
    tokens: {
        usdt: string;
    };
    admin: {
        owner: string;
        feeRecipient: string;
        rootAdmin: string;
    };
}

export declare const LEADFIVE_CONTRACT_ADDRESS: string;
export declare const USDT_CONTRACT_ADDRESS: string;
export declare const NETWORK_CHAIN_ID: number;
export declare const NETWORK_NAME: string;
export declare const RPC_URL: string;
export declare const EXPLORER_URL: string;
export declare const LEADFIVE_ABI: any[];
export declare const CONTRACT_CONFIG: LeadFiveConfig;

export default CONTRACT_CONFIG;
