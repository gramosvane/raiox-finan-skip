import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  verified?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<RecordModel>
  register: (name: string, email: string, pass: string) => Promise<RecordModel>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function formatUser(model: RecordModel | null): AuthUser | null {
  if (!model) return null
  return {
    id: model.id,
    email: model.email || '',
    name: model.name || '',
    avatar: model.avatar || '',
    verified: model.verified ?? false,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => formatUser(pb.authStore.record))
  const [token, setToken] = useState<string | null>(() => pb.authStore.token || null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Sync initial auth state
    setUser(formatUser(pb.authStore.record))
    setToken(pb.authStore.token || null)
    setIsLoading(false)

    // Listen to changes in auth store
    const unsubscribe = pb.authStore.onChange((newToken, record) => {
      setToken(newToken || null)
      setUser(formatUser(record))
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    const authData = await pb.collection('users').authWithPassword(email.trim(), pass)
    setUser(formatUser(authData.record))
    setToken(authData.token)
    return authData.record
  }

  const register = async (name: string, email: string, pass: string) => {
    const created = await pb.collection('users').create({
      name: name.trim(),
      email: email.trim(),
      password: pass,
      passwordConfirm: pass,
    })

    // Request verification email per specification
    try {
      await pb.collection('users').requestVerification(email.trim())
    } catch (e) {
      console.warn('Erro ao solicitar verificação de e-mail:', e)
    }

    // Automatically authenticate the newly created account
    const authData = await pb.collection('users').authWithPassword(email.trim(), pass)
    setUser(formatUser(authData.record))
    setToken(authData.token)
    return created
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  const refreshUser = async () => {
    if (!pb.authStore.isValid || !pb.authStore.record?.id) return
    try {
      const refreshed = await pb.collection('users').authRefresh()
      setUser(formatUser(refreshed.record))
      setToken(refreshed.token)
    } catch {
      logout()
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
