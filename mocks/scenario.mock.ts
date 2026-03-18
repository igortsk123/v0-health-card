// mocks/scenario.mock.ts
// Realistic Russian-language mock for scenarioService (Workstream F).
// Simulates two-phase flow: generate → poll until ready → fetch list.
// All scenario text is informational only — never diagnostic claims.
// TODO: remove when real /api/scenarios/* endpoints are ready.

import type { ApiResponse } from '@/types/api.types'
import { ok } from '@/types/api.types'
import type {
  GenerateScenariosResponse,
  PollScenariosResponse,
  GetScenariosResponse,
  Scenario,
} from '@/types/scenario.types'

// Tracks poll call count per generationId to simulate the two-state sequence.
const pollCallCount = new Map<string, number>()

const MOCK_GENERATION_ID = 'gen_mock_001'

const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 'scenario_anemia',
    title: 'Возможная железодефицитная анемия',
    summary:
      'Выявленные изменения могут быть связаны с недостатком железа в организме. ' +
      'Это один из распространённых сценариев при подобных показателях — стоит обсудить с врачом.',
    relatedMarkers: ['Гемоглобин', 'Эритроциты', 'MCV'],
    probability: 'high',
  },
  {
    id: 'scenario_b12',
    title: 'Дефицит витамина B12 или фолиевой кислоты',
    summary:
      'Отдельные показатели крови могут указывать на недостаток B12 или фолиевой кислоты. ' +
      'Уточняющие анализы помогут подтвердить или исключить этот вариант.',
    relatedMarkers: ['Гемоглобин', 'MCV', 'Тромбоциты'],
    probability: 'medium',
  },
  {
    id: 'scenario_chronic',
    title: 'Анемия хронических заболеваний',
    summary:
      'При наличии хронического воспаления или других длительных состояний изменения ' +
      'в анализе крови могут отражать реакцию организма. Этот сценарий оценивается в контексте анамнеза.',
    relatedMarkers: ['Гемоглобин', 'Эритроциты', 'СОЭ'],
    probability: 'low',
  },
]

// Simulates ~1500ms initial delay for scenario generation trigger
export async function mockGenerateScenarios(
  _sessionId: string,
  _illnessAnamnesisId: string | null,
): Promise<ApiResponse<GenerateScenariosResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  pollCallCount.set(MOCK_GENERATION_ID, 0)
  return ok<GenerateScenariosResponse>({
    generationId: MOCK_GENERATION_ID,
    status: 'generating',
  })
}

// First call → 'generating', second call onwards → 'ready'
// Simulates ~2000ms polling delay
export async function mockPollScenarios(
  generationId: string,
): Promise<ApiResponse<PollScenariosResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const count = pollCallCount.get(generationId) ?? 0
  pollCallCount.set(generationId, count + 1)
  const status = count === 0 ? 'generating' : 'ready'
  return ok<PollScenariosResponse>({ generationId, status })
}

// Simulates ~800ms fetch delay
export async function mockGetScenarios(
  generationId: string,
): Promise<ApiResponse<GetScenariosResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return ok<GetScenariosResponse>({
    generationId,
    scenarios: MOCK_SCENARIOS,
    generatedAt: new Date().toISOString(),
  })
}
