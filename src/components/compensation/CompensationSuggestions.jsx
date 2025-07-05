import React from 'react';

function CompensationSuggestions({
  compensationData,
  selectedPackage,
  teamData,
}) {
  const suggestions = [];
  if (compensationData.isNearCap) {
    suggestions.push('Upgrade your package to increase your earnings cap.');
  }
  if (teamData && teamData.directReferrals < 10) {
    suggestions.push(
      'Invite more direct referrals to unlock higher leader bonuses.'
    );
  }
  if (teamData && teamData.totalMembers < 100) {
    suggestions.push('Grow your team to increase your level bonuses.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Great job! You are maximizing your compensation.');
  }
  return (
    <div
      className="compensation-suggestions"
      style={{
        marginTop: 18,
        background: '#23263a',
        borderRadius: 8,
        padding: '10px 16px',
        color: '#00d4ff',
        fontWeight: 500,
      }}
    >
      <span role="img" aria-label="lightbulb">
        💡
      </span>{' '}
      Suggestions:
      <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

export default CompensationSuggestions;
