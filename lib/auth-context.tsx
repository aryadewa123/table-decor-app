'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { AppLanguage } from '@/lib/i18n'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Lead Sales' | 'Sales Staff'
  avatarUrl: string | null
  language: AppLanguage
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => void
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<void>
  updateProfile: (updates: {
    name?: string
    avatarUrl?: string | null
    language?: AppLanguage
  }) => Promise<{ error: string | null }>
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

function toAuthUser(user: {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}): AuthUser {
  const email = user.email || ''
  const language = user.user_metadata?.preferred_language

  return {
    id: user.id,
    name: getUserName(email, user.user_metadata),
    email,
    role: getUserRole(email, user.user_metadata),
    avatarUrl:
      typeof user.user_metadata?.avatar_url === 'string'
        ? user.user_metadata.avatar_url
        : null,
    language: language === 'en' ? 'en' : 'id',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    document.documentElement.lang = user?.language ?? 'id'
  }, [user?.language])

  useEffect(() => {
    // Get session and user from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(toAuthUser(session.user))
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(toAuthUser(session.user))
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

  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    const { data: { user: currentUser }, error: currentUserError } =
      await supabase.auth.getUser()

    if (currentUserError || !currentUser) {
      return { error: currentUserError?.message || 'Sesi login tidak ditemukan.' }
    }

    const userMetadata = { ...currentUser.user_metadata }
    if (updates.name !== undefined) userMetadata.full_name = updates.name.trim()
    if (updates.avatarUrl !== undefined) userMetadata.avatar_url = updates.avatarUrl
    if (updates.language !== undefined) {
      userMetadata.preferred_language = updates.language
    }

    const { data, error } = await supabase.auth.updateUser({ data: userMetadata })
    if (error) return { error: error.message }

    if (data.user) setUser(toAuthUser(data.user))
    return { error: null }
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
        updateProfile,
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