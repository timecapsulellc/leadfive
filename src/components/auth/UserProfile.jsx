import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../contexts/SupabaseContext'

const UserProfile = () => {
  const { user, userProfile, updateProfile, signOut } = useSupabase()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: '',
    wallet_address: '',
    phone: '',
    country: '',
    referral_code: ''
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        wallet_address: userProfile.wallet_address || '',
        phone: userProfile.phone || '',
        country: userProfile.country || '',
        referral_code: userProfile.referral_code || ''
      })
    }
  }, [userProfile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data, error } = await updateProfile(formData)
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      setError('Error signing out')
    }
  }

  if (!user) {
    return <div>Please sign in to view your profile.</div>
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Profile</h2>
        <div className="space-x-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-gray-600">
          <strong>User ID:</strong> {user.id}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700">
              Wallet Address
            </label>
            <input
              type="text"
              id="wallet_address"
              name="wallet_address"
              value={formData.wallet_address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="referral_code" className="block text-sm font-medium text-gray-700">
              Referral Code
            </label>
            <input
              type="text"
              id="referral_code"
              name="referral_code"
              value={formData.referral_code}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <strong>Full Name:</strong> {userProfile?.full_name || 'Not set'}
          </div>
          <div>
            <strong>Wallet Address:</strong> {userProfile?.wallet_address || 'Not set'}
          </div>
          <div>
            <strong>Phone:</strong> {userProfile?.phone || 'Not set'}
          </div>
          <div>
            <strong>Country:</strong> {userProfile?.country || 'Not set'}
          </div>
          <div>
            <strong>Referral Code:</strong> {userProfile?.referral_code || 'Not set'}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile 