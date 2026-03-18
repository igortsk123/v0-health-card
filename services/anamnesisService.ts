// services/anamnesisService.ts
// Life-anamnesis API layer for Workstream D.
// Set NEXT_PUBLIC_USE_MOCK=true to use mock data.
// TODO: replace TODO blocks with real API endpoints when backend is ready.

import type { ApiResponse } from '@/types/api.types'
import { fail } from '@/types/api.types'
import type {
  StartAnamnesisResponseDTO,
  AnswerAnamnesisResponseDTO,
} from '@/types/anamnesis.types'
import {
  mockStartLifeAnamnesis,
  mockAnswerLifeQuestion,
} from '@/mocks/anamnesis.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

/**
 * Begin a life-anamnesis session.
 * Returns the first question and initial progress.
 */
export async function startLifeAnamnesis(
  sessionId: string,
): Promise<ApiResponse<StartAnamnesisResponseDTO>> {
  if (USE_MOCK) {
    return mockStartLifeAnamnesis(sessionId)
  }
  // TODO: replace with real POST /api/anamnesis/life/start
  try {
    const res = await fetch('/api/anamnesis/life/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) {
      return fail<StartAnamnesisResponseDTO>('Ошибка начала анкеты', res.status)
    }
    const data = (await res.json()) as StartAnamnesisResponseDTO
    return { data, error: null, status: res.status }
  } catch {
    return fail<StartAnamnesisResponseDTO>('Не удалось связаться с сервером')
  }
}

/**
 * Submit an answer and receive the next question (or null on completion).
 * When response.data.question === null, response.data.anamnesisId is set.
 */
export async function answerLifeQuestion(
  sessionId: string,
  questionId: string,
  value: string | string[] | boolean | number,
): Promise<ApiResponse<AnswerAnamnesisResponseDTO>> {
  if (USE_MOCK) {
    return mockAnswerLifeQuestion(sessionId, questionId, value)
  }
  // TODO: replace with real POST /api/anamnesis/life/answer
  try {
    const res = await fetch('/api/anamnesis/life/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId, value }),
    })
    if (!res.ok) {
      return fail<AnswerAnamnesisResponseDTO>('Ошибка отправки ответа', res.status)
    }
    const data = (await res.json()) as AnswerAnamnesisResponseDTO
    return { data, error: null, status: res.status }
  } catch {
    return fail<AnswerAnamnesisResponseDTO>('Не удалось связаться с сервером')
  }
}
