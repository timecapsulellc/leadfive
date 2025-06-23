console.log('Testing AI component loading...'); 
setTimeout(() => {
  const aiCards = document.querySelectorAll('.ai-card');
  console.log('AI Cards found:', aiCards.length);
  aiCards.forEach((card, i) => {
    console.log('AI Card', i+1, ':', card.textContent.substring(0, 50));
  });
  
  const aiGrid = document.querySelector('.ai-features-grid');
  console.log('AI Features Grid found:', ls -l /Users/dadou/LEAD\ FIVE/src/pages/Dashboard.jsxaiGrid);
  
  const debugElements = document.querySelectorAll('[style*="background: red"]');
  console.log('Debug elements found:', debugElements.length);
}, 3000);
