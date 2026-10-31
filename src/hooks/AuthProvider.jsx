import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { completeOAuthProfile, loginWithPassword, loginWithProvider, logoutFromSupabase, registerAccount } from '../services/authService'
import { getSupabaseClient, hasSupabaseEnvironment } from '../services/supabaseClient'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(hasSupabaseEnvironment)

  useEffect(() => {
    let active = true
    let subscription
    async function initializeSession() {
      try {
        const client = await getSupabaseClient()
        if (!active) return
        if (!client) {
          setLoading(false)
          return
        }
        const { data: { subscription: authSubscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
          if (!active) return
          setSession(nextSession)
          setLoading(false)
        })
        subscription = authSubscription
        const { data, error } = await client.auth.getSession()
        if (active) {
          setSession(error ? null : data.session)
          setLoading(false)
        }
      } catch {
        if (active) {
          setSession(null)
          setLoading(false)
        }
      }
    }
    void initializeSession()

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    loading,
    signUp: registerAccount,
    signIn: loginWithPassword,
    signInWithProvider: loginWithProvider,
    completeOAuthProfile,
    signOut: logoutFromSupabase,
  }), [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}