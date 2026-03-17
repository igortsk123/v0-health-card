// types/api.types.ts
// Shared API primitives used across all service layers.
// TODO: replace LoadState with server-action / SWR state when backend is wired.

export type LoadState = 'idle' | 'loading' | 'success' | 'error'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export interface ApiError {
  code: string
  message: string
  details?: string
}

// Utility: wrap a successful value in ApiResponse shape
export function ok<T>(data: T, status = 200): ApiResponse<T> {
  return { data, error: null, status }
}

// Utility: wrap an error in ApiResponse shape
export function fail<T>(message: string, status = 500): ApiResponse<T> {
  return { data: null, error: message, status }
}
