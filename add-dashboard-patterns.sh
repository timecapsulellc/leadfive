#!/bin/bash
# Add the required error handling patterns to Dashboard.jsx

FILE="src/pages/Dashboard.jsx"

# Add treeError and setTreeError state
sed -i '' '275a\
  const navigate = useNavigate();\
  const [treeError, setTreeError] = useState(false);' "$FILE"

# Add error event listener  
sed -i '' '277a\
\
  // Add error handler\
  useEffect(() => {\
    const handleError = (error) => {\
      console.error("Network section error:", error);\
      setTreeError(true);\
    };\
\
    window.addEventListener("error", handleError);\
    return () => window.removeEventListener("error", handleError);\
  }, []);' "$FILE"

# Add error boundary render function
sed -i '' '290a\
\
  // Error boundary for tree component\
  const renderTree = () => {\
    if (treeError) {\
      return (\
        <div className="tree-error-container">\
          <div className="error-message">\
            <h4>⚠️ Network Visualization Temporarily Unavailable</h4>\
            <p>We'\''re experiencing issues loading the network tree. Please try refreshing or use the full network view.</p>\
            <div className="error-actions">\
              <button \
                onClick={() => {\
                  setTreeError(false);\
                  window.location.reload();\
                }}\
                className="refresh-btn"\
              >\
                🔄 Refresh Page\
              </button>\
              <button \
                onClick={() => navigate("/genealogy")}\
                className="full-view-btn"\
              >\
                🌐 Open Full Network View\
              </button>\
            </div>\
          </div>\
        </div>\
      );\
    }\
\
    try {\
      if (viewMode === "tree") {\
        return <NetworkTreeVisualization address={account} />;\
      } else {\
        return <MatrixVisualization userAddress={account} />;\
      }\
    } catch (error) {\
      console.error("Tree rendering error:", error);\
      setTreeError(true);\
      return null;\
    }\
  };' "$FILE"

echo "✅ Error handling patterns added to Dashboard.jsx"
