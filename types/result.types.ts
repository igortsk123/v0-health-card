// types/result.types.ts
// DTOs for parsing poll and free result display (Workstream B).
// TODO: sync with backend schema before wiring real endpoints.

export type MarkerStatus = 'normal' | 'elevated' | 'low' | 'critical'

export interface ResultMarker {
  id: string
  name: string           // e.g. "Гемоглобин"
  value: string          // e.g. "185 г/л"
  referenceRange: string // e.g. "120–160 г/л"
  status: MarkerStatus
  flagged: boolean       // contributes to hasRedFlags when true
  note: string           // restrained informational wording only — never diagnostic
}

// GET /api/result/status?uploadId=...
export interface PollParsingRequest {
  uploadId: string
}

export interface PollParsingResponse {
  sessionId: string
  status: 'processing' | 'done' | 'failed'
}

// GET /api/result/free?uploadId=...
export interface GetFreeResultRequest {
  uploadId: string
}

export interface FreeResultResponse {
  totalMarkers: number
  freeMarkers: ResultMarker[]  // max FREE_RESULT_MAX_MARKERS (3)
  lockedCount: number          // totalMarkers - freeMarkers.length
  hasRedFlags: boolean
  analyzedAt: string           // ISO 8601
}
