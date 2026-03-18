// services/scenarioService.ts
// Scenario API layer for Workstream F.
// Set NEXT_PUBLIC_USE_MOCK=true to use mock data.
// TODO: replace TODO blocks with real API endpoints when backend is ready.

import type { ApiResponse } from '@/types/api.types'
import { fail } from '@/types/api.types'
import type { ScenariosResultDTO, ScenarioDetailDTO } from '@/types/scenario.types'
import { mockGenerateScenarios, mockGetScenarioDetail } from '@/mocks/scenario.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

/**
 * Poll or initiate scenario generation for a session.
 * Returns status:'generating' until ready, then status:'ready' with scenarios[].
 * Callers should poll every 3 seconds until status === 'ready'.
 */
export async function generateScenarios(
  sessionId: string,
): Promise<ApiResponse<ScenariosResultDTO>> {
  if (USE_MOCK) {
    return mockGenerateScenarios(sessionId)
  }
  // TODO: replace with real POST /api/scenarios/generate
  try {
    const res = await fetch('/api/scenarios/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) {
      return fail<ScenariosResultDTO>('Ошибка формирования сценариев', res.status)
    }
    const data = (await res.json()) as ScenariosResultDTO
    return { data, error: null, status: res.status }
  } catch {
    return fail<ScenariosResultDTO>('Не удалось связаться с сервером')
  }
}

/**
 * Fetch full detail for a single scenario by its id.
 * Returns null data when the scenario id is not found.
 */
export async function getScenarioDetail(
  scenarioId: string,
): Promise<ApiResponse<ScenarioDetailDTO | null>> {
  if (USE_MOCK) {
    return mockGetScenarioDetail(scenarioId)
  }
  // TODO: replace with real GET /api/scenarios/[id]
  try {
    const res = await fetch(`/api/scenarios/${encodeURIComponent(scenarioId)}`)
    if (!res.ok) {
      return fail<ScenarioDetailDTO | null>('Ошибка загрузки сценария', res.status)
    }
    const data = (await res.json()) as ScenarioDetailDTO
    return { data, error: null, status: res.status }
  } catch {
    return fail<ScenarioDetailDTO | null>('Не удалось связаться с сервером')
  }
}
