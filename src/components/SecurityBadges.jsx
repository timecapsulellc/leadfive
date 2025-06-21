import React from 'react';
// import './SecurityBadges.css';

export default function SecurityBadges() {
  const badges = [
    { icon: '🔐', title: 'Trezor Secured', desc: 'Hardware wallet control' },
    { icon: '🛡️', title: 'MEV Protected', desc: 'Anti-bot transaction security' },
    { icon: '✅', title: 'PhD Audited', desc: 'Expert security verification' },
    { icon: '🚀', title: 'DoS Resistant', desc: 'Spam & attack protection' }
  ];
  return (
    <div className="security-badges">
      {badges.map(b => (
        <div key={b.title} className="badge-item">
          <span className="badge-icon">{b.icon}</span>
          <h4>{b.title}</h4>
          <p>{b.desc}</p>
        </div>
      ))}
    </div>
  );
}
