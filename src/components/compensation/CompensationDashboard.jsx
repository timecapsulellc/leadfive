import React from 'react';
import PieChart from './PieChart';
import CompensationSuggestions from './CompensationSuggestions';
import CompensationActivityFeed from './CompensationActivityFeed';

/**
 * CompensationDashboard - Displays compensation breakdown and earnings
 * Props: compensationData, teamData, deviceInfo, selectedPackage
 */
function CompensationDashboard({ compensationData, teamData, deviceInfo, selectedPackage }) {
  compensationData = compensationData || {
    sponsorCommissions: 0,
    levelBonuses: {},
    uplineBonuses: 0,
    leaderBonuses: 0,
    globalHelpPool: 0,
    totalEarnings: 0,
    earningsCap: 1
  };
  const [showLevelBreakdown, setShowLevelBreakdown] = React.useState(false);

  // Level bonus rates per plan
  const getLevelBonusRate = (level) => {
    if (level === 1) return 3;
    if (level >= 2 && level <= 6) return 1;
    if (level >= 7 && level <= 10) return 0.5;
    return 0;
  };

  // Find the most profitable level
  const maxLevel = Object.entries(compensationData.levelBonuses).reduce((max, [level, bonus]) => bonus > (compensationData.levelBonuses[max] || 0) ? level : max, 1);

  // Pie chart data for earnings breakdown
  const pieData = [
    { label: 'Sponsor', value: compensationData.sponsorCommissions, color: '#00ff88' },
    { label: 'Level', value: Object.values(compensationData.levelBonuses).reduce((a, b) => a + b, 0), color: '#00d4ff' },
    { label: 'Upline', value: compensationData.uplineBonuses, color: '#ffd700' },
    { label: 'Leader', value: compensationData.leaderBonuses, color: '#7b2cbf' },
    { label: 'Pool', value: compensationData.globalHelpPool, color: '#ff6b35' },
  ];
  const earningsPercent = Math.min(100, (compensationData.totalEarnings / (compensationData.earningsCap || 1)) * 100);

  // Export handler
  const handleExport = () => {
    const data = {
      compensationData,
      selectedPackage,
      teamData,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compensation-report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Share handler
  const handleShare = () => {
    const summary = `OrphiCrowdFund Compensation Summary\n\nTotal Earnings: $${compensationData.totalEarnings.toLocaleString()}\nEarnings Cap: $${compensationData.earningsCap.toLocaleString()}\nSelected Package: ${selectedPackage}`;
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="compensation-dashboard" aria-label="Compensation Dashboard" tabIndex={0} style={{outline:'none', maxWidth: 600, margin: '0 auto', padding: deviceInfo && deviceInfo.isMobile ? '10px' : '24px'}}>
      <h2 style={{display:'flex',alignItems:'center',gap:8, fontSize: deviceInfo && deviceInfo.isMobile ? '1.2em' : '1.5em'}}>
        <span role="img" aria-label="plan">💸</span> Compensation Plan
      </h2>
      <div className="compensation-summary" style={{
        borderRadius:12,
        background:'#23263a',
        padding: deviceInfo && deviceInfo.isMobile ? '0.7rem' : '1rem',
        boxShadow:'0 2px 8px #0002',
        display:'flex',
        flexDirection: 'column',
        gap: deviceInfo && deviceInfo.isMobile ? 8 : 16
      }}>
        {/* Sponsor Commissions */}
        <div className="summary-item" title="Direct commissions from your direct referrals (40% of their package)" style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label"><span role="img" aria-label="sponsor">🤝</span> Sponsor Commissions <span aria-label="info" title="Direct commissions from your direct referrals (40% of their package)">ℹ️</span>:</span>
          <span className="value" style={{color:'#00ff88',fontWeight:600}}>${compensationData.sponsorCommissions.toLocaleString()}</span>
        </div>
        <hr style={{border:'none',borderTop:'1px solid #333',margin:'8px 0'}}/>
        {/* Level Bonuses */}
        <div className="summary-item" title="Bonuses earned from your team at each level (see breakdown)" style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label"><span role="img" aria-label="levels">🏆</span> Level Bonuses <span aria-label="info" title="Bonuses earned from your team at each level (see breakdown)">ℹ️</span>:</span>
          <span className="value" style={{color:'#00d4ff',fontWeight:600}}>${Object.values(compensationData.levelBonuses).reduce((a, b) => a + b, 0).toLocaleString()}</span>
          <button className="level-breakdown-toggle" onClick={() => setShowLevelBreakdown(v => !v)} style={{marginLeft:8,background:'#181a20',color:'#fff',border:'1px solid #333',borderRadius:6,padding:'2px 10px',cursor:'pointer'}}>
            {showLevelBreakdown ? 'Hide' : 'Show'} Breakdown
          </button>
        </div>
        {showLevelBreakdown && (
          <div className="level-bonus-breakdown" style={{margin:'8px 0',padding:'8px',background:'#181a20',borderRadius:8}}>
            {[...Array(10)].map((_, i) => {
              const level = i + 1;
              const bonus = compensationData.levelBonuses[level] || 0;
              const rate = getLevelBonusRate(level);
              const isMax = String(level) === String(maxLevel);
              const percent = Math.max(2, (bonus / (Object.values(compensationData.levelBonuses).reduce((a, b) => a + b, 0) || 1)) * 100);
              return (
                <div key={level} style={{display:'flex',alignItems:'center',gap:8,margin:'4px 0'}}>
                  <span style={{minWidth:90}}><span role="img" aria-label="level">{level <= 3 ? '🥇' : level <= 6 ? '🥈' : '🥉'}</span> Level {level} ({rate}%):</span>
                  <div style={{flex:1,background:'#23263a',borderRadius:4,overflow:'hidden',height:12,marginRight:8}}>
                    <div style={{width:`${percent}%`,background:isMax?'#00ff88':'#00d4ff',height:'100%',transition:'width 0.7s'}}></div>
                  </div>
                  <span style={{fontWeight:isMax?700:500,color:isMax?'#00ff88':'#fff',minWidth:70,textAlign:'right'}}>${bonus.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
        <hr style={{border:'none',borderTop:'1px solid #333',margin:'8px 0'}}/>
        {/* Upline Bonuses */}
        <div className="summary-item" title="Bonuses from your uplines (10% split among 30 uplines)" style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label"><span role="img" aria-label="upline">🧑‍🤝‍🧑</span> Upline Bonuses <span aria-label="info" title="Bonuses from your uplines (10% split among 30 uplines)">ℹ️</span>:</span>
          <span className="value" style={{color:'#ffd700',fontWeight:600}}>${compensationData.uplineBonuses.toLocaleString()}</span>
        </div>
        <div className="summary-item" title="Bonuses for achieving leader ranks (Silver Star, Shining Star, etc)" style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label"><span role="img" aria-label="leader">⭐</span> Leader Bonuses <span aria-label="info" title="Bonuses for achieving leader ranks (Silver Star, Shining Star, etc)">ℹ️</span>:</span>
          <span className="value" style={{color:'#7b2cbf',fontWeight:600}}>${compensationData.leaderBonuses.toLocaleString()}</span>
        </div>
        <div className="summary-item" title="30% of all volume is distributed to the global help pool" style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label"><span role="img" aria-label="pool">🌐</span> Global Help Pool <span aria-label="info" title="30% of all volume is distributed to the global help pool">ℹ️</span>:</span>
          <span className="value" style={{color:'#ff6b35',fontWeight:600}}>${compensationData.globalHelpPool.toLocaleString()}</span>
        </div>
        <hr style={{border:'none',borderTop:'1px solid #333',margin:'8px 0'}}/>
        {/* Totals */}
        <div className="summary-item total" title="Sum of all your earnings from the plan" style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label"><span role="img" aria-label="total">💰</span> Total Earnings:</span>
          <span className="value" style={{color:'#00ff88',fontWeight:700,fontSize:'1.1em'}}>${compensationData.totalEarnings.toLocaleString()}</span>
        </div>
        <div className="summary-item cap" title="Maximum you can earn (usually 5x your package)" style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="label"><span role="img" aria-label="cap">🔒</span> Earnings Cap:</span>
          <span className="value" style={{color:'#ffd700',fontWeight:700}}>${compensationData.earningsCap.toLocaleString()}</span>
        </div>
      </div>
      {compensationData.isNearCap && (
        <div className="cap-warning" aria-live="polite" style={{color:'#ffd700',background:'#23263a',padding:'8px',borderRadius:8,marginTop:8,fontWeight:600,marginBottom:8}}>
          <span role="img" aria-label="warning">⚠️</span> Warning: You are nearing your earnings cap!
        </div>
      )}
      <CompensationSuggestions compensationData={compensationData} selectedPackage={selectedPackage} teamData={teamData} />
      <CompensationActivityFeed recentEvents={[
        'You earned $50 from Level 2 bonus.',
        'You received $25 sponsor commission.',
        'You earned $10 from the Global Help Pool.',
        'You received $5 leader bonus.',
        'You earned $3 upline bonus.'
      ]} aria-live="polite" />
      <div className="package-info" style={{marginTop:12, fontSize: deviceInfo && deviceInfo.isMobile ? '1em' : '1.1em'}}>
        <span><span role="img" aria-label="package">📦</span> Selected Package: <b>{selectedPackage}</b></span>
      </div>
      <div style={{display:'flex',gap:24,alignItems:'center',flexWrap:'wrap',margin:'18px 0'}}>
        {/* Progress Bar */}
        <div style={{flex:'1 1 220px',minWidth:220}}>
          <div style={{fontWeight:600,marginBottom:4}}>Earnings Progress</div>
          <div style={{background:'#23263a',borderRadius:8,overflow:'hidden',height:22,position:'relative'}} aria-label="Earnings Progress Bar">
            <div style={{width:`${earningsPercent}%`,background:'linear-gradient(90deg,#00ff88,#00d4ff)',height:'100%',transition:'width 0.7s',borderRadius:8}}></div>
            <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'0.98em',textShadow:'0 1px 2px #0008'}}>
              {earningsPercent.toFixed(1)}% of Cap
            </div>
          </div>
        </div>
        {/* Pie Chart */}
        <div style={{flex:'0 0 140px',minWidth:120,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <PieChart data={pieData} size={120} strokeWidth={18} />
          <div style={{marginTop:8,fontSize:'0.95em',color:'#aaa',textAlign:'center'}}>Earnings Breakdown</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center',marginTop:4}}>
            {pieData.map(d => (
              <span key={d.label} style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.92em'}}>
                <span style={{display:'inline-block',width:12,height:12,background:d.color,borderRadius:2,marginRight:2}}></span>{d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:12,marginTop:18,flexWrap:'wrap'}}>
        <button onClick={handleExport} style={{background:'#00d4ff',color:'#181a20',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,cursor:'pointer',minWidth:120}} aria-label="Export compensation data as JSON">Export JSON</button>
        <button onClick={handleShare} style={{background:'#00ff88',color:'#181a20',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,cursor:'pointer',minWidth:120}} aria-label="Copy compensation summary to clipboard">Share Summary</button>
      </div>
      {/* Add subtle hover/focus effect for summary items */}
      <style>{`
        .compensation-dashboard .summary-item:hover, .compensation-dashboard .summary-item:focus {
          background: #1a1d2a;
          outline: 2px solid #00d4ff33;
        }
        .compensation-dashboard button:focus {
          outline: 2px solid #00d4ff;
        }
        .compensation-dashboard .level-breakdown-toggle {
          transition: background 0.2s, color 0.2s;
        }
        .compensation-dashboard .level-breakdown-toggle:hover, .compensation-dashboard .level-breakdown-toggle:focus {
          background: #00d4ff;
          color: #181a20;
        }
        .compensation-dashboard .cap-warning {
          animation: pulseCap 1.2s infinite alternate;
        }
        @keyframes pulseCap {
          0% { box-shadow: 0 0 0 0 #ffd70044; }
          100% { box-shadow: 0 0 12px 4px #ffd70044; }
        }
      `}</style>
    </div>
  );
}

export default CompensationDashboard;
