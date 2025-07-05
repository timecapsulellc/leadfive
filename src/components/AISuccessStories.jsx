import React from 'react';
import {
  FaRobot,
  FaBook,
  FaQuoteLeft,
  FaQuoteRight,
  FaTrophy,
} from 'react-icons/fa';

const AISuccessStories = ({ account }) => {
  // Mock data for success stories
  const successStories = [
    {
      id: 1,
      title: 'From Skeptic to Leader',
      story:
        'I started with just the basic package and was skeptical about the 4x earning potential. Within 3 months, I had a team of 15 and reached my first 4x goal. The Help Pool bonuses were a game-changer for my strategy.',
      author: '0x7b41...e28f',
      achievements: [
        '4x Package Return',
        'Level 3 Community',
        '15+ Team Members',
      ],
      relevance: 'high',
    },
    {
      id: 2,
      title: 'Consistent Growth Strategy',
      story:
        'Instead of focusing only on direct referrals, I helped my team build their downlines. This steady approach helped me qualify for the Leader Pool faster than I expected. The consistent weekly earnings have been impressive.',
      author: '0x3f52...8a1c',
      achievements: [
        'Leader Pool Qualified',
        'Level 4 Community',
        '30+ Team Size',
      ],
      relevance: 'medium',
    },
    {
      id: 3,
      title: 'Leveraging the Help Pool',
      story:
        'The Help Pool distributions became my main focus. By maintaining eligibility and helping my team grow, I received significant weekly bonuses that accelerated my overall returns.',
      author: '0x91f3...2d67',
      achievements: [
        'Maximum Help Pool Returns',
        'Level 2 Community',
        'Consistent Weekly Earnings',
      ],
      relevance: 'high',
    },
  ];

  return (
    <div className="ai-success-stories">
      <div className="success-stories-header">
        <h3 className="section-title">
          <FaRobot /> AI-Matched Success Stories
        </h3>
        <p className="stories-subtitle">
          Stories from community members with similar starting points
        </p>
      </div>

      <div className="stories-container">
        {successStories.map(story => (
          <div key={story.id} className={`story-card ${story.relevance}`}>
            <div className="story-header">
              <h4 className="story-title">
                <FaBook className="story-icon" />
                {story.title}
              </h4>
              <div className="story-relevance-indicator"></div>
            </div>

            <div className="story-content">
              <FaQuoteLeft className="quote-icon left" />
              <p className="story-text">{story.story}</p>
              <FaQuoteRight className="quote-icon right" />
            </div>

            <div className="story-author">- {story.author}</div>

            <div className="story-achievements">
              {story.achievements.map((achievement, index) => (
                <div key={index} className="achievement-tag">
                  <FaTrophy className="achievement-icon" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="stories-action">
        <button className="view-more-stories">View More Success Stories</button>
      </div>
    </div>
  );
};

export default AISuccessStories;
