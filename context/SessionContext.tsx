'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session } from '@/types/session.types'
import { DEFAULT_SESSION } from '@/types/session.types'
import { readSession, writeSession, clearSession } from '@/lib/session'

interface SessionContextValue {
  session: Session
  setSession: (updates: Partial<Session>) => void
  resetSession: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session>({ ...DEFAULT_SESSION })

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setSessionState(readSession())
  }, [])

  const setSession = useCallback((updates: Partial<Session>) => {
    setSessionState((prev) => {
      const next = { ...prev, ...updates }
      writeSession(next)
      return next
    })
  }, [])

  const resetSession = useCallback(() => {
    clearSession()
    setSessionState({ ...DEFAULT_SESSION })
  }, [])

  return (
    <SessionContext.Provider value={{ session, setSession, resetSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used inside <SessionProvider>')
  }
  return ctx
}
