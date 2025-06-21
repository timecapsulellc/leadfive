import { leadFiveInfo } from '../data/leadFiveInfo';

class UnifiedChatbotService {
  constructor() {
    this.openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    
    // Knowledge base from PDF and smart contract
    this.knowledgeBase = {
      platform: {
        name: "LeadFive",
        type: "Decentralized Incentive Platform",
        blockchain: "BSC (Binance Smart Chain)",
        token: "USDT",
        contract: "0x18f7550B5B3e8b6101712D26083B6d1181Ee550a"
      },
      packages: [
        { name: "Starter", price: 15, rewards: "25 USDT per referral" },
        { name: "Basic", price: 30, rewards: "50 USDT per referral" },
        { name: "Premium", price: 50, rewards: "125 USDT per referral" },
        { name: "Professional", price: 100, rewards: "250 USDT per referral" },
        { name: "Enterprise", price: 200, rewards: "625 USDT per referral" }
      ],
      features: [
        "Smart Contract Security",
        "Automated Rewards Distribution",
        "Transparent Blockchain Transactions",
        "5x5 Network Structure",
        "Direct Referral Bonuses",
        "Team Building Rewards",
        "Instant USDT Withdrawals"
      ],
      faq: [
        {
          q: "What is LeadFive?",
          a: "LeadFive is a decentralized incentive platform built on Binance Smart Chain that enables users to earn rewards through network building and smart contract automation."
        },
        {
          q: "How do I get started?",
          a: "Connect your BSC wallet, choose a package that suits your goals, and start building your network. Rewards are automatically distributed via smart contracts."
        },
        {
          q: "Are the rewards guaranteed?",
          a: "Rewards are programmed into the smart contract and execute automatically when conditions are met. The blockchain ensures transparency and immutability."
        },
        {
          q: "What wallet do I need?",
          a: "You need a BSC-compatible wallet like MetaMask, Trust Wallet, or any Web3 wallet that supports Binance Smart Chain."
        }
      ]
    };
  }

  // Generate contextual response based on knowledge base
  async generateResponse(query) {
    try {
      const context = this.findRelevantContext(query);
      
      if (!this.openAIKey) {
        // Fallback to local knowledge base
        return this.generateLocalResponse(query, context);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant for LeadFive, a decentralized incentive platform. 
                       Use this context to answer questions: ${JSON.stringify(context)}
                       Always be professional, accurate, and helpful.`
            },
            { role: 'user', content: query }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API error');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateLocalResponse(query, this.findRelevantContext(query));
    }
  }

  // Find relevant context from knowledge base
  findRelevantContext(query) {
    const lowerQuery = query.toLowerCase();
    let context = { ...this.knowledgeBase.platform };

    // Check for package-related queries
    if (lowerQuery.includes('package') || lowerQuery.includes('price') || lowerQuery.includes('cost')) {
      context.packages = this.knowledgeBase.packages;
    }

    // Check for feature-related queries
    if (lowerQuery.includes('feature') || lowerQuery.includes('benefit') || lowerQuery.includes('how')) {
      context.features = this.knowledgeBase.features;
    }

    // Check FAQ
    const relevantFaq = this.knowledgeBase.faq.filter(item => 
      item.q.toLowerCase().includes(lowerQuery) || 
      item.a.toLowerCase().includes(lowerQuery)
    );
    if (relevantFaq.length > 0) {
      context.faq = relevantFaq;
    }

    return context;
  }

  // Generate response from local knowledge base
  generateLocalResponse(query, context) {
    const lowerQuery = query.toLowerCase();

    // Check FAQs first
    if (context.faq && context.faq.length > 0) {
      return context.faq[0].a;
    }

    // Package queries
    if (lowerQuery.includes('package') || lowerQuery.includes('price')) {
      const packages = context.packages || this.knowledgeBase.packages;
      return `LeadFive offers ${packages.length} packages:\n${packages.map(p => 
        `• ${p.name}: ${p.price} USDT - ${p.rewards}`
      ).join('\n')}`;
    }

    // Feature queries
    if (lowerQuery.includes('feature') || lowerQuery.includes('what can')) {
      const features = context.features || this.knowledgeBase.features;
      return `LeadFive features include:\n${features.map(f => `• ${f}`).join('\n')}`;
    }

    // Getting started
    if (lowerQuery.includes('start') || lowerQuery.includes('begin') || lowerQuery.includes('how')) {
      return "To get started with LeadFive:\n1. Connect your BSC wallet\n2. Choose a package\n3. Start building your network\n4. Earn automated rewards";
    }

    // Default response
    return `LeadFive is a decentralized incentive platform on BSC. You can earn rewards through our smart contract system. 
            Would you like to know about our packages, features, or how to get started?`;
  }

  // Convert text to speech using ElevenLabs
  async textToSpeech(text) {
    try {
      if (!this.elevenLabsKey) {
        console.warn('ElevenLabs API key not configured');
        return null;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error('ElevenLabs API error');
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error converting text to speech:', error);
      return null;
    }
  }

  // Speech to text using Web Speech API
  async speechToText() {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
    });
  }
}

export default new UnifiedChatbotService();
