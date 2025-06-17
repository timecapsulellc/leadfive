import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import supabaseService from '../services/supabaseService'

const SupabaseContext = createContext()

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabaseService.getUserProfile(userId)
      if (!error && data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabaseService.signUp(email, password, userData)
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabaseService.signIn(email, password)
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabaseService.signOut()
    return { error }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' }
    
    const { data, error } = await supabaseService.updateUserProfile(user.id, updates)
    if (!error && data) {
      setUserProfile(prev => ({ ...prev, ...updates }))
    }
    return { data, error }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    supabaseService
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export default SupabaseContext 