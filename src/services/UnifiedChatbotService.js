import { leadFiveInfo } from '../data/leadFiveInfo';

class UnifiedChatbotService {
  constructor() {
    this.openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    
    // Enhanced Knowledge base from PDF and smart contract
    this.knowledgeBase = {
      platform: {
        name: "LeadFive",
        type: "Decentralized Incentive Platform",
        blockchain: "BSC (Binance Smart Chain)",
        token: "USDT",
        contract: "0x18f7550B5B3e8b6101712D26083B6d1181Ee550a",
        website: "https://leadfive.today",
        description: "LeadFive is a revolutionary blockchain-based incentive platform that leverages smart contracts for transparent and automated reward distribution."
      },
      packages: [
        { id: 1, name: "Starter", price: 15, rewards: "25 USDT per referral", description: "Perfect for beginners to start their journey", benefits: ["Entry level access", "Basic network features", "Community support"] },
        { id: 2, name: "Basic", price: 30, rewards: "50 USDT per referral", description: "Enhanced rewards for serious networkers", benefits: ["Enhanced rewards", "Priority support", "Advanced features"] },
        { id: 3, name: "Premium", price: 50, rewards: "125 USDT per referral", description: "Premium benefits for accelerated growth", benefits: ["Premium rewards", "Advanced analytics", "VIP community access"] },
        { id: 4, name: "Professional", price: 100, rewards: "250 USDT per referral", description: "Professional tools for serious builders", benefits: ["Professional rewards", "Dedicated support", "Exclusive features"] },
        { id: 5, name: "Enterprise", price: 200, rewards: "625 USDT per referral", description: "Maximum benefits for enterprise builders", benefits: ["Maximum rewards", "White glove support", "All features unlocked"] }
      ],
      features: [
        "Smart Contract Security - Audited and verified contracts",
        "Automated Rewards Distribution - Instant payouts",
        "Transparent Blockchain Transactions - Full visibility",
        "5x5 Network Structure - Sustainable growth model",
        "Direct Referral Bonuses - Immediate rewards",
        "Team Building Rewards - Earn from your network",
        "Instant USDT Withdrawals - No waiting periods",
        "Real-time Analytics - Track your progress",
        "Mobile Responsive - Access anywhere",
        "24/7 Smart Contract Operation - Always active"
      ],
      faq: [
        { q: "What is LeadFive?", a: "LeadFive is a decentralized incentive platform built on Binance Smart Chain that enables users to earn rewards through network building and smart contract automation. It's designed for transparency, security, and automated reward distribution." },
        { q: "How do I get started?", a: "Getting started is easy: 1) Connect your BSC-compatible wallet (MetaMask, Trust Wallet, etc.), 2) Choose a package that suits your goals, 3) Complete registration with a referral link if you have one, 4) Start building your network and earning rewards automatically." },
        { q: "Are the rewards guaranteed?", a: "Rewards are programmed into the smart contract and execute automatically when conditions are met. The blockchain ensures transparency and immutability. As long as you meet the network building requirements, rewards are distributed instantly." },
        { q: "What wallet do I need?", a: "You need a BSC-compatible wallet like MetaMask, Trust Wallet, or any Web3 wallet that supports Binance Smart Chain. Make sure you have some BNB for gas fees and USDT for package purchases." },
        { q: "How do withdrawals work?", a: "Withdrawals are instant and automated. Simply go to the Withdrawals page, enter the amount you want to withdraw (minimum 0.01 USDT), and confirm the transaction. The USDT will be sent directly to your wallet." },
        { q: "What is the 5x5 structure?", a: "The 5x5 structure means each member can have up to 5 direct referrals, and the network extends 5 levels deep. This creates a sustainable growth model that rewards both direct referrals and team building." },
        { q: "Is LeadFive secure?", a: "Yes, LeadFive uses audited smart contracts on BSC. All transactions are transparent and recorded on the blockchain. You maintain full control of your funds - they're never held by the platform." },
        { q: "Can I have multiple packages?", a: "Yes, you can activate multiple packages to increase your earning potential. Each package level offers different reward rates and benefits." },
        { q: "How do I track my network?", a: "Use the Genealogy page to view your network in both tree and matrix views. You can see your direct referrals, team size, and network structure in real-time." },
        { q: "What support is available?", a: "We offer multiple support channels: This AI chatbot for instant help, community support through Telegram, comprehensive documentation, and email support for complex issues." }
      ],
      commands: {
        packages: "Show me the available packages",
        features: "What features does LeadFive offer?",
        start: "How do I get started?",
        withdraw: "How do I withdraw my earnings?",
        security: "Is LeadFive secure?",
        network: "How does the network structure work?",
        support: "How can I get help?",
        genealogy: "How do I view my network?",
        referral: "How do referrals work?",
        wallet: "What wallet do I need?"
      }
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
