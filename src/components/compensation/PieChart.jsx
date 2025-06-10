import React from 'react';

// Simple SVG Pie Chart for earnings breakdown
function PieChart({ data, size = 120, strokeWidth = 18 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {total > 0 && data.map((d, i) => { // Check if total is greater than 0
        const value = d.value;
        // Ensure angle calculation is safe if total is somehow still zero or value is problematic
        const angle = total > 0 ? (value / total) * 360 : 0;
        if (value === 0) return null; // Don't render a path for zero value items

        const startAngle = cumulative;
        const endAngle = cumulative + angle;
        cumulative += angle;
        const largeArc = angle > 180 ? 1 : 0;
        const start = polarToCartesian(center, center, radius, startAngle);
        const end = polarToCartesian(center, center, radius, endAngle);
        
        // Additional check for NaN in coordinates, though the total > 0 check should prevent this.
        if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y)) {
          console.error("Skipping path due to NaN coordinates", d, start, end);
          return null;
        }

        const pathData = [
          `M ${start.x} ${start.y}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
        ].join(' ');
        return (
          <path
            key={d.label}
            d={pathData}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}
      <circle
        cx={center}
        cy={center}
        r={radius - strokeWidth / 2} // Adjusted radius for inner circle if strokeWidth is large
        fill="#181a20" // Ensure this color contrasts with potential chart colors
      />
      <text x={center} y={center} textAnchor="middle" dy="0.3em" fill="#fff" fontSize="1.1em" fontWeight="bold">
        {total > 0 ? 'Total' : 'No Data'}
      </text>
    </svg>
  );
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  // Ensure r is positive and finite
  const safeRadius = (r > 0 && isFinite(r)) ? r : 0;
  return {
    x: cx + safeRadius * Math.cos(rad),
    y: cy + safeRadius * Math.sin(rad)
  };
}

export default PieChart;
