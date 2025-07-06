import secureProxy from './api/secureProxy';

class OpenAIService {
  constructor() {
    this.isInitialized = true; // Always initialized with secure proxy
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.maxTokens = parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 500;
    this.useSecureProxy = true;
  }

  // Generate response with context
  async generateResponse(prompt, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);

      const response = await secureProxy.getChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        {
          model: this.model,
          temperature: context.temperature || 0.8,
          max_tokens: this.maxTokens,
        }
      );

      return response.content || this.getFallbackResponse(prompt);
    } catch (error) {
      console.error('Secure API error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  // Get AI response for chat assistant
  async getChatResponse(userMessage, userContext = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(userContext);

      const response = await secureProxy.getChatCompletion(
        [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        {
          model: 'gpt-4o-mini',
          temperature: 0.8,
          max_tokens: 200,
        }
      );

      return response.content || this.getFallbackResponse(userMessage);
    } catch (error) {
      console.error('Secure API error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  // Build system prompt based on user context
  buildSystemPrompt(userContext) {
    const {
      account,
      earnings = '0',
      teamSize = '0',
      packageLevel = '0',
      isRegistered = false,
    } = userContext;

    return `You are LeadFive's AI assistant - a witty, motivational, and FOMO-driven Web3 networking expert.

BRAND PERSONALITY:
- Enthusiastic about blockchain and Web3 innovation
- Uses crypto slang naturally ("diamond hands", "to the moon", "HODL")
- Creates urgency with limited-time opportunities
- Celebrates successes and motivates during challenges
- Developed by LEAD 5 - young blockchain engineers

USER CONTEXT:
- Wallet: ${account && typeof account === 'string' ? account.slice(0, 8) + '...' : 'Not connected'}
- Status: ${isRegistered ? 'Active Investor' : 'Potential Investor'}
- Earnings: $${earnings}
- Team Size: ${teamSize}
- Package Level: ${packageLevel}

RESPONSE STYLE:
- Keep responses under 150 words
- Include relevant emojis (🚀💎🔥⚡💰)
- Mention specific opportunities when relevant
- Use FOMO triggers: "limited spots", "exclusive access", "top 10% earners"
- Reference success stories: "$47K in 3 months", "$23.5K in 6 weeks"
- Always end with a call-to-action

TOPICS TO FOCUS ON:
- Web3 networking opportunities
- Investment strategies and portfolio growth
- Team building and referral rewards
- Blockchain technology education
- Success stories and achievements
- Market insights and predictions

Remember: Be helpful, motivational, and always encourage action while maintaining professionalism.`;
  }

  // Generate dynamic content
  async generateContent(type, context = {}) {
    if (!this.isInitialized) {
      return this.getFallbackContent(type);
    }

    const prompts = {
      successStory: `Generate a realistic success story for LeadFive networking platform. Include:
        - Name (first name + last initial)
        - Earnings amount ($X,XXX format)
        - Timeframe (weeks/months)
        - Brief motivational quote about their experience
        Format: JSON with name, earnings, timeframe, quote`,

      marketInsight: `Generate a Web3 market insight for LeadFive users. Include:
        - Current trend or opportunity
        - Specific percentage or statistic
        - Actionable advice
        Keep it under 100 words, exciting and FOMO-driven.`,

      motivationalMessage: `Generate a motivational message for LeadFive users based on their mood: ${context.mood || 'neutral'}.
        - Address their current emotional state
        - Relate to Web3/crypto success
        - Include a call-to-action
        - Use appropriate emojis
        Keep it under 80 words.`,

      projectDescription: `Generate a compelling networking project description for: ${context.projectType || 'Web3 innovation'}.
        - Exciting title
        - Problem it solves
        - Market opportunity
        - Why members should act now
        Keep it under 150 words, very engaging.`,
    };

    try {
      const response = await secureProxy.getChatCompletion(
        [
          {
            role: 'system',
            content:
              "You are LeadFive's content generation AI. Create engaging, FOMO-driven content for Web3 networking.",
          },
          {
            role: 'user',
            content: prompts[type] || prompts.marketInsight,
          },
        ],
        {
          model: 'gpt-4o-mini',
          temperature: 0.9,
          max_tokens: 250,
        }
      );

      return response.content || this.getFallbackContent(type);
    } catch (error) {
      console.error('Content generation error:', error);
      return this.getFallbackContent(type);
    }
  }

  // Analyze compensation plan PDF content
  async analyzeCompensationPlan(pdfText) {
    if (!this.isInitialized) {
      return {
        summary: 'PDF uploaded successfully. Manual review required.',
        keyPoints: ['Commission structure', 'Bonus tiers', 'Requirements'],
        recommendations: [
          'Review with team',
          'Compare with industry standards',
        ],
      };
    }

    try {
      const response = await secureProxy.getChatCompletion(
        [
          {
            role: 'system',
            content: `You are an expert compensation plan analyzer for LeadFive. Analyze the provided compensation plan and return a JSON response with:
            - summary: Brief overview (max 100 words)
            - keyPoints: Array of 3-5 main features
            - recommendations: Array of 3-4 actionable insights
            - complianceNotes: Any potential regulatory considerations
            Focus on Web3/crypto compliance and transparency.`,
          },
          {
            role: 'user',
            content: `Analyze this compensation plan:\n\n${pdfText.slice(0, 4000)}`,
          },
        ],
        {
          model: 'gpt-4-turbo-preview',
          temperature: 0.3,
          max_tokens: 500,
        }
      );

      try {
        const analysis = JSON.parse(response.content);
        return analysis;
      } catch (parseError) {
        return {
          summary: response.content || 'Analysis completed.',
          keyPoints: ['Commission structure analyzed'],
          recommendations: ['Review with team'],
          complianceNotes: ['Ensure compliance']
        };
      }
    } catch (error) {
      console.error('Compensation plan analysis error:', error);
      return {
        summary:
          'Analysis completed. The plan shows standard network structure with blockchain integration.',
        keyPoints: [
          'Multi-tier commission structure',
          'Blockchain-based transparency',
          'Performance-based bonuses',
          'Team building incentives',
        ],
        recommendations: [
          'Ensure regulatory compliance',
          'Implement clear disclosure policies',
          'Regular performance reviews',
          'Transparent reporting systems',
        ],
        complianceNotes: [
          'Review with legal team',
          'Ensure jurisdiction compliance',
        ],
      };
    }
  }

  // Generate jokes for engagement
  async generateJoke() {
    if (!this.isInitialized) {
      return this.getFallbackJoke();
    }

    try {
      const response = await secureProxy.getChatCompletion(
        [
          {
            role: 'system',
            content:
              'Generate a short, witty joke related to crypto, blockchain, or Web3. Keep it clean and fun!',
          },
          {
            role: 'user',
            content: 'Tell me a crypto joke',
          },
        ],
        {
          model: 'gpt-3.5-turbo',
          temperature: 1.0,
          max_tokens: 100,
        }
      );

      return response.content || this.getFallbackJoke();
    } catch (error) {
      return this.getFallbackJoke();
    }
  }

  // Fallback responses when OpenAI is not available
  getFallbackResponse(userMessage) {
    const fallbacks = [
      'Great question! 🚀 Based on current market trends, Web3 projects are showing 340% better performance. Ready to explore some high-ROI opportunities?',
      'I love your enthusiasm! 💎 The top 10% of LeadFive users earn $15,000/month. Want me to show you the path to join them?',
      "Perfect timing! ⚡ Our AI analysis shows you're in an optimal decision-making state. This could be your breakthrough moment!",
      "That's exactly what successful investors ask! 🔥 With blockchain transparency and smart contracts, the opportunities are endless.",
      'Interesting point! 💰 Did you know 94% of our successful users started with questions just like yours? Your journey begins now!',
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  getFallbackContent(type) {
    const content = {
      successStory: {
        name: 'Alex K.',
        earnings: '$34,500',
        timeframe: '4 months',
        quote:
          "LeadFive's AI-powered insights helped me identify the perfect investment timing!",
      },
      marketInsight:
        '🚀 Web3 networking is up 127% this quarter! AI-powered projects show 340% better success rates. The revolution is here!',
      motivationalMessage:
        'Every crypto success story started with a single click! 💎 Your breakthrough moment is waiting. Ready to join the top 10%?',
      projectDescription:
        'Revolutionary Web3 project combining AI and blockchain for next-generation networking. Limited early access available!',
    };

    return content[type] || content.marketInsight;
  }

  getFallbackJoke() {
    const jokes = [
      "Why don't crypto traders ever get tired? Because they're always pumped! 🚀",
      "What do you call a crypto investor's favorite dance? The Moon Walk! 🌙",
      'Why did the blockchain go to therapy? It had trust issues! 🔗',
      "What's a crypto trader's favorite type of music? Heavy metal... because they love volatile beats! 🎵",
      "Why don't Bitcoin investors ever feel lonely? Because they're always part of a block party! 🎉",
    ];

    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Check if service is ready
  isReady() {
    return true; // Always ready with secure proxy
  }

  // Get service status
  getStatus() {
    return {
      initialized: true,
      hasApiKey: false, // No API key in frontend
      model: 'secure-proxy',
      mode: 'secure',
    };
  }
}

// Export singleton instance
export default new OpenAIService();
