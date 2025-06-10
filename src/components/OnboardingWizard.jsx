import React, { useState } from 'react';

const OnboardingWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    walletConnected: false,
    selectedPackage: null,
    referrerAddress: '',
    acceptTerms: false,
    userInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, title: 'Connect Wallet', icon: '🔗' },
    { id: 2, title: 'Choose Package', icon: '📦' },
    { id: 3, title: 'User Details', icon: '👤' },
    { id: 4, title: 'Confirm & Register', icon: '✅' }
  ];

  const packages = [
    {
      id: 'basic',
      name: 'Basic',
      price: 100,
      tier: 1,
      features: [
        'Basic compensation plan',
        'Standard support',
        'Mobile app access',
        'Basic analytics'
      ],
      recommended: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 250,
      tier: 2,
      features: [
        'Enhanced compensation plan',
        'Priority support',
        'Advanced analytics',
        'Team management tools',
        'Custom referral links'
      ],
      recommended: true
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 500,
      tier: 3,
      features: [
        'Maximum compensation plan',
        'VIP support',
        'Full analytics suite',
        'Advanced team tools',
        'Personal account manager',
        'White-label options'
      ],
      recommended: false
    }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWalletConnect = async () => {
    setIsProcessing(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFormData({ ...formData, walletConnected: true });
      setTimeout(handleNext, 500);
    } catch (error) {
      alert('Failed to connect wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePackageSelect = (packageId) => {
    setFormData({ ...formData, selectedPackage: packageId });
  };

  const handleUserInfoChange = (field, value) => {
    setFormData({
      ...formData,
      userInfo: { ...formData.userInfo, [field]: value }
    });
  };

  const handleSubmit = async () => {
    if (!formData.acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const selectedPkg = packages.find(p => p.id === formData.selectedPackage);
      onComplete?.({
        package: selectedPkg,
        userInfo: formData.userInfo,
        walletConnected: formData.walletConnected
      });
    } catch (error) {
      alert('Registration failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.walletConnected;
      case 2: return formData.selectedPackage;
      case 3: return formData.userInfo.name && formData.userInfo.email;
      case 4: return formData.acceptTerms;
      default: return false;
    }
  };

  const renderStep1 = () => (
    <div className="wizard-step">
      <div className="step-content">
        <div className="step-icon">🔗</div>
        <h3>Connect Your Wallet</h3>
        <p>Connect your MetaMask wallet to get started with OrphiCrowdFund</p>
        
        <div className={`wallet-status ${formData.walletConnected ? 'connected' : ''}`}>
          {formData.walletConnected ? (
            <>
              <div className="status-icon">✅</div>
              <h4>Wallet Connected</h4>
              <p>MetaMask wallet successfully connected</p>
            </>
          ) : (
            <>
              <div className="status-icon">🔌</div>
              <h4>Wallet Not Connected</h4>
              <p>Please connect your MetaMask wallet to continue</p>
              <button 
                className="connect-btn"
                onClick={handleWalletConnect}
                disabled={isProcessing}
              >
                {isProcessing ? '⏳ Connecting...' : '🔗 Connect MetaMask'}
              </button>
            </>
          )}
        </div>

        <div className="network-info">
          <label>Network: BSC Testnet</label>
          <p>Make sure you're connected to Binance Smart Chain Testnet</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step">
      <div className="step-content">
        <div className="step-icon">📦</div>
        <h3>Choose Your Package</h3>
        <p>Select the package that best fits your goals</p>
        
        <div className="packages-grid">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`package-card ${formData.selectedPackage === pkg.id ? 'selected' : ''}`}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              {pkg.recommended && <div className="recommended-badge">Recommended</div>}
              <div className="package-header">
                <div className="package-price">${pkg.price}</div>
                <div className="package-name">{pkg.name}</div>
                <div className="package-tier">Tier {pkg.tier}</div>
              </div>
              <ul className="package-features">
                {pkg.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step">
      <div className="step-content">
        <div className="step-icon">👤</div>
        <h3>Your Information</h3>
        <p>Please provide your details for account setup</p>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.userInfo.name}
              onChange={(e) => handleUserInfoChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.userInfo.email}
              onChange={(e) => handleUserInfoChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.userInfo.phone}
              onChange={(e) => handleUserInfoChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label>Referrer Address (Optional)</label>
            <input
              type="text"
              value={formData.referrerAddress}
              onChange={(e) => setFormData({...formData, referrerAddress: e.target.value})}
              placeholder="0x... (Optional)"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedPkg = packages.find(p => p.id === formData.selectedPackage);
    
    return (
      <div className="wizard-step">
        <div className="step-content">
          <div className="step-icon">✅</div>
          <h3>Confirm & Register</h3>
          <p>Review your information and complete registration</p>
          
          <div className="confirmation-summary">
            <div className="summary-section">
              <h4>Selected Package</h4>
              <div className="package-summary">
                <div className="package-name">{selectedPkg?.name} - ${selectedPkg?.price}</div>
                <div className="package-tier">Tier {selectedPkg?.tier}</div>
              </div>
            </div>
            
            <div className="summary-section">
              <h4>Account Information</h4>
              <div className="info-summary">
                <p><strong>Name:</strong> {formData.userInfo.name}</p>
                <p><strong>Email:</strong> {formData.userInfo.email}</p>
                {formData.userInfo.phone && (
                  <p><strong>Phone:</strong> {formData.userInfo.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="terms-section">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
              />
              <span className="checkmark"></span>
              I accept the <a href="#" target="_blank">Terms & Conditions</a> and <a href="#" target="_blank">Privacy Policy</a>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="onboarding-wizard">
      <div className="wizard-container">
        <div className="wizard-header">
          <h1>Welcome to OrphiCrowdFund</h1>
          <p>Complete your registration in 4 simple steps</p>
        </div>

        {/* Progress Tracker */}
        <div className="progress-tracker">
          {steps.map((step, index) => (
            <div key={step.id} className="progress-step">
              <div className={`step-circle ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div className="step-label">{step.title}</div>
              {index < steps.length - 1 && (
                <div className={`step-line ${currentStep > step.id ? 'completed' : ''}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="wizard-navigation">
          <button 
            className="nav-btn secondary"
            onClick={currentStep === 1 ? onCancel : handlePrevious}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>
          
          <button 
            className="nav-btn primary"
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            disabled={!isStepValid() || isProcessing}
          >
            {isProcessing ? '⏳ Processing...' : currentStep === 4 ? 'Complete Registration' : 'Next Step'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .onboarding-wizard {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(5px);
        }

        .wizard-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #00D4FF;
          border-radius: 20px;
          padding: 40px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .wizard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .wizard-header h1 {
          color: #00D4FF;
          font-size: 2.2rem;
          margin-bottom: 10px;
        }

        .wizard-header p {
          color: #ccc;
          font-size: 1.1rem;
        }

        .progress-tracker {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid #444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          transition: all 0.3s ease;
          margin-bottom: 8px;
        }

        .step-circle.active {
          background: #00D4FF;
          border-color: #00D4FF;
          color: #1a1a2e;
        }

        .step-circle.completed {
          background: #00FF88;
          border-color: #00FF88;
          color: #1a1a2e;
        }

        .step-label {
          font-size: 12px;
          color: #ccc;
          text-align: center;
          white-space: nowrap;
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: #444;
          margin: 0 10px 20px 10px;
          transition: all 0.3s ease;
        }

        .step-line.completed {
          background: #00FF88;
        }

        .wizard-content {
          min-height: 400px;
        }

        .wizard-step {
          animation: fadeIn 0.3s ease-in;
        }

        .step-content {
          text-align: center;
        }

        .step-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .step-content h3 {
          color: #00D4FF;
          margin-bottom: 10px;
          font-size: 1.8rem;
        }

        .step-content p {
          color: #ccc;
          margin-bottom: 30px;
          font-size: 1.1rem;
        }

        .wallet-status {
          background: rgba(255, 107, 107, 0.2);
          border: 2px solid #FF6B6B;
          border-radius: 15px;
          padding: 30px;
          margin: 20px 0;
        }

        .wallet-status.connected {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00FF88;
        }

        .status-icon {
          font-size: 2rem;
          margin-bottom: 15px;
        }

        .connect-btn {
          background: #00D4FF;
          color: #1a1a2e;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          margin-top: 15px;
          transition: all 0.2s ease;
        }

        .connect-btn:hover:not(:disabled) {
          background: #00b8e6;
        }

        .connect-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .package-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid #444;
          border-radius: 15px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .package-card:hover {
          border-color: #00D4FF;
          transform: translateY(-5px);
        }

        .package-card.selected {
          border-color: #00D4FF;
          background: rgba(0, 212, 255, 0.1);
        }

        .recommended-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #FF6B6B;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .package-price {
          font-size: 2rem;
          color: #00D4FF;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .package-name {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .package-tier {
          color: #ccc;
          margin-bottom: 20px;
        }

        .package-features {
          list-style: none;
          padding: 0;
          text-align: left;
        }

        .package-features li {
          padding: 8px 0;
          color: #ccc;
          position: relative;
          padding-left: 20px;
        }

        .package-features li::before {
          content: "✓";
          color: #00FF88;
          position: absolute;
          left: 0;
        }

        .form-grid {
          display: grid;
          gap: 20px;
          max-width: 500px;
          margin: 0 auto;
          text-align: left;
        }

        .form-group label {
          display: block;
          color: white;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #444;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #00D4FF;
        }

        .confirmation-summary {
          text-align: left;
          max-width: 500px;
          margin: 0 auto 30px auto;
        }

        .summary-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .summary-section h4 {
          color: #00D4FF;
          margin-bottom: 15px;
        }

        .package-summary .package-name {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .terms-section {
          margin-top: 30px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #ccc;
        }

        .checkbox-container input {
          width: auto;
        }

        .checkbox-container a {
          color: #00D4FF;
          text-decoration: none;
        }

        .wizard-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #333;
        }

        .nav-btn {
          padding: 12px 30px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn.primary {
          background: #00D4FF;
          color: #1a1a2e;
        }

        .nav-btn.secondary {
          background: transparent;
          color: #ccc;
          border: 2px solid #444;
        }

        .nav-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .nav-btn.primary:hover:not(:disabled) {
          background: #00b8e6;
        }

        .nav-btn.secondary:hover:not(:disabled) {
          border-color: #666;
        }

        .nav-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .wizard-container {
            padding: 20px;
            width: 95%;
          }
          
          .progress-tracker {
            flex-direction: column;
            gap: 10px;
          }
          
          .step-line {
            width: 2px;
            height: 20px;
            margin: 5px 0;
          }
          
          .packages-grid {
            grid-template-columns: 1fr;
          }
          
          .wizard-navigation {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;
