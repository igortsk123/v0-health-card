// types/anamnesis.types.ts
// Life-anamnesis and illness-anamnesis DTOs for Workstream D.
// TODO: align field names with real API when backend is wired.

// ---------------------------------------------------------------------------
// Question input types
// ---------------------------------------------------------------------------

/** A yes/no question rendered as two tappable buttons. */
export interface BooleanQuestion {
  type: 'boolean'
}

/** Single-choice from a fixed option list. Auto-submits on selection. */
export interface SingleQuestion {
  type: 'single'
  options: string[]
}

/** Multi-choice from a fixed option list. Requires explicit "Далее" submit. */
export interface MultiQuestion {
  type: 'multi'
  options: string[]
}

/** Free-text answer. Requires explicit "Далее" submit. */
export interface TextQuestion {
  type: 'text'
  placeholder?: string
}

/** Numeric answer (integer or decimal). Requires explicit "Далее" submit. */
export interface NumberQuestion {
  type: 'number'
  unit?: string
  placeholder?: string
  min?: number
  max?: number
}

export type QuestionInputConfig =
  | BooleanQuestion
  | SingleQuestion
  | MultiQuestion
  | TextQuestion
  | NumberQuestion

// ---------------------------------------------------------------------------
// Core DTO shapes
// ---------------------------------------------------------------------------

export interface AnamnesisQuestion {
  id: string
  text: string
  hint?: string
  input: QuestionInputConfig
}

export interface AnamnesisProgressDTO {
  currentStep: number
  estimatedTotal: number
}

/** The value submitted with an answer. Multi → string[]. Others → string | boolean | number. */
export interface AnamnesisAnswer {
  questionId: string
  value: string | string[] | boolean | number
}

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

export interface StartAnamnesisResponseDTO {
  question: AnamnesisQuestion
  progress: AnamnesisProgressDTO
}

export interface AnswerAnamnesisResponseDTO {
  /** null when the anamnesis is complete. */
  question: AnamnesisQuestion | null
  progress: AnamnesisProgressDTO
  /** Populated only on the final answer (question === null). */
  anamnesisId?: string
}
