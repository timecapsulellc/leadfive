// Conditional import to prevent build issues
let OpenAI = null;

// Dynamically import OpenAI only when needed
const importOpenAI = async () => {
  if (!OpenAI) {
    try {
      // Use dynamic import to prevent build issues
      const module = await import('openai');
      OpenAI = module.default || module.OpenAI || module;
    } catch (error) {
      console.warn('OpenAI module not available:', error);
    }
  }
  return OpenAI;
};

class OpenAIService {
  constructor() {
    this.openai = null;
    this.isInitialized = false;
    this.apiKey = null;
    this.model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4-turbo-preview";
    this.maxTokens = parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 500;
    
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
        dangerouslyAllowBrowser: true // For client-side usage
      });
      this.apiKey = apiKey;
      this.isInitialized = true;
      console.log('✅ OpenAI service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error);
      return false;
    }
  }

  // Generate response with context
  async generateResponse(prompt, context = {}) {
    if (!this.isInitialized) {
      return this.getFallbackResponse(prompt);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: context.temperature || 0.8,
        max_tokens: this.maxTokens,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  // Get AI response for chat assistant
  async getChatResponse(userMessage, userContext = {}) {
    if (!this.isInitialized) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(userContext);
      
      // Add question analysis to help AI understand context
      const enhancedMessage = `Question: ${userMessage}

Please provide a specific, contextual response based on the exact topic asked about. Do not give generic answers.`;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: enhancedMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
        stop: ["\n\nUser:", "User:", "Human:", "Question:"] // Prevent echoing user input
      });

      let responseContent = response.choices[0].message.content.trim();
      
      // Remove any accidental user input echoing
      const echoPatterns = [
        new RegExp(`Question:\\s*${userMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
        new RegExp(`${userMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\?`, 'gi'),
        /^(User|Human|Question):\s*/gi,
        /^\s*".*?"\s*$/gi // Remove quotes if the entire response is quoted
      ];
      
      echoPatterns.forEach(pattern => {
        responseContent = responseContent.replace(pattern, '').trim();
      });
      
      // Ensure response doesn't start with user's question
      if (responseContent.toLowerCase().startsWith(userMessage.toLowerCase().substring(0, 20))) {
        responseContent = responseContent.substring(userMessage.length).trim();
      }
      
      // Fallback if response is empty or too short after cleaning
      if (!responseContent || responseContent.length < 10) {
        return this.getContextualFallback(userMessage, userContext);
      }

      return responseContent;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getContextualFallback(userMessage, userContext);
    }
  }

  // Contextual fallback based on question topic
  getContextualFallback(userMessage, userContext = {}) {
    const lowerMessage = userMessage.toLowerCase();
    const { earnings = '0', teamSize = '0', packageLevel = '1' } = userContext;
    
    if (lowerMessage.includes('package')) {
      return `LeadFive offers multiple package levels, each with increasing benefits! 📦 Package 1 starts at $50 with 2% commissions, while higher packages offer up to 15% commissions and exclusive features. Your current Level ${packageLevel} gives you access to specific tools and earning potential. Consider upgrading to unlock higher commission rates and advanced features! 🚀`;
    }
    
    if (lowerMessage.includes('earning') || lowerMessage.includes('income')) {
      return `Based on your current earnings of $${earnings}, let's optimize your income strategy! 💰 Focus on building your team of ${teamSize} members through quality referrals. Active team members typically generate 3x more than inactive ones. Consider reinvesting 20% of earnings for compound growth! 📈`;
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('referral')) {
      return `Your team of ${teamSize} members has great potential! 👥 Focus on supporting your direct referrals with weekly check-ins and success strategies. Host team calls, share resources, and provide guidance. Quality over quantity - one active referral is worth more than five inactive ones! 🎯`;
    }
    
    if (lowerMessage.includes('withdraw')) {
      return `For withdrawals, ensure you meet the minimum threshold and have completed KYC verification! 💳 Timing matters - most successful members withdraw 70% and reinvest 30% for compound growth. Check your dashboard for available balance and withdrawal options! ⚡`;
    }
    
    return `I'm here to help with your LeadFive journey! 🤖 Whether you need advice on packages, earnings optimization, team building, or platform features, I can provide personalized guidance based on your current performance. What specific aspect would you like to explore? 🚀`;
  }

  // Build system prompt based on user context
  buildSystemPrompt(userContext) {
    const { 
      account, 
      earnings = '0', 
      teamSize = '0', 
      packageLevel = '0',
      isRegistered = false 
    } = userContext;

    return `You are LeadFive's AI assistant - a professional, helpful blockchain and Web3 business expert.

CRITICAL INSTRUCTIONS:
- Provide specific, contextual answers based on the user's exact question
- NEVER repeat or echo the user's question
- NEVER give generic responses - tailor each answer to the specific topic asked
- Analyze the question topic and provide relevant, specific information
- Give concise, actionable advice (under 150 words)

RESPONSE GUIDELINES BY TOPIC:
- PACKAGES: Explain specific package benefits, levels, costs, ROI potential
- EARNINGS: Analyze current performance, suggest improvement strategies
- TEAM: Provide team building tactics, leadership advice, growth strategies
- WITHDRAWALS: Explain withdrawal process, timing, requirements, tax considerations
- PLATFORM: Detail specific features, how to use them, benefits
- STRATEGY: Give personalized action plans based on user's current status
- GENERAL: Provide helpful guidance related to the specific question asked

USER CONTEXT:
- Wallet: ${account ? account.slice(0, 8) + '...' : 'Not connected'}
- Status: ${isRegistered ? 'Active Member' : 'Potential Member'}
- Current Earnings: $${earnings}
- Team Size: ${teamSize} members
- Package Level: ${packageLevel}

RESPONSE STYLE:
- Be specific and directly answer what was asked
- Include relevant emojis (🚀💎🔥⚡💰📊🎯)
- Reference user's actual stats when relevant
- Provide actionable next steps
- Keep professional yet engaging tone

EXAMPLE RESPONSES:
- If asked about packages: Detail specific package levels, costs, benefits, ROI
- If asked about earnings: Analyze their $${earnings}, suggest growth strategies
- If asked about team: Give specific advice for their ${teamSize} member team
- If asked about withdrawals: Explain process, minimums, timing, requirements

Remember: Always provide specific, contextual answers that directly address the user's question.`;
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
        Keep it under 150 words, very engaging.`
    };

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are LeadFive's content generation AI. Create engaging, FOMO-driven content for Web3 networking."
          },
          {
            role: "user",
            content: prompts[type] || prompts.marketInsight
          }
        ],
        temperature: 0.9,
        max_tokens: 250
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Content generation error:', error);
      return this.getFallbackContent(type);
    }
  }

  // Analyze compensation plan PDF content
  async analyzeCompensationPlan(pdfText) {
    if (!this.isInitialized) {
      return {
        summary: "PDF uploaded successfully. Manual review required.",
        keyPoints: ["Commission structure", "Bonus tiers", "Requirements"],
        recommendations: ["Review with team", "Compare with industry standards"]
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert compensation plan analyzer for LeadFive. Analyze the provided compensation plan and return a JSON response with:
            - summary: Brief overview (max 100 words)
            - keyPoints: Array of 3-5 main features
            - recommendations: Array of 3-4 actionable insights
            - complianceNotes: Any potential regulatory considerations
            Focus on Web3/crypto compliance and transparency.`
          },
          {
            role: "user",
            content: `Analyze this compensation plan:\n\n${pdfText.slice(0, 4000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Compensation plan analysis error:', error);
      return {
        summary: "Analysis completed. The plan shows standard network structure with blockchain integration.",
        keyPoints: [
          "Multi-tier commission structure",
          "Blockchain-based transparency",
          "Performance-based bonuses",
          "Team building incentives"
        ],
        recommendations: [
          "Ensure regulatory compliance",
          "Implement clear disclosure policies",
          "Regular performance reviews",
          "Transparent reporting systems"
        ],
        complianceNotes: ["Review with legal team", "Ensure jurisdiction compliance"]
      };
    }
  }

  // Generate jokes for engagement
  async generateJoke() {
    if (!this.isInitialized) {
      return this.getFallbackJoke();
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Generate a short, witty joke related to crypto, blockchain, or Web3. Keep it clean and fun!"
          },
          {
            role: "user",
            content: "Tell me a crypto joke"
          }
        ],
        temperature: 1.0,
        max_tokens: 100
      });

      return response.choices[0].message.content;
    } catch (error) {
      return this.getFallbackJoke();
    }
  }

  // Fallback responses when OpenAI is not available
  getFallbackResponse(userMessage) {
    const fallbacks = [
      "Great question! 🚀 Based on current market trends, Web3 projects are showing 340% better performance. Ready to explore some high-ROI opportunities?",
      "I love your enthusiasm! 💎 The top 10% of LeadFive users earn $15,000/month. Want me to show you the path to join them?",
      "Perfect timing! ⚡ Our AI analysis shows you're in an optimal decision-making state. This could be your breakthrough moment!",
      "That's exactly what successful investors ask! 🔥 With blockchain transparency and smart contracts, the opportunities are endless.",
      "Interesting point! 💰 Did you know 94% of our successful users started with questions just like yours? Your journey begins now!"
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  getFallbackContent(type) {
    const content = {
      successStory: {
        name: "Alex K.",
        earnings: "$34,500",
        timeframe: "4 months",
        quote: "LeadFive's AI-powered insights helped me identify the perfect investment timing!"
      },
      marketInsight: "🚀 Web3 networking is up 127% this quarter! AI-powered projects show 340% better success rates. The revolution is here!",
      motivationalMessage: "Every crypto success story started with a single click! 💎 Your breakthrough moment is waiting. Ready to join the top 10%?",
      projectDescription: "Revolutionary Web3 project combining AI and blockchain for next-generation networking. Limited early access available!"
    };

    return content[type] || content.marketInsight;
  }

  getFallbackJoke() {
    const jokes = [
      "Why don't crypto traders ever get tired? Because they're always pumped! 🚀",
      "What do you call a crypto investor's favorite dance? The Moon Walk! 🌙",
      "Why did the blockchain go to therapy? It had trust issues! 🔗",
      "What's a crypto trader's favorite type of music? Heavy metal... because they love volatile beats! 🎵",
      "Why don't Bitcoin investors ever feel lonely? Because they're always part of a block party! 🎉"
    ];

    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized;
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!this.apiKey,
      model: this.isInitialized ? "gpt-4-turbo-preview" : "fallback"
    };
  }
}

// Export singleton instance
export default new OpenAIService();
