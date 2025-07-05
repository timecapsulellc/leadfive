import React from 'react';

/**
 * TeamLevelView - Visualizes team structure and levels with virtual scrolling support
 * Props: teamData, teamLevelView, deviceInfo, onToggleInfiniteView, onExpandToLevel
 */
function TeamLevelView({
  teamData,
  teamLevelView,
  deviceInfo,
  onToggleInfiniteView,
  onExpandToLevel,
}) {
  const isMobile = deviceInfo?.isMobile || false; // Safely access isMobile, default to false

  // Render team levels (virtualized if needed)
  const levels = Object.keys(teamData.levels)
    .map(Number)
    .sort((a, b) => a - b);
  const visibleLevels = teamLevelView.showInfinite
    ? levels
    : levels.slice(0, teamLevelView.maxDisplayLevel);

  return (
    <div className="team-level-view">
      <div className="team-level-header">
        <h2>Team Levels</h2>
        <button onClick={onToggleInfiniteView} className="infinite-toggle">
          {teamLevelView.showInfinite ? 'Show Top 10' : 'Show All Levels'}
        </button>
      </div>
      <div
        className="team-level-list"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : 'repeat(auto-fit, minmax(220px, 1fr))', // Use safe isMobile
          gap: '1rem',
          maxHeight: isMobile ? 400 : 600, // Use safe isMobile
          overflowY: 'auto',
          marginTop: 12,
        }}
      >
        {visibleLevels.map(level => {
          const levelData = teamData.levels[level];
          return (
            <div key={level} className="team-level-card">
              <div className="level-badge">L{level}</div>
              <div className="level-title">Level {level}</div>
              <div className="level-count">{levelData.count} members</div>
              <div className="level-active">
                Active: {levelData.activeCount} (
                {Math.round((levelData.activeCount / levelData.count) * 100)}%)
              </div>
              <div className="level-volume">
                Volume: ${levelData.volume.toLocaleString()}
              </div>
              <div className="level-earnings">
                Earnings: ${levelData.earnings.toLocaleString()}
              </div>
              <button
                onClick={() => onExpandToLevel(level + 1)}
                className="expand-btn"
              >
                Expand
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeamLevelView;
