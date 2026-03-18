// types/scenario.types.ts
// Scenario domain types for Workstream F.
// TODO: replace mocks with real API once backend is ready.

export type ScenarioStatus = 'generating' | 'ready' | 'failed'

export type UrgencyLevel = 'none' | 'watch' | 'urgent'

export interface Scenario {
  id: string
  title: string
  shortDescription: string
  /** Bullet points explaining why this scenario fits the patient's data. */
  whyItFits: string[]
  /** Specific anamnesis signals that support this scenario. */
  whatSupports: string[]
  urgencyLevel: UrgencyLevel
  /** Probability framing note shown on every card. */
  confidenceNote: string
}

export interface ScenariosResultDTO {
  sessionId: string
  status: ScenarioStatus
  scenarios: Scenario[]
  generatedAt: string
}

export interface ScenarioDetailDTO extends Scenario {
  /** Questions to bring to a specialist appointment. */
  whatToDiscussWithDoctor: string[]
  /** Suggested next diagnostic steps. */
  whatToCheckNext: string[]
  /** Optional self-monitoring guidance. */
  selfMonitoringNotes?: string
  /** Optional lifestyle recommendations. */
  lifestyleNotes?: string
  /** Optional list of warning signs requiring prompt attention. */
  warningSignsToWatch?: string[]
}
