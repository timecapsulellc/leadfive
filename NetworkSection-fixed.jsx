// Network Section Component with Error Handling
function NetworkSection({ account }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('tree');
  const [treeError, setTreeError] = useState(false);

  // Add error handler
  useEffect(() => {
    const handleError = (error) => {
      console.error('Network section error:', error);
      setTreeError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Error boundary for tree component
  const renderTree = () => {
    if (treeError) {
      return (
        <div className="tree-error-container">
          <div className="error-message">
            <h4>⚠️ Network Visualization Temporarily Unavailable</h4>
            <p>We're experiencing issues loading the network tree. Please try refreshing or use the full network view.</p>
            <div className="error-actions">
              <button 
                onClick={() => {
                  setTreeError(false);
                  window.location.reload();
                }}
                className="refresh-btn"
              >
                🔄 Refresh Page
              </button>
              <button 
                onClick={() => navigate('/genealogy')}
                className="full-view-btn"
              >
                🌐 Open Full Network View
              </button>
            </div>
          </div>
        </div>
      );
    }

    try {
      if (viewMode === 'tree') {
        return <NetworkTreeVisualization address={account} />;
      } else {
        return <MatrixVisualization userAddress={account} />;
      }
    } catch (error) {
      console.error('Tree rendering error:', error);
      setTreeError(true);
      return null;
    }
  };

  return (
    <div className="network-section">
      <div className="section-header">
        <h2>Your Network Structure</h2>
        <div className="view-toggle">
          <button 
            className={viewMode === 'tree' ? 'active' : ''}
            onClick={() => setViewMode('tree')}
          >
            Tree View
          </button>
          <button 
            className={viewMode === 'matrix' ? 'active' : ''}
            onClick={() => setViewMode('matrix')}
          >
            Grid View
          </button>
        </div>
        <div className="section-actions">
          <button 
            className="full-view-btn"
            onClick={() => navigate('/genealogy')}
          >
            <FaNetworkWired />
            Full Network View
          </button>
        </div>
      </div>

      {renderTree()}
    </div>
  );
}
