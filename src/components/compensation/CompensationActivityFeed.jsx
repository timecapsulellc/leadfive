import React from 'react';

function CompensationActivityFeed({ recentEvents }) {
  if (!recentEvents || recentEvents.length === 0) return null;
  return (
    <div className="compensation-activity-feed" style={{marginTop:16,background:'#23263a',borderRadius:8,padding:'10px 16px',color:'#fff'}}>
      <span role="img" aria-label="activity">📈</span> Recent Compensation Activity:
      <ul style={{margin:'8px 0 0 18px',padding:0}}>
        {recentEvents.slice(0,5).map((e, i) => (
          <li key={i} style={{fontSize:'0.97em'}}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

export default CompensationActivityFeed;
