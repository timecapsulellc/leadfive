import React, { useState, useEffect, useRef } from 'react';
import OpenAIService from '../../services/OpenAIService';
import ElevenLabsService from '../../services/ElevenLabsService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AIEnhancedDashboard = ({ account, contractData, isConnected }) => {
  const [liveCounter, setLiveCounter] = useState(1247);
  const [timeLeft, setTimeLeft] = useState(85512);
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      message: `Hi ${account ? account.slice(0, 6) : 'there'}! I've analyzed your mood and portfolio. Ready to explore some high-ROI opportunities?`
    }
  ]);
  const [voiceGreeting, setVoiceGreeting] = useState(
    `Welcome to ORPHI, ${account ? account.slice(0, 6) : 'friend'}! AI + Web3 are revolutionizing crowdfunding—and you're at the forefront. Let's turn your ideas into reality!`
  );
  const [dailyJoke, setDailyJoke] = useState("Why did the crypto investor break up with his girlfriend? He needed more *block* time!");

  const chatInputRef = useRef(null);

  // Emotions for mood tracking
  const emotions = [
    { color: 'bg-success-green', mood: 'Happy', message: "Love the energy! Ready to launch your campaign?" },
    { color: 'bg-yellow-500', mood: 'Neutral', message: "Steady as she goes! Your portfolio is looking stable." },
    { color: 'bg-cyber-blue', mood: 'Focused', message: "Great focus! This is when the best decisions are made." },
    { color: 'bg-alert-red', mood: 'Stressed', message: "Rough day? Remember—every crypto success story started with a single click." }
  ];

  // Portfolio chart data
  const portfolioData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [5000, 7200, 6800, 9100, 11500, 12847],
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#B8C5D1'
        },
        grid: {
          color: 'rgba(184, 197, 209, 0.2)'
        }
      },
      y: {
        ticks: {
          color: '#B8C5D1',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(184, 197, 209, 0.2)'
        }
      }
    }
  };

  // Live counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Emotion tracking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmotion(prev => {
        const next = (prev + 1) % emotions.length;
        if (Math.random() > 0.7) {
          setVoiceGreeting(emotions[next].message);
        }
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Voice greeting on mount
  useEffect(() => {
    if (isConnected && account) {
      setTimeout(async () => {
        const userName = account.slice(0, 6);
        const audio = await ElevenLabsService.generateWelcomeGreeting(
          userName, 
          contractData
        );
        if (audio.success) {
          audio.play();
        }
      }, 2000);
    }
  }, [isConnected, account]);

  // Format time for countdown
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  // AI Assistant functions
  const askAI = async () => {
    const userContext = {
      account,
      earnings: contractData?.totalEarnings || '0',
      teamSize: contractData?.teamSize || '0',
      packageLevel: contractData?.packageLevel || '0',
      isRegistered: contractData?.isRegistered || false
    };

    try {
      const response = await OpenAIService.getChatResponse(
        "Give me a motivational insight about my Web3 crowdfunding journey!",
        userContext
      );
      
      setVoiceGreeting(response);
      
      // Generate voice response
      const audio = await ElevenLabsService.generateSpeech(response);
      if (audio.success) {
        audio.play();
      }
    } catch (error) {
      console.error('AI response error:', error);
      const fallback = "You're on the right track! 🚀 The blockchain revolution needs leaders like you. Ready to claim your spot in the top 10%?";
      setVoiceGreeting(fallback);
      
      const audio = await ElevenLabsService.generateSpeech(fallback);
      if (audio.success) {
        audio.play();
      }
    }
  };

  const getNewJoke = async () => {
    try {
      const joke = await OpenAIService.generateJoke();
      setDailyJoke(joke);
      
      // Optionally play the joke as audio
      const audio = await ElevenLabsService.generateSpeech(joke);
      if (audio.success) {
        audio.play();
      }
    } catch (error) {
      console.error('Joke generation error:', error);
      const fallbackJoke = "Why don't crypto traders ever get tired? Because they're always pumped! 🚀";
      setDailyJoke(fallbackJoke);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const input = chatInputRef.current.value.trim();
    if (!input) return;

    // Add user message
    setChatMessages(prev => [...prev, { type: 'user', message: input }]);
    chatInputRef.current.value = '';

    // Get AI response
    setTimeout(async () => {
      try {
        const userContext = {
          account,
          earnings: contractData?.totalEarnings || '0',
          teamSize: contractData?.teamSize || '0',
          packageLevel: contractData?.packageLevel || '0',
          isRegistered: contractData?.isRegistered || false
        };

        const response = await OpenAIService.getChatResponse(input, userContext);
        setChatMessages(prev => [...prev, { type: 'ai', message: response }]);
        
        // Generate voice response for chat
        const audio = await ElevenLabsService.generateSpeech(response);
        if (audio.success) {
          audio.play();
        }
      } catch (error) {
        console.error('Chat AI error:', error);
        const fallback = "Great question! 🚀 Based on current trends, Web3 projects show amazing potential. Ready to explore opportunities?";
        setChatMessages(prev => [...prev, { type: 'ai', message: fallback }]);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-space to-midnight-blue text-white relative overflow-hidden">
      {/* Floating Ethereum Icons */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute animate-bounce" style={{ left: '10%', top: '20%', animationDelay: '0s' }}>
          <i className="fab fa-ethereum text-4xl text-cyber-blue opacity-30"></i>
        </div>
        <div className="absolute animate-bounce" style={{ left: '80%', top: '60%', animationDelay: '2s' }}>
          <i className="fab fa-ethereum text-3xl text-royal-purple opacity-20"></i>
        </div>
        <div className="absolute animate-bounce" style={{ left: '50%', top: '80%', animationDelay: '4s' }}>
          <i className="fab fa-ethereum text-5xl text-success-green opacity-25"></i>
        </div>
      </div>

      {/* Voice Greeting Banner */}
      <div className="container mx-auto mb-8 px-4 pt-8 relative z-10">
        <div className="glass-morphism rounded-2xl p-6 text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyber-blue to-royal-purple flex items-center justify-center mr-4">
              <i className="fas fa-microphone text-white text-2xl animate-pulse"></i>
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-white mb-2">AI Assistant Active</h2>
              <p className="text-silver-mist max-w-2xl">{voiceGreeting}</p>
            </div>
          </div>
          <button 
            onClick={askAI}
            className="btn-gradient-primary px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all"
          >
            <i className="fas fa-comments mr-2"></i>Ask AI Assistant
          </button>
        </div>
      </div>

      {/* FOMO Counter Section */}
      <div className="container mx-auto mb-8 px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-energy-orange to-alert-red rounded-2xl p-6 text-white text-center animate-pulse">
            <div className="text-4xl font-bold mb-2">{liveCounter.toLocaleString()}</div>
            <div className="text-sm opacity-90">Users joined today</div>
            <div className="text-xs mt-2 opacity-75">Don't be #{(liveCounter + 1).toLocaleString()}!</div>
          </div>
          <div className="bg-gradient-to-r from-success-green to-cyan-500 rounded-2xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">$2.8M</div>
            <div className="text-sm opacity-90">Raised this month</div>
            <div className="text-xs mt-2 opacity-75">+127% vs last month</div>
          </div>
          <div className="bg-gradient-to-r from-premium-gold to-energy-orange rounded-2xl p-6 text-white text-center">
            <div className="text-4xl font-bold mb-2">{formatTime(timeLeft)}</div>
            <div className="text-sm opacity-90">Until next tier unlock</div>
            <div className="text-xs mt-2 opacity-75">Limited spots available</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Chart */}
          <div className="glass-morphism rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Your Portfolio Performance</h3>
            <div className="relative h-80 bg-gradient-to-r from-cyber-blue/10 to-royal-purple/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <div className="text-2xl font-bold text-success-green mb-2">$12,847</div>
                <div className="text-sm text-silver-mist">Portfolio Value</div>
                <div className="text-lg text-success-green mt-2">+8.7% (24h)</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-white">
              <div>
                <div className="text-sm text-silver-mist">Total Value</div>
                <div className="text-2xl font-bold text-success-green">$12,847</div>
              </div>
              <div>
                <div className="text-sm text-silver-mist">24h Change</div>
                <div className="text-2xl font-bold text-success-green">+8.7%</div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-morphism rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">AI Market Insights</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-royal-purple to-cyber-blue rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <i className="fas fa-brain text-premium-gold mr-2"></i>
                  <span className="text-white font-semibold">AI Prediction</span>
                </div>
                <p className="text-white text-sm">Your next investment has 94% success probability. The AI recommends "GreenTech Revolution" project.</p>
              </div>
              <div className="bg-gradient-to-r from-success-green to-cyan-500 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <i className="fas fa-trending-up text-premium-gold mr-2"></i>
                  <span className="text-white font-semibold">Hot Opportunity</span>
                </div>
                <p className="text-white text-sm">Top 10% earn $15,000/month. Join the elite tier now - only 23 spots left!</p>
              </div>
              <div className="bg-gradient-to-r from-energy-orange to-alert-red rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <i className="fas fa-fire text-premium-gold mr-2"></i>
                  <span className="text-white font-semibold">Trending Now</span>
                </div>
                <p className="text-white text-sm">AI-powered projects are 340% more successful. Don't miss the revolution!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="glass-morphism rounded-2xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            <i className="fas fa-trophy text-premium-gold mr-2"></i>
            Success Stories (AI Generated Testimonials)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-success-green/20 to-royal-purple/20 border-l-4 border-success-green rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-royal-purple to-energy-orange flex items-center justify-center mr-3">
                  <span className="text-white font-bold">MK</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Mike Thompson</div>
                  <div className="text-success-green text-sm">+$47,000 in 3 months</div>
                </div>
              </div>
              <p className="text-silver-mist text-sm">"The AI predicted my crypto success story started with a single click on ORPHI. Now I'm in the top 5% of earners!"</p>
            </div>
            <div className="bg-gradient-to-r from-success-green/20 to-royal-purple/20 border-l-4 border-success-green rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-blue to-success-green flex items-center justify-center mr-3">
                  <span className="text-white font-bold">SL</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Sarah Lee</div>
                  <div className="text-success-green text-sm">+$23,500 in 6 weeks</div>
                </div>
              </div>
              <p className="text-silver-mist text-sm">"Rough day turned into my best investment decision ever. The emotion-tracking AI knew exactly when to motivate me!"</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-8">
          <button className="btn-gradient-primary px-12 py-4 rounded-full text-xl font-bold hover:scale-105 transition-all mr-4 animate-bounce">
            <i className="fas fa-rocket mr-2"></i>Launch Campaign
          </button>
          <button className="glass-morphism px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all">
            <i className="fas fa-chart-line mr-2"></i>View Analytics
          </button>
        </div>

        {/* Joke of the Day */}
        <div className="glass-morphism rounded-2xl p-6 text-center mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            <i className="fas fa-laugh text-premium-gold mr-2"></i>
            AI Joke of the Day
          </h3>
          <p className="text-silver-mist text-lg italic mb-4">"{dailyJoke}"</p>
          <button 
            onClick={getNewJoke}
            className="bg-gradient-to-r from-royal-purple to-energy-orange px-4 py-2 rounded-lg text-white text-sm hover:scale-105 transition-all"
          >
            Get New Joke
          </button>
        </div>
      </div>

      {/* Emotion Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-3 glass-morphism rounded-full px-4 py-2">
          <div className={`w-4 h-4 rounded-full ${emotions[currentEmotion].color} transition-all duration-500`}></div>
          <span className="text-white text-sm">Mood: {emotions[currentEmotion].mood}</span>
        </div>
      </div>

      {/* AI Assistant Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <div 
          className="glass-morphism rounded-full w-16 h-16 flex items-center justify-center cursor-pointer hover:scale-110 transition-all"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <i className="fas fa-robot text-2xl text-cyber-blue animate-pulse"></i>
        </div>
        
        {chatOpen && (
          <div className="glass-morphism rounded-2xl w-80 h-96 p-4 absolute bottom-20 right-0">
            <h4 className="text-white font-bold mb-4">AI Assistant</h4>
            <div className="h-64 overflow-y-auto mb-4 space-y-2">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`rounded-lg p-3 text-white text-sm ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-cyber-blue to-royal-purple ml-auto max-w-xs'
                      : 'bg-gradient-to-r from-royal-purple to-cyber-blue max-w-xs'
                  }`}
                >
                  {msg.message}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit}>
              <input 
                ref={chatInputRef}
                type="text" 
                placeholder="Ask me anything..." 
                className="w-full bg-white/20 rounded-lg px-3 py-2 text-white placeholder-silver-mist border border-white/30 focus:outline-none focus:border-cyber-blue"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEnhancedDashboard; 