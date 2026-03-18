// types/roadmap.types.ts
// DTOs for roadmap generation and retrieval (Workstream G).
// TODO: sync with backend schema before wiring real endpoints.

// POST /api/roadmap/generate
export interface GenerateRoadmapRequest {
  sessionId: string
  scenarioId: string
}

export interface GenerateRoadmapResponse {
  roadmapId: string
  status: 'generating' | 'ready' | 'failed'
}

// GET /api/roadmap/status?roadmapId=...
export interface PollRoadmapRequest {
  roadmapId: string
}

export interface PollRoadmapResponse {
  roadmapId: string
  status: 'generating' | 'ready' | 'failed'
}

// GET /api/roadmap?roadmapId=...
export interface GetRoadmapRequest {
  roadmapId: string
}

export type RoadmapStepCategory =
  | 'analysis'     // дополнительные анализы
  | 'specialist'   // консультации специалистов
  | 'lifestyle'    // образ жизни
  | 'monitoring'   // наблюдение и контроль
  | 'questions'    // вопросы для врача

export interface RoadmapStep {
  id: string
  category: RoadmapStepCategory
  title: string
  description: string
  priority: 'high' | 'normal' | 'low'
  timeframe?: string  // e.g. "в течение 2 недель"
}

export interface RoadmapResponse {
  roadmapId: string
  scenarioId: string
  scenarioTitle: string
  summary: string
  steps: RoadmapStep[]
  generatedAt: string  // ISO 8601
  pdfUrl: string | null
}

// GET /api/roadmap/pdf?roadmapId=...
export interface GetRoadmapPdfRequest {
  roadmapId: string
}

export interface GetRoadmapPdfResponse {
  pdfUrl: string
}
