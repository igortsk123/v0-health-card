// services/scenarioService.ts
// Scenario API layer for Workstream F.
// Set NEXT_PUBLIC_USE_MOCK=true to use mock data.
// TODO: replace TODO blocks with real API endpoints when backend is ready.

import type { ApiResponse } from '@/types/api.types'
import { fail } from '@/types/api.types'
import type {
  GenerateScenariosRequest,
  GenerateScenariosResponse,
  PollScenariosRequest,
  PollScenariosResponse,
  GetScenariosRequest,
  GetScenariosResponse,
} from '@/types/scenario.types'
import {
  mockGenerateScenarios,
  mockPollScenarios,
  mockGetScenarios,
} from '@/mocks/scenario.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

/**
 * Trigger scenario generation for a completed session.
 * Returns a generationId and initial status ('generating').
 */
export async function generateScenarios(
  req: GenerateScenariosRequest,
): Promise<ApiResponse<GenerateScenariosResponse>> {
  if (USE_MOCK) {
    return mockGenerateScenarios(req.sessionId, req.illnessAnamnesisId)
  }
  // TODO: replace with real POST /api/scenarios/generate
  try {
    const res = await fetch('/api/scenarios/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) {
      return fail<GenerateScenariosResponse>('Ошибка запуска генерации сценариев', res.status)
    }
    const data = (await res.json()) as GenerateScenariosResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<GenerateScenariosResponse>('Не удалось связаться с сервером')
  }
}

/**
 * Poll generation status until 'ready' or 'failed'.
 */
export async function pollScenarios(
  req: PollScenariosRequest,
): Promise<ApiResponse<PollScenariosResponse>> {
  if (USE_MOCK) {
    return mockPollScenarios(req.generationId)
  }
  // TODO: replace with real GET /api/scenarios/status?generationId=...
  try {
    const params = new URLSearchParams({ generationId: req.generationId })
    const res = await fetch(`/api/scenarios/status?${params}`)
    if (!res.ok) {
      return fail<PollScenariosResponse>('Ошибка проверки статуса', res.status)
    }
    const data = (await res.json()) as PollScenariosResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<PollScenariosResponse>('Не удалось связаться с сервером')
  }
}

/**
 * Fetch the completed scenario list.
 */
export async function getScenarios(
  req: GetScenariosRequest,
): Promise<ApiResponse<GetScenariosResponse>> {
  if (USE_MOCK) {
    return mockGetScenarios(req.generationId)
  }
  // TODO: replace with real GET /api/scenarios?generationId=...
  try {
    const params = new URLSearchParams({ generationId: req.generationId })
    const res = await fetch(`/api/scenarios?${params}`)
    if (!res.ok) {
      return fail<GetScenariosResponse>('Ошибка загрузки сценариев', res.status)
    }
    const data = (await res.json()) as GetScenariosResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<GetScenariosResponse>('Не удалось связаться с сервером')
  }
}
