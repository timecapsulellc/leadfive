import React, { lazy, Suspense, useState, useEffect } from 'react';
import { LoadingSpinner } from '../LazyLoader';

// Lazy load D3 and heavy visualization libraries
const D3TreeVisualization = lazy(() => 
  import('d3').then(() => import('./GenealogyTreeVisualization'))
);

// Lazy load search and export features
const TreeSearch = lazy(() => import('../TreeSearch'));
const ExportModal = lazy(() => import('../ExportModal'));

// Core component that loads immediately
const GenealogyTreeCore = ({ account, provider, contractService }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const loadTreeData = async () => {
      try {
        setLoading(true);
        // Load tree data from contract
        const data = await contractService.getGenealogyData(account);
        setTreeData(data);
      } catch (error) {
        console.error('Error loading genealogy data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (account && provider) {
      loadTreeData();
    }
  }, [account, provider, contractService]);

  if (loading) {
    return (
      <div className="genealogy-loading">
        <LoadingSpinner />
        <p>Loading your network tree...</p>
      </div>
    );
  }

  return (
    <div className="genealogy-tree-container">
      {/* Header with lazy-loaded features */}
      <div className="tree-header">
        <h2>Network Genealogy</h2>
        <div className="tree-actions">
          <button onClick={() => setShowSearch(true)}>Search</button>
          <button onClick={() => setShowExport(true)}>Export</button>
        </div>
      </div>

      {/* Main tree visualization */}
      <Suspense fallback={
        <div className="tree-loading">
          <LoadingSpinner />
          <p>Rendering network visualization...</p>
        </div>
      }>
        <D3TreeVisualization data={treeData} />
      </Suspense>

      {/* Lazy-loaded modals */}
      {showSearch && (
        <Suspense fallback={<LoadingSpinner />}>
          <TreeSearch 
            data={treeData} 
            onClose={() => setShowSearch(false)} 
          />
        </Suspense>
      )}

      {showExport && (
        <Suspense fallback={<LoadingSpinner />}>
          <ExportModal 
            data={treeData} 
            onClose={() => setShowExport(false)} 
          />
        </Suspense>
      )}
    </div>
  );
};

// Main export with dynamic import wrapper
export default function LazyGenealogyTree(props) {
  return <GenealogyTreeCore {...props} />;
}