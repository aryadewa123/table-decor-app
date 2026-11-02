'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Lead Sales' | 'Sales Staff'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => void
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
)

// Helper: map Supabase user metadata to role
function getUserRole(_email: string, userMetadata?: Record<string, unknown>): AuthUser['role'] {
  const metadataRole = userMetadata?.role
  if (metadataRole === 'Owner') return 'Owner'
  if (metadataRole === 'Lead Sales') return 'Lead Sales'
  return 'Sales Staff'
}

// Helper: derive name from email/user metadata
function getUserName(email: string, userMetadata?: Record<string, unknown>): string {
  const metadataName = userMetadata?.full_name
  if (metadataName && typeof metadataName === 'string') {
    return metadataName
  }
  
  // Extract name from email
  const namePart = email.split('@')[0]
  return namePart.charAt(0).toUpperCase() + namePart.slice(1)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get session and user from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const supabaseUser = session.user
        const role = getUserRole(supabaseUser.email || '', supabaseUser.user_metadata)
        const name = getUserName(supabaseUser.email || '', supabaseUser.user_metadata)
        
        const authUser: AuthUser = {
          id: supabaseUser.id,
          name,
          email: supabaseUser.email || '',
          role,
        }
        setUser(authUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const supabaseUser = session.user
        const role = getUserRole(supabaseUser.email || '', supabaseUser.user_metadata)
        const name = getUserName(supabaseUser.email || '', supabaseUser.user_metadata)
        
        const authUser: AuthUser = {
          id: supabaseUser.id,
          name,
          email: supabaseUser.email || '',
          role,
        }
        setUser(authUser)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const login = (newUser: AuthUser) => {
    setUser(newUser)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const signInWithPassword = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    })
    
    if (error) {
      // Supabase handles OAuth redirect; error state handled by redirect
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signInWithPassword,
        signInWithGoogle,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}