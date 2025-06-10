import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useWeb3 } from './contexts/Web3Context';
import LandingPage from './components/LandingPage';
import UnifiedDashboard from './components/UnifiedDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { isConnected, account, provider } = useWeb3();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <UnifiedDashboard 
              userAddress={account}
              provider={provider}
              theme="dark"
              demoMode={!isConnected}
            />
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </ErrorBoundary>
  );
}

export default App; 