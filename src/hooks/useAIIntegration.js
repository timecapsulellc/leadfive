/**
 * AI INTEGRATION HOOKS FOR LEADFIVE COMPONENTS
 * Practical implementation of AI features in existing pages
 */

import React, { useState } from 'react';
import AIEnhancedFeatures from '../services/AIEnhancedFeatures.js';

export const useAITransactionHelper = () => {
  const explainTransaction = async (txType, params) => {
    try {
      const explanation = await AIEnhancedFeatures.explainTransaction(txType, params);
      return explanation;
    } catch (error) {
      console.error('AI transaction explanation failed:', error);
      return { text: `Processing ${txType} transaction...`, confidence: 'fallback' };
    }
  };

  return { explainTransaction };
};

export const useAINetworkAnalysis = () => {
  const analyzePosition = async (userAddress, treeData) => {
    try {
      const analysis = await AIEnhancedFeatures.analyzeNetworkPosition(userAddress, treeData);
      return analysis;
    } catch (error) {
      console.error('AI network analysis failed:', error);
      return { recommendations: ['Focus on team building'], confidence: 'fallback' };
    }
  };

  return { analyzePosition };
};

export const useAIEarningsPredictor = () => {
  const predictEarnings = async (userData) => {
    try {
      const predictions = await AIEnhancedFeatures.predictEarnings(userData);
      return predictions;
    } catch (error) {
      console.error('AI earnings prediction failed:', error);
      return { predictions: { '30days': { likely: 0, confidence: 'low' } } };
    }
  };

  return { predictEarnings };
};

export const useAICoaching = () => {
  const getCoachingAdvice = async (userMetrics) => {
    try {
      const advice = await AIEnhancedFeatures.generateCoachingAdvice(userMetrics);
      return advice;
    } catch (error) {
      console.error('AI coaching failed:', error);
      return { 
        message: 'Keep building your network!', 
        action: 'Focus on daily activities',
        confidence: 'fallback' 
      };
    }
  };

  const getSmartNotification = async (userData, triggerType) => {
    try {
      const notification = await AIEnhancedFeatures.generateSmartNotification(userData, triggerType);
      return notification;
    } catch (error) {
      console.error('Smart notification failed:', error);
      return { 
        message: 'Check your dashboard for updates!', 
        type: 'general',
        priority: 'low' 
      };
    }
  };

  return { getCoachingAdvice, getSmartNotification };
};

// Add OpenAI and ElevenLabs integration hooks
export const useOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateResponse = async (prompt) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the existing AIEnhancedFeatures service if possible
      if (AIEnhancedFeatures.generateAIResponse) {
        const response = await AIEnhancedFeatures.generateAIResponse(prompt);
        return response;
      }
      
      // Fallback to simulated response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "This is a simulated AI response. Configure your OpenAI API key to get real responses.";
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateResponse, isLoading, error };
};

export const useElevenLabs = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const speak = async (text) => {
    setError(null);
    try {
      // Use the existing AIEnhancedFeatures service if possible
      if (AIEnhancedFeatures.synthesizeSpeech) {
        setIsPlaying(true);
        await AIEnhancedFeatures.synthesizeSpeech(text);
        setIsPlaying(false);
        return;
      }
      
      // Fallback to browser's speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return { speak, stop, isPlaying, error };
};

// ==================== COMPONENT INTEGRATION EXAMPLES ====================

export const AITransactionExamples = {
  // Example for Withdrawals.jsx
  withdrawalExplanation: async (amount, rate, gasFee) => {
    const { explainTransaction } = useAITransactionHelper();
    return await explainTransaction('withdraw', {
      amount,
      withdrawalRate: rate,
      gasFee,
      enableVoice: true
    });
  },

  // Example for Register.jsx
  registrationExplanation: async (packagePrice, referrer) => {
    const { explainTransaction } = useAITransactionHelper();
    return await explainTransaction('register', {
      packagePrice,
      referrer,
      enableVoice: true
    });
  },

  // Example for Packages.jsx
  packageUpgradeExplanation: async (currentLevel, newLevel, cost, roi) => {
    const { explainTransaction } = useAITransactionHelper();
    return await explainTransaction('upgrade', {
      current: currentLevel,
      new: newLevel,
      cost,
      estimatedROI: roi,
      enableVoice: true
    });
  }
};

export const AINetworkExamples = {
  // Example for NetworkTreeVisualization.jsx
  analyzeUserPosition: async (userAddress, networkData) => {
    const { analyzePosition } = useAINetworkAnalysis();
    
    const treeData = {
      directCount: networkData.directReferrals?.length || 0,
      teamSize: networkData.totalTeamSize || 0,
      leftLegVolume: networkData.leftLegVolume || 0,
      rightLegVolume: networkData.rightLegVolume || 0,
      strongLeg: networkData.leftLegVolume > networkData.rightLegVolume ? 'left' : 'right',
      weeklyGrowth: networkData.weeklyGrowthRate || 0,
      currentPackage: networkData.userPackage || 30
    };

    return await analyzePosition(userAddress, treeData);
  }
};

export const AIEarningsExamples = {
  // Example for Dashboard.jsx
  generateEarningsReport: async (userStats) => {
    const { predictEarnings } = useAIEarningsPredictor();
    
    const userData = {
      currentPackage: userStats.packageLevel || 30,
      teamSize: userStats.totalTeam || 0,
      weeklyGrowth: userStats.growthRate || 0,
      monthlyEarnings: userStats.monthlyTotal || 0,
      binaryVolume: userStats.binaryVolume || 0,
      activeReferrals: userStats.activeReferrals || 0,
      accountAge: userStats.daysSinceJoined || 0,
      totalEarnings: userStats.totalEarnings || 0
    };

    return await predictEarnings(userData);
  }
};

export const AICoachingExamples = {
  // Example for Dashboard.jsx coaching panel
  getDailyCoaching: async (userActivity) => {
    const { getCoachingAdvice } = useAICoaching();
    
    const userMetrics = {
      lastActivity: userActivity.daysSinceLastLogin || 0,
      teamGrowth: userActivity.teamGrowthRate || 0,
      totalEarnings: userActivity.totalEarnings || 0,
      loginStreak: userActivity.loginStreak || 0,
      monthlyGoal: userActivity.monthlyGoal || 1000,
      currentPackage: userActivity.packageLevel || 30,
      daysSinceLastReferral: userActivity.daysSinceLastReferral || 0,
      enableVoice: userActivity.voiceEnabled || false
    };

    return await getCoachingAdvice(userMetrics);
  },

  // Example for smart notifications
  checkUpgradeOpportunity: async (userBalance, currentPackage) => {
    const { getSmartNotification } = useAICoaching();
    
    if (userBalance >= currentPackage * 2) {
      const userData = {
        availableFunds: userBalance,
        suggestedPackage: currentPackage * 2,
        earningIncrease: 25 // Estimated increase percentage
      };
      
      return await getSmartNotification(userData, 'upgradeOpportunity');
    }
    
    return null;
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const AIIntegrationUtils = {
  /**
   * Check if AI features should be enabled based on user preferences
   */
  shouldEnableAI: (userPreferences = {}) => {
    return {
      transactionHelp: userPreferences.aiTransactionHelp !== false,
      networkAnalysis: userPreferences.aiNetworkAnalysis !== false,
      earningsPrediction: userPreferences.aiEarningsPrediction !== false,
      personalizedCoaching: userPreferences.aiCoaching !== false,
      voiceSynthesis: userPreferences.voiceEnabled === true,
      smartNotifications: userPreferences.smartNotifications !== false
    };
  },

  /**
   * Format AI responses for UI display
   */
  formatAIResponse: (response, maxLength = 200) => {
    if (!response || !response.text) return '';
    
    const text = response.text.length > maxLength 
      ? response.text.substring(0, maxLength) + '...'
      : response.text;
      
    return {
      ...response,
      displayText: text,
      isAI: response.confidence !== 'fallback',
      timestamp: response.timestamp || new Date().toISOString()
    };
  },

  /**
   * Handle AI service errors gracefully
   */
  handleAIError: (error, fallbackMessage = 'AI service temporarily unavailable') => {
    console.error('AI Integration Error:', error);
    return {
      text: fallbackMessage,
      confidence: 'fallback',
      error: true,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get AI service status for UI indicators
   */
  getAIStatus: () => {
    return AIEnhancedFeatures.getStatus();
  }
};

export default {
  useAITransactionHelper,
  useAINetworkAnalysis,
  useAIEarningsPredictor,
  useAICoaching,
  AITransactionExamples,
  AINetworkExamples,
  AIEarningsExamples,
  AICoachingExamples,
  AIIntegrationUtils,
  useOpenAI,
  useElevenLabs
};
