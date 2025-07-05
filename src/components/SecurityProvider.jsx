/**
 * Security Provider Component
 * React context and hooks for security management
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

import {
  comprehensiveSecurityManager,
  initializeSecurity,
  securityUtils,
  SECURITY_CONFIG,
} from '../utils/securityConfig';
import { errorHandler } from '../utils/errorHandling';

// ============ SECURITY CONTEXT ============
const SecurityContext = createContext({
  isInitialized: false,
  securityStatus: null,
  securityMetrics: null,
  isSecure: false,
  threats: [],
  initializeSecurity: () => {},
  reportThreat: () => {},
  getSecurityStatus: () => {},
});

// ============ SECURITY PROVIDER ============
export const SecurityProvider = ({ children, config = SECURITY_CONFIG }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [threats, setThreats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializationRef = useRef(false);
  const metricsIntervalRef = useRef(null);

  // Initialize security system
  const handleInitializeSecurity = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      const result = await initializeSecurity(config);

      if (result.success) {
        setIsInitialized(true);
        setSecurityStatus(comprehensiveSecurityManager.getSecurityStatus());

        // Setup periodic metrics updates
        metricsIntervalRef.current = setInterval(() => {
          updateSecurityMetrics();
        }, 30000); // Update every 30 seconds
      }
    } catch (err) {
      setError(err.message);
      errorHandler.handleError(err, { source: 'security_provider_init' });
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Update security metrics
  const updateSecurityMetrics = useCallback(() => {
    if (isInitialized) {
      const status = comprehensiveSecurityManager.getSecurityStatus();
      setSecurityStatus(status);
      setSecurityMetrics(status.metrics);
    }
  }, [isInitialized]);

  // Report security threat
  const reportThreat = useCallback(threat => {
    setThreats(prev => [
      ...prev,
      {
        ...threat,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      },
    ]);

    // Auto-remove threat after 30 seconds
    setTimeout(() => {
      setThreats(prev => prev.filter(t => t.id !== threat.id));
    }, 30000);
  }, []);

  // Get current security status
  const getSecurityStatus = useCallback(() => {
    return comprehensiveSecurityManager.getSecurityStatus();
  }, []);

  // Check if system is secure
  const isSecure =
    securityStatus?.initialized &&
    (securityMetrics?.threats?.blocked || 0) < 10 &&
    (securityMetrics?.errors?.critical || 0) === 0;

  // Initialize on mount
  useEffect(() => {
    handleInitializeSecurity();

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [handleInitializeSecurity]);

  const contextValue = {
    isInitialized,
    securityStatus,
    securityMetrics,
    isSecure,
    threats,
    isLoading,
    error,
    initializeSecurity: handleInitializeSecurity,
    reportThreat,
    getSecurityStatus,
    securityUtils,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
      <SecurityNotifications />
    </SecurityContext.Provider>
  );
};

// ============ SECURITY NOTIFICATIONS ============
const SecurityNotifications = () => {
  const { threats, isSecure, securityMetrics } = useSecurity();
  const [showStatus, setShowStatus] = useState(false);

  return (
    <>
      {/* Security Status Indicator */}
      <div className="security-status-indicator">
        <button
          onClick={() => setShowStatus(!showStatus)}
          className={`security-status-btn ${isSecure ? 'secure' : 'warning'}`}
          title="Security Status"
        >
          <FaShieldAlt />
        </button>

        <AnimatePresence>
          {showStatus && (
            <SecurityStatusPanel onClose={() => setShowStatus(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* Threat Notifications */}
      <div className="security-notifications">
        <AnimatePresence>
          {threats.map(threat => (
            <ThreatNotification key={threat.id} threat={threat} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

// ============ SECURITY STATUS PANEL ============
const SecurityStatusPanel = ({ onClose }) => {
  const { securityStatus, securityMetrics, isSecure } = useSecurity();

  const getStatusIcon = status => {
    if (status) return <FaCheckCircle className="text-green-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };

  return (
    <motion.div
      className="security-status-panel"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div className="security-panel-header">
        <h3>Security Status</h3>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="security-panel-content">
        {/* Overall Status */}
        <div className="security-overall">
          <div className={`security-badge ${isSecure ? 'secure' : 'warning'}`}>
            {isSecure ? <FaShieldAlt /> : <FaExclamationTriangle />}
            <span>{isSecure ? 'Secure' : 'Warning'}</span>
          </div>
        </div>

        {/* Module Status */}
        <div className="security-modules">
          <h4>Security Modules</h4>
          {securityStatus?.modules &&
            Object.entries(securityStatus.modules).map(([name, status]) => (
              <div key={name} className="module-status">
                {getStatusIcon(status.active)}
                <span>{name}</span>
              </div>
            ))}
        </div>

        {/* Metrics */}
        <div className="security-metrics">
          <h4>Security Metrics</h4>
          <div className="metrics-grid">
            <div className="metric">
              <span>Threats Blocked</span>
              <span className="metric-value">
                {securityMetrics?.threats?.blocked || 0}
              </span>
            </div>
            <div className="metric">
              <span>Threats Detected</span>
              <span className="metric-value">
                {securityMetrics?.threats?.detected || 0}
              </span>
            </div>
            <div className="metric">
              <span>Total Errors</span>
              <span className="metric-value">
                {securityMetrics?.errors?.total || 0}
              </span>
            </div>
            <div className="metric">
              <span>Critical Errors</span>
              <span className="metric-value critical">
                {securityMetrics?.errors?.critical || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============ THREAT NOTIFICATION ============
const ThreatNotification = ({ threat }) => {
  const [isVisible, setIsVisible] = useState(true);

  const getSeverityColor = severity => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`threat-notification ${getSeverityColor(threat.severity)}`}
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
    >
      <div className="threat-content">
        <div className="threat-header">
          <FaExclamationTriangle />
          <span>Security Alert</span>
        </div>
        <div className="threat-message">{threat.message}</div>
        <div className="threat-actions">
          <button onClick={() => setIsVisible(false)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============ SECURE INPUT COMPONENT ============
export const SecureInput = ({
  type = 'text',
  value,
  onChange,
  validation,
  placeholder,
  className = '',
  showValidation = true,
  ...props
}) => {
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const { securityUtils } = useSecurity();

  const handleChange = useCallback(
    e => {
      let inputValue = e.target.value;

      // Sanitize input
      inputValue = securityUtils.sanitizeInput(inputValue);

      // Validate if validation rules provided
      if (validation) {
        const result = securityUtils.validateInput(inputValue, validation);
        setIsValid(result.isValid);
        setValidationErrors(result.errors || []);
      }

      onChange?.(inputValue);
    },
    [onChange, validation, securityUtils]
  );

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`secure-input-container ${className}`}>
      <div className="input-wrapper">
        <input
          type={inputType}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`secure-input ${!isValid ? 'invalid' : ''}`}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {showValidation && !isValid && validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <div key={index} className="validation-error">
              <FaExclamationTriangle />
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ SECURE FORM COMPONENT ============
export const SecureForm = ({
  children,
  onSubmit,
  validationRules = {},
  className = '',
  ...props
}) => {
  const { securityUtils } = useSecurity();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validate form data
        if (Object.keys(validationRules).length > 0) {
          const validation = Object.entries(validationRules).reduce(
            (acc, [field, rules]) => {
              const result = securityUtils.validateInput(data[field], rules);
              acc[field] = result;
              return acc;
            },
            {}
          );

          const hasErrors = Object.values(validation).some(
            result => !result.isValid
          );
          if (hasErrors) {
            throw new Error('Form validation failed');
          }
        }

        await onSubmit?.(data);
      } catch (error) {
        errorHandler.handleError(error, { source: 'secure_form' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validationRules, securityUtils]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`secure-form ${className}`}
      {...props}
    >
      {children}
      {isSubmitting && (
        <div className="form-submitting">
          <FaLock />
          <span>Securing and submitting...</span>
        </div>
      )}
    </form>
  );
};

// ============ HOOKS ============
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const useSecureAPICall = () => {
  const { securityUtils } = useSecurity();

  return useCallback(
    async (url, options = {}) => {
      try {
        return await securityUtils.secureAPICall(url, options);
      } catch (error) {
        errorHandler.handleError(error, {
          source: 'secure_api_call',
          url,
          method: options.method || 'GET',
        });
        throw error;
      }
    },
    [securityUtils]
  );
};

export const useWalletSecurity = () => {
  const { securityUtils } = useSecurity();

  return useCallback(
    async (provider, address) => {
      try {
        return await securityUtils.verifyWallet(provider, address);
      } catch (error) {
        errorHandler.handleError(error, {
          source: 'wallet_security',
          address,
        });
        throw error;
      }
    },
    [securityUtils]
  );
};

export const useInputValidation = rules => {
  const { securityUtils } = useSecurity();

  return useCallback(
    value => {
      const sanitized = securityUtils.sanitizeInput(value);
      const validation = securityUtils.validateInput(sanitized, rules);
      return { sanitized, validation };
    },
    [rules, securityUtils]
  );
};

// ============ EXPORTS ============
export default SecurityProvider;
