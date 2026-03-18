// types/session.types.ts
// Client-side funnel session model.
// Stored in localStorage for MVP; TODO: persist server-side once auth is added.

export type SessionStage =
  | 'idle'
  | 'upload'
  | 'parsing'
  | 'free_result'
  | 'offer'
  | 'payment'
  | 'life_anamnesis'
  | 'illness_anamnesis'
  | 'scenarios'
  | 'roadmap'

export interface Session {
  sessionId: string | null
  stage: SessionStage
  uploadId: string | null
  paymentId: string | null
  lifeAnamnesisId: string | null
  illnessAnamnesisId: string | null
  selectedScenarioId: string | null
}

export const DEFAULT_SESSION: Session = {
  sessionId: null,
  stage: 'idle',
  uploadId: null,
  paymentId: null,
  lifeAnamnesisId: null,
  illnessAnamnesisId: null,
  selectedScenarioId: null,
}
