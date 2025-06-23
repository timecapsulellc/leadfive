import React from 'react';
import { FaTrophy } from 'react-icons/fa';

const AISuccessStories = () => {
  const stories = [
    {
      name: 'Mike Thompson',
      initials: 'MK',
      earnings: '+$47,000 in 3 months',
      quote: '"The AI predicted my crypto success story started with a single click on LEAD FIVE. Now I\'m in the top 5% of earners!"',
      color: 'from-royal-purple to-energy-orange'
    },
    {
      name: 'Sarah Lee',
      initials: 'SL',
      earnings: '+$23,500 in 6 weeks',
      quote: '"Rough day turned into my best investment decision ever. The emotion-tracking AI knew exactly when to motivate me!"',
      color: 'from-cyber-blue to-success-green'
    }
  ];

  return (
    <div className="overview-card ai-success-stories-card">
      <h3>
        <FaTrophy className="text-premium-gold mr-2" />
        Success Stories (AI Generated)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map((story, index) => (
          <div key={index} className="story-card">
            <div className="story-header">
              <div className={`story-avatar ${story.color}`}>
                <span>{story.initials}</span>
              </div>
              <div>
                <div className="story-name">{story.name}</div>
                <div className="story-earnings">{story.earnings}</div>
              </div>
            </div>
            <p className="story-quote">{story.quote}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuccessStories;
