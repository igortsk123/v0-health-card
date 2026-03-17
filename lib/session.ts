// lib/session.ts
// Client-side session helpers backed by localStorage.
// IMPORTANT: all reads must be guarded with typeof window !== 'undefined' (SSR safety).
// TODO: replace with server-side session/cookie approach when backend is added.

import type { Session } from '@/types/session.types'
import { DEFAULT_SESSION } from '@/types/session.types'

const SESSION_KEY = 'hc_session'

export function readSession(): Session {
  if (typeof window === 'undefined') return { ...DEFAULT_SESSION }
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return { ...DEFAULT_SESSION }
    return JSON.parse(raw) as Session
  } catch {
    return { ...DEFAULT_SESSION }
  }
}

export function writeSession(session: Session): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded)
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}
