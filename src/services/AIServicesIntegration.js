/**
 * LEADFIVE AI SERVICES INTEGRATION
 * Central hub for all AI agent services and coordination
 */

import CompensationService from './CompensationService.js';
import AIAgentValidator from './AIAgentValidator.js';
import KnowledgeBaseManager from './KnowledgeBaseManager.js';
import SystemMonitor from './SystemMonitor.js';

class AIServicesIntegration {
    constructor() {
        this.services = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing AI Services Integration...');
        
        try {
            // Initialize all services
            this.services.compensation = new CompensationService();
            this.services.validator = new AIAgentValidator();
            this.services.knowledgeBase = new KnowledgeBaseManager();
            this.services.monitor = new SystemMonitor();

            // Set up cross-service communication
            await this.setupIntegrations();
            
            // Start monitoring
            this.services.monitor.startMonitoring(30000); // 30 seconds

            // Embed initial knowledge
            await this.services.knowledgeBase.embedMarketingMaterials();

            this.isInitialized = true;
            console.log('✅ AI Services Integration initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize AI Services Integration:', error);
            throw error;
        }
    }

    async setupIntegrations() {
        // Add alert handlers for monitoring
        this.services.monitor.addAlertHandler(async (alert) => {
            console.log(`🔔 System Alert: ${alert.message}`);
            
            // Auto-resolve low severity alerts after 5 minutes
            if (alert.severity === 'low') {
                setTimeout(() => {
                    this.services.monitor.resolveAlert(alert.id);
                }, 300000); // 5 minutes
            }
        });

        // Set up validator with compensation service
        this.services.validator.compensationService = this.services.compensation;
        this.services.validator.knowledgeBase = this.services.knowledgeBase;

        console.log('🔗 Service integrations configured');
    }

    /**
     * Main entry point for AI agent queries
     */
    async processQuery(query, context = {}) {
        if (!this.isInitialized) {
            throw new Error('AI Services not initialized');
        }

        const startTime = Date.now();
        await this.services.monitor.trackMetric('query_received', 1);

        try {
            console.log(`🤖 Processing AI query: ${JSON.stringify(query).substring(0, 100)}...`);

            // Determine query type and route to appropriate service
            const queryType = this.determineQueryType(query);
            let result;

            switch (queryType) {
                case 'contract':
                    result = await this.handleContractQuery(query, context);
                    break;
                
                case 'compensation':
                    result = await this.handleCompensationQuery(query, context);
                    break;
                
                case 'knowledge':
                    result = await this.handleKnowledgeQuery(query, context);
                    break;
                
                case 'analysis':
                    result = await this.handleAnalysisQuery(query, context);
                    break;
                
                case 'user_action':
                    result = await this.handleUserActionQuery(query, context);
                    break;
                
                default:
                    result = await this.handleGeneralQuery(query, context);
            }

            const responseTime = Date.now() - startTime;
            await this.services.monitor.trackMetric('query_response_time', responseTime);
            await this.services.monitor.trackMetric('query_success', 1);

            return {
                success: true,
                result: result,
                queryType: queryType,
                responseTime: responseTime,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            await this.services.monitor.trackMetric('query_error', 1);
            await this.services.monitor.trackMetric('query_response_time', responseTime);

            console.error('❌ Query processing failed:', error);
            
            return {
                success: false,
                error: error.message,
                responseTime: responseTime,
                timestamp: new Date().toISOString()
            };
        }
    }

    determineQueryType(query) {
        const queryStr = JSON.stringify(query).toLowerCase();
        
        if (queryStr.includes('contract') || queryStr.includes('function') || queryStr.includes('method')) {
            return 'contract';
        }
        
        if (queryStr.includes('compensation') || queryStr.includes('commission') || queryStr.includes('bonus')) {
            return 'compensation';
        }
        
        if (queryStr.includes('register') || queryStr.includes('withdraw') || queryStr.includes('claim')) {
            return 'user_action';
        }
        
        if (queryStr.includes('analyze') || queryStr.includes('report') || queryStr.includes('performance')) {
            return 'analysis';
        }
        
        if (queryStr.includes('how') || queryStr.includes('what') || queryStr.includes('explain')) {
            return 'knowledge';
        }
        
        return 'general';
    }

    async handleContractQuery(query, context) {
        console.log('🔗 Handling contract query...');
        
        const validation = await this.services.validator.validateQuery('contract', query, context);
        
        if (!validation.valid) {
            throw new Error(`Contract query validation failed: ${validation.error}`);
        }

        return {
            type: 'contract_query',
            validation: validation,
            recommendation: this.generateContractRecommendation(validation.result)
        };
    }

    async handleCompensationQuery(query, context) {
        console.log('💰 Handling compensation query...');
        
        const validation = await this.services.validator.validateQuery('compensation', query, context);
        
        if (!validation.valid) {
            throw new Error(`Compensation query validation failed: ${validation.error}`);
        }

        // Get additional context from knowledge base
        const knowledgeContext = await this.services.knowledgeBase.searchKnowledge(
            'compensation plan rules', 
            'business_logic'
        );

        return {
            type: 'compensation_query',
            validation: validation,
            context: knowledgeContext,
            recommendation: this.generateCompensationRecommendation(validation.result)
        };
    }

    async handleKnowledgeQuery(query, context) {
        console.log('🧠 Handling knowledge query...');
        
        const searchQuery = typeof query === 'string' ? query : query.question || query.query;
        const searchResults = await this.services.knowledgeBase.searchKnowledge(searchQuery);
        const contextData = await this.services.knowledgeBase.getContextForQuery(searchQuery);

        return {
            type: 'knowledge_query',
            query: searchQuery,
            results: searchResults,
            context: contextData,
            answer: this.generateKnowledgeAnswer(searchResults, searchQuery)
        };
    }

    async handleAnalysisQuery(query, context) {
        console.log('📊 Handling analysis query...');
        
        const systemHealth = this.services.monitor.getSystemHealth();
        const accuracyMetrics = this.services.validator.getAccuracyMetrics();
        const knowledgeStats = this.services.knowledgeBase.getStats();

        return {
            type: 'analysis_query',
            systemHealth: systemHealth,
            aiAccuracy: accuracyMetrics,
            knowledgeBase: knowledgeStats,
            recommendations: this.generateAnalysisRecommendations(systemHealth, accuracyMetrics)
        };
    }

    async handleUserActionQuery(query, context) {
        console.log('👤 Handling user action query...');
        
        const validation = await this.services.validator.validateQuery('user_action', query, context);
        
        if (!validation.valid) {
            throw new Error(`User action validation failed: ${validation.error}`);
        }

        return {
            type: 'user_action',
            validation: validation,
            guidance: this.generateUserActionGuidance(query, validation.result)
        };
    }

    async handleGeneralQuery(query, context) {
        console.log('❓ Handling general query...');
        
        // Try to find relevant information in knowledge base
        const searchQuery = typeof query === 'string' ? query : JSON.stringify(query);
        const searchResults = await this.services.knowledgeBase.searchKnowledge(searchQuery);

        return {
            type: 'general_query',
            query: searchQuery,
            results: searchResults,
            response: this.generateGeneralResponse(searchResults, searchQuery)
        };
    }

    generateContractRecommendation(validationResult) {
        if (!validationResult || !validationResult.method) {
            return 'Please specify a valid contract method to execute.';
        }

        const method = validationResult.method;
        const recommendations = {
            'getUserInfo': 'This will retrieve complete user information including earnings, referrals, and package details.',
            'getPackageInfo': 'This will show package pricing and bonus rates for the specified level.',
            'getPendingRewards': 'This will display all pending rewards available for claiming.',
            'register': 'This will register a new user. Ensure you have sufficient BNB/USDT for the package price.',
            'withdraw': 'This will withdraw available balance. Check your balance first with getUserInfo.',
            'claimRewards': 'This will claim pending commission rewards. Check pending amounts first.'
        };

        return recommendations[method] || 'Execute this contract method with caution and verify all parameters.';
    }

    generateCompensationRecommendation(validationResult) {
        if (!validationResult || !validationResult.calculation) {
            return 'Please specify a valid compensation calculation type.';
        }

        const calc = validationResult.calculation;
        const recommendations = {
            'direct_commission': 'Direct commissions are earned immediately when your referrals purchase packages.',
            'level_commission': 'Level commissions decrease with each level but provide ongoing passive income.',
            'matrix_spillover': 'Matrix spillovers help distribute new members fairly across your organization.',
            'earnings_cap': 'Monitor your earnings cap to maximize potential before upgrading packages.'
        };

        return recommendations[calc] || 'This compensation calculation helps optimize your earning strategy.';
    }

    generateKnowledgeAnswer(searchResults, query) {
        if (!searchResults || searchResults.length === 0) {
            return `I don't have specific information about "${query}" in my knowledge base. Please refer to the official LeadFive documentation or contact support.`;
        }

        const topResult = searchResults[0];
        const relevantContent = topResult.content.substring(0, 300) + '...';
        
        return `Based on the LeadFive documentation: ${relevantContent}\n\nFor more detailed information, please refer to the complete documentation.`;
    }

    generateAnalysisRecommendations(systemHealth, accuracyMetrics) {
        const recommendations = [];

        if (systemHealth.status !== 'healthy') {
            recommendations.push(`System status is ${systemHealth.status}. Consider investigating the issues: ${systemHealth.issues.join(', ')}`);
        }

        if (parseFloat(accuracyMetrics.accuracyPercentage) < 95) {
            recommendations.push(`AI accuracy is ${accuracyMetrics.accuracyPercentage}%. Consider retraining models or updating validation rules.`);
        }

        if (systemHealth.alerts.unresolved > 0) {
            recommendations.push(`${systemHealth.alerts.unresolved} unresolved alerts require attention.`);
        }

        if (recommendations.length === 0) {
            recommendations.push('System is performing well. Continue monitoring for optimal performance.');
        }

        return recommendations;
    }

    generateUserActionGuidance(query, validationResult) {
        const action = query.action;
        const guidance = {
            'register': 'To register: 1) Connect your wallet, 2) Choose package level, 3) Ensure sufficient funds, 4) Confirm transaction.',
            'withdraw': 'To withdraw: 1) Check available balance, 2) Ensure minimum withdrawal met, 3) Confirm transaction.',
            'claim_rewards': 'To claim rewards: 1) Check pending rewards, 2) Ensure gas fees available, 3) Execute claim transaction.'
        };

        return guidance[action] || 'Follow the standard transaction process: prepare wallet, verify details, execute transaction.';
    }

    generateGeneralResponse(searchResults, query) {
        if (searchResults && searchResults.length > 0) {
            return `I found relevant information about "${query}". The key points are: ${searchResults[0].content.substring(0, 200)}...`;
        }

        return `I don't have specific information about "${query}". For detailed assistance, please:
1. Check the LeadFive documentation
2. Contact support through official channels
3. Review the smart contract details on BSCScan
4. Join the community forums for user discussions`;
    }

    /**
     * Get system status and health information
     */
    getSystemStatus() {
        if (!this.isInitialized) {
            return { status: 'initializing', initialized: false };
        }

        const health = this.services.monitor.getSystemHealth();
        const accuracy = this.services.validator.getAccuracyMetrics();
        const knowledge = this.services.knowledgeBase.getStats();

        return {
            initialized: true,
            systemHealth: health,
            aiAccuracy: accuracy,
            knowledgeBase: knowledge,
            services: {
                compensation: !!this.services.compensation,
                validator: !!this.services.validator,
                knowledgeBase: !!this.services.knowledgeBase,
                monitor: !!this.services.monitor
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Shutdown all services gracefully
     */
    async shutdown() {
        console.log('🛑 Shutting down AI Services Integration...');
        
        try {
            if (this.services.monitor) {
                this.services.monitor.stopMonitoring();
            }

            // Clean up resources
            this.services = {};
            this.isInitialized = false;
            
            console.log('✅ AI Services Integration shut down successfully');
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }
}

// Create singleton instance
const aiServices = new AIServicesIntegration();

export default aiServices;

// Make available globally for easy access in browser
if (typeof window !== 'undefined') {
    window.LeadFiveAI = aiServices;
}
