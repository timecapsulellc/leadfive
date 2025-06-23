import React, { useState, useEffect } from 'react';

const AIEmotionTracker = () => {
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const emotions = [
    { color: 'bg-success-green', mood: 'Happy' },
    { color: 'bg-yellow-500', mood: 'Neutral' },
    { color: 'bg-cyber-blue', mood: 'Focused' },
    { color: 'bg-alert-red', mood: 'Stressed' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmotion(prev => (prev + 1) % emotions.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="emotion-indicator">
        <div className={`emotion-dot ${emotions[currentEmotion].color}`}></div>
        <span className="emotion-mood">Mood: {emotions[currentEmotion].mood}</span>
    </div>
  );
};

export default AIEmotionTracker;
