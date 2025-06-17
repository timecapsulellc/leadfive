import React, { useState } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import AuthForm from './auth/AuthForm'
import UserProfile from './auth/UserProfile'

const SupabaseDemo = () => {
  const { user, loading } = useSupabase()
  const [activeTab, setActiveTab] = useState('auth')

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Supabase Integration Demo
        </h1>
        <p className="text-center text-gray-600">
          This demo shows how Supabase is integrated with your OrphiCrowdFund application
        </p>
      </div>

      {!user ? (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Authentication</h2>
            <p className="text-gray-600 mb-4">
              Sign up or sign in to test the Supabase integration. New users will automatically get a profile created.
            </p>
          </div>
          <AuthForm />
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                User Profile
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'data'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Data Operations
              </button>
            </div>
          </div>

          {activeTab === 'profile' && <UserProfile />}
          
          {activeTab === 'data' && <DataOperationsDemo />}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Integration Features</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✅ User authentication with email/password</li>
          <li>✅ Automatic user profile creation</li>
          <li>✅ Profile management and updates</li>
          <li>✅ Referral system support</li>
          <li>✅ Transaction logging</li>
          <li>✅ Real-time data subscriptions</li>
          <li>✅ Row Level Security (RLS)</li>
          <li>✅ MLM network structure support</li>
        </ul>
      </div>
    </div>
  )
}

const DataOperationsDemo = () => {
  const { supabaseService } = useSupabase()
  const [referrals, setReferrals] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  const loadUserData = async () => {
    setLoading(true)
    try {
      // This would work once you have actual data
      // For demo purposes, we'll show the structure
      console.log('Loading user data...')
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Data Operations</h3>
        <p className="text-gray-600 mb-4">
          These operations demonstrate how to interact with your Supabase database.
        </p>
        
        <button
          onClick={loadUserData}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load User Data'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-3">Available Operations</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Create user profile</li>
            <li>• Update profile information</li>
            <li>• Create referral relationships</li>
            <li>• Log transactions</li>
            <li>• Get network statistics</li>
            <li>• Real-time data subscriptions</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-3">Database Tables</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <code>user_profiles</code> - User information</li>
            <li>• <code>referrals</code> - MLM relationships</li>
            <li>• <code>transactions</code> - Financial records</li>
            <li>• <code>network_levels</code> - MLM levels</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SupabaseDemo 