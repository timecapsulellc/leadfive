import React, { useState, useEffect, useRef } from 'react';
import './TreeSearch.css';

const TreeSearch = ({ treeData, onNodeSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchQuery, treeData]);

  const performSearch = (query) => {
    if (!treeData) return;
    
    const results = [];
    const searchTerm = query.toLowerCase().trim();
    
    const searchNode = (node, path = []) => {
      const currentPath = [...path, node.name];
      
      // Check if current node matches
      const searchableText = [
        node.name,
        node.attributes?.address || node.id,
        node.attributes?.earnings || node.earnings,
        node.attributes?.package || node.package,
        `${node.attributes?.directReferrals || node.directReferrals || 0} referrals`,
        `${node.attributes?.totalNetwork || node.totalNetwork || 0} network`
      ].join(' ').toLowerCase();
      
      if (searchableText.includes(searchTerm)) {
        results.push({
          node: node,
          path: currentPath,
          matchType: getMatchType(searchTerm, node),
          score: calculateScore(searchTerm, searchableText)
        });
      }
      
      // Search children
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => searchNode(child, currentPath));
      }
    };
    
    searchNode(treeData);
    
    // Sort results by score (relevance)
    results.sort((a, b) => b.score - a.score);
    setSearchResults(results.slice(0, 10)); // Limit to top 10 results
    setSelectedIndex(0);
  };

  const getMatchType = (searchTerm, node) => {
    const name = (node.name || '').toLowerCase();
    const address = (node.attributes?.address || node.id || '').toLowerCase();
    
    if (name.includes(searchTerm)) return 'name';
    if (address.includes(searchTerm)) return 'address';
    return 'other';
  };

  const calculateScore = (searchTerm, text) => {
    let score = 0;
    
    // Exact match gets highest score
    if (text === searchTerm) score += 100;
    
    // Name match gets high score
    if (text.startsWith(searchTerm)) score += 50;
    
    // Contains match gets medium score
    if (text.includes(searchTerm)) score += 25;
    
    // Shorter text with match gets bonus
    score += Math.max(0, 50 - text.length);
    
    return score;
  };

  const handleKeyDown = (e) => {
    if (!isOpen || searchResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          selectResult(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        clearSearch();
        break;
      default:
        break;
    }
  };

  const selectResult = (result) => {
    onNodeSelect(result.node);
    clearSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    setSelectedIndex(0);
    if (onClose) onClose();
  };

  const formatAddress = (address) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.slice(-4)}`;
  };

  const getMatchIcon = (matchType) => {
    switch (matchType) {
      case 'name':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
        );
      case 'address':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
          </svg>
        );
    }
  };

  return (
    <div className="tree-search">
      <div className="search-input-container">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search by name, address, earnings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={clearSearch}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
            <span className="keyboard-hint">Use ↑↓ and Enter</span>
          </div>
          <div className="results-list">
            {searchResults.map((result, index) => (
              <div
                key={`${result.node.attributes?.address || result.node.id}-${index}`}
                className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => selectResult(result)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="result-icon">
                  {getMatchIcon(result.matchType)}
                </div>
                <div className="result-content">
                  <div className="result-name">{result.node.name}</div>
                  <div className="result-details">
                    <span className="result-address">
                      {formatAddress(result.node.attributes?.address || result.node.id)}
                    </span>
                    <span className="result-earnings">
                      {result.node.attributes?.earnings || result.node.earnings}
                    </span>
                  </div>
                  <div className="result-path">
                    {result.path.slice(0, -1).join(' → ')}
                  </div>
                </div>
                <div className="result-badge">
                  {result.matchType}
                </div>
              </div>
            ))}
          </div>
          <div className="search-footer">
            <span>Press ESC to close</span>
          </div>
        </div>
      )}

      {isOpen && searchQuery && searchResults.length === 0 && (
        <div className="search-results">
          <div className="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
            <p>No results found for "{searchQuery}"</p>
            <span>Try searching by name, address, or earnings</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeSearch;
