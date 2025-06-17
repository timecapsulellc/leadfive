import { supabase } from '../config/supabase'

// User Management
export const supabaseService = {
  // Authentication
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // User Profile Management
  async createUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ user_id: userId, ...profileData }])
    return { data, error }
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
    return { data, error }
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // MLM/Network Data
  async createReferral(referrerId, referredId) {
    const { data, error } = await supabase
      .from('referrals')
      .insert([{ referrer_id: referrerId, referred_id: referredId }])
    return { data, error }
  },

  async getUserReferrals(userId) {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
    return { data, error }
  },

  async getUserDownline(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('referrer_id', userId)
    return { data, error }
  },

  // Transactions and Earnings
  async logTransaction(transactionData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
    return { data, error }
  },

  async getUserTransactions(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Analytics and Reports
  async getNetworkStats(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('referrer_id', userId)
    return { data, error }
  },

  // Real-time subscriptions
  subscribeToUserChanges(userId, callback) {
    return supabase
      .channel('user_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_profiles', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe()
  },

  subscribeToTransactions(userId, callback) {
    return supabase
      .channel('transaction_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe()
  }
}

export default supabaseService 