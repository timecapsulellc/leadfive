/**
 * LEADFIVE AI KNOWLEDGE BASE MANAGER
 * Handles PDF embedding, retrieval, and AI model training
 */

import { APP_CONFIG } from '../config/app.js';

class KnowledgeBaseManager {
    constructor() {
        // Singleton pattern
        if (KnowledgeBaseManager.instance) {
            return KnowledgeBaseManager.instance;
        }
        
        this.documents = [];
        this.embeddings = null;
        this.vectorStore = null;
        this.isEmbedded = false;
        
        KnowledgeBaseManager.instance = this;
        this.init();
    }

    async init() {
        console.log('🧠 Initializing AI Knowledge Base Manager...');
        try {
            // Initialize with local storage for now
            this.loadExistingKnowledge();
            console.log('✅ Knowledge base manager initialized');
        } catch (error) {
            console.error('❌ Failed to initialize knowledge base:', error);
        }
    }

    /**
     * Embed marketing PDF and contract documentation
     */
    async embedMarketingMaterials() {
        if (this.isEmbedded) {
            console.log('📄 Marketing materials already embedded, skipping...');
            return;
        }
        
        console.log('📄 Embedding marketing materials and contract documentation...');
        
        try {
            // Simulated PDF content extraction (in production, use PDF parsing library)
            const marketingContent = {
                title: 'LEAD FIVE Presentation',
                content: await this.extractPDFContent(),
                metadata: {
                    source: 'LEAD_FIVE_presentation.pdf',
                    type: 'marketing_material',
                    timestamp: new Date().toISOString(),
                    contract_address: APP_CONFIG.contract.address,
                    network: APP_CONFIG.contract.network.name
                }
            };

            // Contract documentation
            const contractContent = {
                title: 'Smart Contract Documentation',
                content: this.getContractDocumentation(),
                metadata: {
                    source: 'smart_contract_abi',
                    type: 'technical_documentation',
                    timestamp: new Date().toISOString(),
                    contract_address: APP_CONFIG.contract.address
                }
            };

            // Compensation plan documentation
            const compensationContent = {
                title: 'Compensation Plan Rules',
                content: this.getCompensationRules(),
                metadata: {
                    source: 'compensation_rules',
                    type: 'business_logic',
                    timestamp: new Date().toISOString()
                }
            };

            this.documents.push(marketingContent, contractContent, compensationContent);
            await this.indexDocuments();
            
            this.isEmbedded = true;
            console.log('✅ Marketing materials embedded successfully');
            return { success: true, documentsCount: this.documents.length };
        } catch (error) {
            console.error('❌ Failed to embed marketing materials:', error);
            return { success: false, error: error.message };
        }
    }

    async extractPDFContent() {
        // In production, this would use a PDF parsing library
        return `
        LEAD FIVE: The Decentralized Incentive Platform

        BUSINESS MODEL:
        - Multi-level marketing (MLM) structure with 4 package levels
        - Direct referral bonuses: 20% for level 1, decreasing by level
        - Matrix spillover system for fair distribution
        - Pool-based rewards: Leader Pool, Help Pool, Club Pool
        - Smart contract automation for transparency

        PACKAGE LEVELS:
        - Level 1: Basic package with fundamental features
        - Level 2: Intermediate package with enhanced benefits
        - Level 3: Advanced package with premium features
        - Level 4: Elite package with maximum earning potential

        COMPENSATION STRUCTURE:
        - Direct Referral Commission: 20% of package price
        - Level Commissions: Decreasing percentages per level
        - Matrix Bonuses: Spillover system ensuring fair distribution
        - Pool Distributions: Shared rewards from platform success
        - Rank Advancement: Increased earning potential with higher ranks

        TECHNOLOGY STACK:
        - Smart Contract: BSC Mainnet (0x29dcCb502D10C042BcC6a02a7762C49595A9E498)
        - Frontend: React + Vite + Web3 integration
        - Payment Methods: BNB and USDT accepted
        - Security: Audited smart contracts with emergency controls

        TARGET MARKET:
        - Network marketing professionals
        - Cryptocurrency enthusiasts
        - Income opportunity seekers
        - Blockchain technology adopters
        `;
    }

    getContractDocumentation() {
        return `
        LEADFIVE SMART CONTRACT DOCUMENTATION

        CONTRACT ADDRESS: ${APP_CONFIG.contract.address}
        NETWORK: ${APP_CONFIG.contract.network.name} (Chain ID: ${APP_CONFIG.contract.network.chainId})
        
        CORE FUNCTIONS:
        
        1. USER REGISTRATION:
           - register(address referrer, uint8 packageLevel, bool useUSDT)
           - Registers new users with referrer and package selection
           - Accepts BNB or USDT payments
           - Validates package levels (1-4)
        
        2. USER INFORMATION:
           - getUserInfo(address user) returns user data structure
           - Includes earnings, referrals, rank, package level
           - Real-time balance and pending rewards
        
        3. REWARDS AND WITHDRAWALS:
           - withdraw() - Withdraw available balance
           - claimRewards() - Claim pending commission rewards
           - getPendingRewards(address user) - Check available rewards
        
        4. PACKAGE SYSTEM:
           - getPackageInfo(uint8 level) - Get package details and pricing
           - Four levels with increasing benefits and costs
           - Dynamic pricing and bonus structures
        
        5. POOL DISTRIBUTIONS:
           - getPoolBalances() - Check pool funds
           - triggerPoolDistributions() - Admin function for pool payouts
           - Leader, Help, and Club pools for community rewards
        
        6. ADMIN FUNCTIONS:
           - setAdminFeeRecipient(address) - Set fee collection address
           - blacklistUser(address, bool) - User management
           - pause()/unpause() - Emergency controls
           - setCircuitBreakerThreshold(uint256) - Security limits
        
        SECURITY FEATURES:
        - Reentrancy protection on all critical functions
        - Circuit breaker for large withdrawals
        - Emergency pause functionality
        - Admin blacklist capabilities
        - Upgradeable proxy pattern for maintenance
        `;
    }

    getCompensationRules() {
        return `
        LEADFIVE COMPENSATION PLAN RULES

        DIRECT REFERRAL COMMISSION:
        - Level 1: 20% of package price
        - Level 2: 15% of package price  
        - Level 3: 12% of package price
        - Level 4: 10% of package price
        
        LEVEL COMMISSIONS:
        - 1st Level: 20% of direct referral earnings
        - 2nd Level: 10% of 1st level earnings
        - 3rd Level: 5% of 2nd level earnings
        - 4th Level: 3% of 3rd level earnings
        - 5th Level: 2% of 4th level earnings
        
        MATRIX SYSTEM:
        - 3x3 Matrix structure
        - Spillover system for fair distribution
        - Position cycling for continuous earning
        - Matrix completion bonuses
        
        POOL DISTRIBUTIONS:
        - Leader Pool: 2% of all transactions
        - Help Pool: 1% of all transactions
        - Club Pool: 1% of all transactions
        - Monthly distribution to qualified members
        
        EARNING CAPS:
        - Level 1: 3x package investment
        - Level 2: 4x package investment
        - Level 3: 5x package investment
        - Level 4: 6x package investment
        
        RANK ADVANCEMENT:
        - Ranks based on personal volume and team performance
        - Higher ranks unlock increased earning potential
        - Leadership bonuses for top performers
        
        WITHDRAWAL RULES:
        - Daily withdrawal limits based on package level
        - Minimum withdrawal amounts apply
        - Processing fees may apply
        - Real-time balance updates
        `;
    }

    async indexDocuments() {
        console.log('🔍 Indexing documents for AI retrieval...');
        
        // In production, this would use vector embeddings
        this.documents.forEach((doc, index) => {
            doc.id = index;
            doc.searchable = doc.content.toLowerCase();
        });
        
        // Save to local storage for persistence
        localStorage.setItem('leadfive_knowledge_base', JSON.stringify(this.documents));
        console.log(`✅ Indexed ${this.documents.length} documents`);
    }

    loadExistingKnowledge() {
        try {
            const stored = localStorage.getItem('leadfive_knowledge_base');
            if (stored) {
                this.documents = JSON.parse(stored);
                console.log(`📚 Loaded ${this.documents.length} existing documents`);
            }
        } catch (error) {
            console.log('📚 No existing knowledge base found, starting fresh');
        }
    }

    /**
     * Search knowledge base for relevant information
     */
    async searchKnowledge(query, type = null) {
        console.log(`🔍 Searching knowledge base for: "${query}"`);
        
        const queryLower = query.toLowerCase();
        const results = this.documents.filter(doc => {
            const matchesContent = doc.searchable.includes(queryLower);
            const matchesType = !type || doc.metadata.type === type;
            return matchesContent && matchesType;
        });

        // Score results by relevance
        const scoredResults = results.map(doc => {
            const contentMatches = (doc.searchable.match(new RegExp(queryLower, 'g')) || []).length;
            const titleMatches = doc.title.toLowerCase().includes(queryLower) ? 10 : 0;
            
            return {
                ...doc,
                relevanceScore: contentMatches + titleMatches
            };
        });

        // Sort by relevance and return top results
        const sortedResults = scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        console.log(`✅ Found ${sortedResults.length} relevant documents`);
        return sortedResults.slice(0, 5); // Return top 5 results
    }

    /**
     * Get context for AI queries
     */
    async getContextForQuery(query) {
        const results = await this.searchKnowledge(query);
        
        const context = results.map(doc => ({
            source: doc.metadata.source,
            type: doc.metadata.type,
            relevantContent: this.extractRelevantContent(doc.content, query),
            timestamp: doc.metadata.timestamp
        }));

        return {
            query: query,
            contextDocuments: context,
            totalRelevantDocs: results.length,
            timestamp: new Date().toISOString()
        };
    }

    extractRelevantContent(content, query, maxLength = 500) {
        const queryWords = query.toLowerCase().split(' ');
        const sentences = content.split('.');
        
        // Find sentences containing query words
        const relevantSentences = sentences.filter(sentence => {
            const sentenceLower = sentence.toLowerCase();
            return queryWords.some(word => sentenceLower.includes(word));
        });

        // Join and truncate if necessary
        let relevantContent = relevantSentences.join('. ').trim();
        if (relevantContent.length > maxLength) {
            relevantContent = relevantContent.substring(0, maxLength) + '...';
        }

        return relevantContent || content.substring(0, maxLength) + '...';
    }

    /**
     * Update knowledge base with new information
     */
    async updateKnowledge(title, content, metadata) {
        const newDocument = {
            title: title,
            content: content,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                updated: true
            },
            searchable: content.toLowerCase()
        };

        this.documents.push(newDocument);
        await this.indexDocuments();
        
        console.log(`✅ Added new knowledge: ${title}`);
        return { success: true, documentId: this.documents.length - 1 };
    }

    /**
     * Get knowledge base statistics
     */
    getStats() {
        const stats = {
            totalDocuments: this.documents.length,
            documentTypes: {},
            lastUpdated: null,
            size: JSON.stringify(this.documents).length
        };

        this.documents.forEach(doc => {
            const type = doc.metadata.type;
            stats.documentTypes[type] = (stats.documentTypes[type] || 0) + 1;
            
            if (!stats.lastUpdated || doc.metadata.timestamp > stats.lastUpdated) {
                stats.lastUpdated = doc.metadata.timestamp;
            }
        });

        return stats;
    }
}

export default KnowledgeBaseManager;
