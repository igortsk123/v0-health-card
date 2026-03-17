// mocks/result.mock.ts
// Realistic Russian-language mock for resultService (parsing poll + free result).
// All marker notes use restrained informational wording — never diagnostic claims.
// TODO: remove when real /api/result/* endpoints are ready.

import type { PollParsingResponse, FreeResultResponse } from '@/types/result.types'
import { ok } from '@/types/api.types'
import type { ApiResponse } from '@/types/api.types'

const MOCK_POLL_RESPONSE: PollParsingResponse = {
  sessionId: 'session_mock_001',
  status: 'done',
}

const MOCK_FREE_RESULT: FreeResultResponse = {
  totalMarkers: 7,
  lockedCount: 4,
  hasRedFlags: true,
  analyzedAt: '2024-03-15T09:43:30.000Z',
  freeMarkers: [
    {
      id: 'hgb',
      name: 'Гемоглобин',
      value: '185 г/л',
      referenceRange: '120–160 г/л',
      status: 'elevated',
      flagged: true,
      note: 'Значение выше референсного диапазона. Может быть связано с рядом состояний — стоит обсудить с врачом.',
    },
    {
      id: 'mcv',
      name: 'Средний объём эритроцита (MCV)',
      value: '72 фл',
      referenceRange: '80–100 фл',
      status: 'low',
      flagged: false,
      note: 'Значение ниже нормы. Возможное объяснение — стоит уточнить у врача при плановом визите.',
    },
    {
      id: 'wbc',
      name: 'Лейкоциты',
      value: '5.8 × 10⁹/л',
      referenceRange: '4.0–9.0 × 10⁹/л',
      status: 'normal',
      flagged: false,
      note: 'В пределах нормы на момент анализа.',
    },
  ],
}

// Simulates ~2000ms parsing delay
export async function mockPollParsing(): Promise<ApiResponse<PollParsingResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return ok(MOCK_POLL_RESPONSE)
}

// Simulates ~1000ms result fetch delay
export async function mockGetFreeResult(): Promise<ApiResponse<FreeResultResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return ok(MOCK_FREE_RESULT)
}
