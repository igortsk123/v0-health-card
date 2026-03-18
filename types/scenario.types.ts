// types/scenario.types.ts
// Scenario DTOs for Workstream F — scenario generation and selection.
// TODO: sync with backend schema before wiring real endpoints.

export type ScenarioProbability = 'high' | 'medium' | 'low'

export interface Scenario {
  id: string
  title: string
  /** 1–2 sentence informational summary. Never a diagnosis claim. */
  summary: string
  /** Markers from the analysis that relate to this scenario (informational). */
  relatedMarkers: string[]
  probability: ScenarioProbability
}

// POST /api/scenarios/generate
export interface GenerateScenariosRequest {
  sessionId: string
  illnessAnamnesisId: string | null
}

export interface GenerateScenariosResponse {
  generationId: string
  status: 'generating' | 'ready' | 'failed'
}

// GET /api/scenarios/status?generationId=...
export interface PollScenariosRequest {
  generationId: string
}

export interface PollScenariosResponse {
  generationId: string
  status: 'generating' | 'ready' | 'failed'
}

// GET /api/scenarios?generationId=...
export interface GetScenariosRequest {
  generationId: string
}

export interface GetScenariosResponse {
  generationId: string
  scenarios: Scenario[]
  generatedAt: string // ISO 8601
}
