import React from 'react';
import Tree from 'react-d3-tree';

export default function ReferralTree({ data }) {
  return (
    <div id="treeWrapper" style={{ width: '100%', height: '500px' }}>
      <Tree
        data={data}
        orientation="vertical"
        translate={{ x: 300, y: 50 }}
        zoomable={true}
        collapsible={true}
      />
    </div>
  );
}
