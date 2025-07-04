import React from 'react';
import { FaRobot, FaMoneyBillWave, FaExchangeAlt, FaWallet } from 'react-icons/fa';

const AITransactionHelper = ({ account, data }) => {
  // Mock transaction data
  const transactionSuggestions = [
    {
      id: 1,
      type: 'reinvest',
      title: 'Optimal Reinvestment',
      description: 'Based on your current earnings, reinvesting 30% of your withdrawal will optimize your growth rate.',
      suggestedAmount: 45.20,
      impact: 'Accelerate team growth by approximately 15% over the next 30 days',
      priority: 'high'
    },
    {
      id: 2,
      type: 'withdraw',
      title: 'Strategic Withdrawal',
      description: 'You have reached 50% of your 4x goal. Consider a partial withdrawal to reduce risk.',
      suggestedAmount: 105.50,
      impact: 'Secure 26% of your total investment while maintaining growth momentum',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'upgrade',
      title: 'Package Upgrade Opportunity',
      description: 'Upgrading to the next package level would significantly increase your Help Pool eligibility.',
      suggestedAmount: 100.00,
      impact: 'Potential 40% increase in weekly Help Pool distributions',
      priority: 'medium'
    }
  ];
  
  // Transaction history
  const recentTransactions = [
    {
      id: 'tx1',
      type: 'withdrawal',
      amount: 75.00,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 'tx2',
      type: 'reinvestment',
      amount: 25.00,
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ];
  
  // Get icon based on transaction type
  const getTransactionIcon = (type) => {
    switch(type) {
      case 'withdraw':
      case 'withdrawal':
        return <FaMoneyBillWave />;
      case 'reinvest':
      case 'reinvestment':
        return <FaExchangeAlt />;
      case 'upgrade':
        return <FaWallet />;
      default:
        return <FaMoneyBillWave />;
    }
  };
  
  return (
    <div className="ai-transaction-helper">
      <div className="transaction-helper-header">
        <h3 className="section-title">
          <FaRobot /> AI Transaction Advisor
        </h3>
      </div>
      
      <div className="transaction-suggestions">
        <h4>Smart Transaction Recommendations</h4>
        <div className="suggestions-list">
          {transactionSuggestions.map(suggestion => (
            <div key={suggestion.id} className={`transaction-suggestion ${suggestion.priority}`}>
              <div className="suggestion-icon">
                {getTransactionIcon(suggestion.type)}
              </div>
              <div className="suggestion-details">
                <h5 className="suggestion-title">{suggestion.title}</h5>
                <p className="suggestion-description">{suggestion.description}</p>
                <div className="suggestion-amount">
                  Suggested Amount: <span className="amount">${suggestion.suggestedAmount.toFixed(2)}</span>
                </div>
                <div className="suggestion-impact">
                  <strong>Impact:</strong> {suggestion.impact}
                </div>
              </div>
              <button className="apply-suggestion-btn">Apply</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="transaction-history">
        <h4>Recent Transactions</h4>
        <div className="history-list">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="transaction-info">
                <div className="transaction-type">
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </div>
                <div className="transaction-date">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className="transaction-amount">
                ${transaction.amount.toFixed(2)}
              </div>
              <div className={`transaction-status ${transaction.status}`}>
                {transaction.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITransactionHelper;
