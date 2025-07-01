/**
 * Enhanced OpenAI Service with Knowledge Base Integration
 * Provides contextually aware responses using Lead Five business knowledge
 */

import { businessKnowledgeBase, knowledgeBaseHelpers } from '../data/knowledgeBase.js';

// Conditional import to prevent build issues
let OpenAI = null;

// Dynamically import OpenAI only when needed
const importOpenAI = async () => {
  if (!OpenAI) {
    try {
      const module = await import('openai');
      OpenAI = module.default || module.OpenAI || module;
    } catch (error) {
      console.warn('OpenAI module not available:', error);
    }
  }
  return OpenAI;
};

class EnhancedOpenAIService {
  constructor() {
    this.openai = null;
    this.isInitialized = false;
    this.apiKey = null;
    this.model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4-turbo-preview";
    this.maxTokens = parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 800;
    this.knowledgeBase = businessKnowledgeBase;
    
    // Auto-initialize if environment variable is available
    this.autoInitialize();
  }

  // Auto-initialize from environment variables
  async autoInitialize() {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envApiKey && envApiKey !== 'sk-your-openai-key-here') {
      await this.initialize(envApiKey);
    }
  }

  // Initialize OpenAI with API key
  async initialize(apiKey) {
    if (!apiKey) {
      console.warn('OpenAI API key not provided');
      return false;
    }

    try {
      const OpenAIClass = await importOpenAI();
      if (!OpenAIClass) {
        console.warn('OpenAI module not available');
        return false;
      }

      this.openai = new OpenAIClass({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      this.apiKey = apiKey;
      this.isInitialized = true;
      console.log('✅ Enhanced OpenAI service with Knowledge Base initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced OpenAI:', error);
      return false;
    }
  }

  // Build enhanced system prompt with knowledge base context
  buildEnhancedSystemPrompt(userContext = {}, relevantKnowledge = []) {
    const basePrompt = `You are an expert AI assistant for Lead Five, a revolutionary digital business platform built on blockchain technology. You have access to comprehensive business knowledge and should provide accurate, helpful responses based on the official platform information.

PLATFORM OVERVIEW:
Lead Five is a cutting-edge digital business platform that uses blockchain technology (BSC network) with smart contracts for transparent, automated compensation. The platform features a level-based compensation system with $50 USDT joining amount and level income extending 10 levels deep.

KEY FEATURES:
- Real-time dashboard with live earnings tracking
- AI-powered business coaching and predictive analytics
- Blockchain integration with smart contract automation
- Military-grade security with audited smart contracts
- Voice assistant integration
- Progressive Web App (PWA) with mobile-first design

COMPENSATION STRUCTURE:
- Level Income System ($5 per registration across 10 levels)
- Joining Amount: $50 USDT 
- Help Pool Bonus: Global pool sharing
- Leadership Rewards: Performance based
- Rank Advancement Bonus: Achievement based
- Maximum Earnings Potential: $153,600

TECHNOLOGY STACK:
- BSC (Binance Smart Chain) Network
- Solidity Smart Contracts
- React.js Frontend
- OpenAI GPT Integration
- ElevenLabs Voice Assistant
- Web3 and MetaMask Integration`;

    // Add specific knowledge base context if available
    if (relevantKnowledge.length > 0) {
      const knowledgeContext = relevantKnowledge.map(item => 
        `${item.title}: ${item.context}`
      ).join('\n\n');
      
      return `${basePrompt}

SPECIFIC CONTEXT FOR THIS QUERY:
${knowledgeContext}

Please provide accurate information based on the above knowledge base. If asked about specific features, compensation details, or technical aspects, refer to the exact information provided above.`;
    }

    return basePrompt;
  }

  // Enhanced chat response with knowledge base integration
  async getEnhancedChatResponse(userMessage, userContext = {}) {
    if (!this.isInitialized) {
      return this.getFallbackResponseWithKnowledge(userMessage);
    }

    try {
      // Search for relevant knowledge based on user message
      const relevantKnowledge = knowledgeBaseHelpers.getChatbotContext(userMessage);
      
      // Build enhanced system prompt with relevant knowledge
      const systemPrompt = this.buildEnhancedSystemPrompt(userContext, relevantKnowledge);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: this.maxTokens,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      return {
        response: response.choices[0].message.content,
        knowledgeUsed: relevantKnowledge,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Enhanced OpenAI API error:', error);
      return this.getFallbackResponseWithKnowledge(userMessage);
    }
  }

  // Get specific business information
  async getBusinessInformation(topic) {
    const relevantSlides = knowledgeBaseHelpers.searchSlides(topic);
    
    if (relevantSlides.length === 0) {
      return {
        response: "I don't have specific information about that topic. Please ask about Lead Five's features, compensation plan, security, or technology stack.",
        knowledgeUsed: [],
        timestamp: new Date().toISOString()
      };
    }

    if (!this.isInitialized) {
      // Return knowledge base information directly if OpenAI is not available
      const directInfo = relevantSlides.map(slide => ({
        title: slide.title,
        info: slide.chatbotContext
      }));

      return {
        response: `Here's what I know about ${topic}:\n\n` + 
                 directInfo.map(item => `**${item.title}**\n${item.info}`).join('\n\n'),
        knowledgeUsed: relevantSlides.map(slide => ({
          title: slide.title,
          context: slide.chatbotContext,
          category: slide.category
        })),
        timestamp: new Date().toISOString()
      };
    }

    const knowledgeContext = relevantSlides.map(slide => slide.chatbotContext).join('\n\n');
    const systemPrompt = `You are a Lead Five business expert. Based on the following official business information, provide a comprehensive and accurate response about ${topic}:

${knowledgeContext}

Please structure your response clearly and provide specific details from the official information above.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Tell me about ${topic} in detail.` }
        ],
        temperature: 0.5,
        max_tokens: this.maxTokens
      });

      return {
        response: response.choices[0].message.content,
        knowledgeUsed: relevantSlides.map(slide => ({
          title: slide.title,
          context: slide.chatbotContext,
          category: slide.category
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting business information:', error);
      return this.getFallbackResponseWithKnowledge(topic);
    }
  }

  // Fallback response with knowledge base integration
  getFallbackResponseWithKnowledge(query) {
    const relevantKnowledge = knowledgeBaseHelpers.getChatbotContext(query);
    
    if (relevantKnowledge.length > 0) {
      const response = relevantKnowledge.map(item => 
        `**${item.title}**\n${item.context}`
      ).join('\n\n');
      
      return {
        response: `Based on Lead Five's official business information:\n\n${response}`,
        knowledgeUsed: relevantKnowledge,
        timestamp: new Date().toISOString()
      };
    }

    return {
      response: "I'm here to help you with information about Lead Five! You can ask me about our platform features, compensation plan, security measures, technology stack, or any other business-related questions.",
      knowledgeUsed: [],
      timestamp: new Date().toISOString()
    };
  }

  // Get knowledge base statistics
  getKnowledgeBaseStats() {
    return {
      totalSlides: this.knowledgeBase.slides.length,
      categories: Object.keys(this.knowledgeBase.categories),
      lastUpdated: this.knowledgeBase.metadata.lastUpdated,
      version: this.knowledgeBase.metadata.version
    };
  }

  // Search knowledge base directly
  searchKnowledgeBase(query) {
    return knowledgeBaseHelpers.searchSlides(query);
  }

  // Get category information
  getCategoryInfo(category) {
    return knowledgeBaseHelpers.getSlidesByCategory(category);
  }
}

export default new EnhancedOpenAIService();
