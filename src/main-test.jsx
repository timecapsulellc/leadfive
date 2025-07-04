// Temporary test main.jsx to verify React setup
import React from 'react'
import ReactDOM from 'react-dom/client'
import TestApp from './TestApp.jsx'
import './index.css'

console.log('🚀 LeadFive Test App Loading...')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)

console.log('✅ Test App Rendered Successfully!')
