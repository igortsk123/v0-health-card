// mocks/roadmap.mock.ts
// Realistic Russian-language mock for roadmapService.
// Simulates two-phase flow: first call returns 'generating', second returns 'ready'.
// All step text is informational only — never diagnostic claims.
// TODO: remove when real /api/roadmap/* endpoints are ready.

import type {
  GenerateRoadmapResponse,
  PollRoadmapResponse,
  RoadmapResponse,
  GetRoadmapPdfResponse,
} from '@/types/roadmap.types'
import { ok } from '@/types/api.types'
import type { ApiResponse } from '@/types/api.types'

// Tracks call count per session+scenario pair to simulate the two-state sequence.
const pollCallCount = new Map<string, number>()

const MOCK_ROADMAP_ID = 'roadmap_mock_001'

const MOCK_ROADMAP: RoadmapResponse = {
  roadmapId: MOCK_ROADMAP_ID,
  scenarioId: 'scenario_anemia',
  scenarioTitle: 'Возможная железодефицитная анемия',
  summary:
    'На основании выявленных отклонений в общем анализе крови составлен информационный план ' +
    'дальнейших шагов. Список носит ориентировочный характер и не заменяет консультацию врача.',
  steps: [
    {
      id: 'step_ferritin',
      category: 'analysis',
      title: 'Анализ на ферритин и сывороточное железо',
      description:
        'Позволяет оценить запасы железа в организме и уточнить характер выявленных изменений. ' +
        'Сдаётся натощак утром.',
      priority: 'high',
      timeframe: 'в течение 1–2 недель',
    },
    {
      id: 'step_b12',
      category: 'analysis',
      title: 'Витамин B12 и фолиевая кислота',
      description:
        'Дефицит этих нутриентов может давать схожую картину в анализе крови. ' +
        'Позволяет исключить дополнительные причины.',
      priority: 'high',
      timeframe: 'в течение 1–2 недель',
    },
    {
      id: 'step_therapist',
      category: 'specialist',
      title: 'Консультация терапевта',
      description:
        'Врач оценит результаты в совокупности с вашей историей болезни, при необходимости ' +
        'назначит лечение или направит к профильному специалисту.',
      priority: 'high',
      timeframe: 'в течение 2 недель',
    },
    {
      id: 'step_diet',
      category: 'lifestyle',
      title: 'Увеличить долю железосодержащих продуктов',
      description:
        'Красное мясо, бобовые, тёмно-зелёные листовые овощи, орехи. ' +
        'Употребление вместе с витамином C улучшает усвоение. ' +
        'Ограничить чай и кофе во время еды.',
      priority: 'normal',
    },
    {
      id: 'step_monitoring',
      category: 'monitoring',
      title: 'Повторный общий анализ крови',
      description:
        'Рекомендуется повторить через 4–6 недель после начала любых изменений в питании ' +
        'или лечении для оценки динамики.',
      priority: 'normal',
      timeframe: 'через 4–6 недель',
    },
    {
      id: 'step_questions',
      category: 'questions',
      title: 'Вопросы для врача',
      description:
        '1. Насколько выражены отклонения — требуется ли лечение прямо сейчас?\n' +
        '2. Нужно ли исключать скрытые кровотечения?\n' +
        '3. Какой препарат железа оптимален при моих показателях?\n' +
        '4. Когда нужно прийти на повторный приём?',
      priority: 'high',
    },
  ],
  generatedAt: new Date().toISOString(),
  pdfUrl: null,  // stub — PDF generation not yet wired
}

// Simulates ~1500ms initial delay for roadmap creation trigger
export async function mockGenerateRoadmap(
  sessionId: string,
  scenarioId: string,
): Promise<ApiResponse<GenerateRoadmapResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  // Reset poll counter for this session+scenario pair
  pollCallCount.set(`${sessionId}:${scenarioId}`, 0)
  return ok<GenerateRoadmapResponse>({ roadmapId: MOCK_ROADMAP_ID, status: 'generating' })
}

// First call → 'generating', second call onwards → 'ready'
// Simulates ~2000ms polling delay
export async function mockPollRoadmap(
  roadmapId: string,
  sessionId: string,
  scenarioId: string,
): Promise<ApiResponse<PollRoadmapResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const key = `${sessionId}:${scenarioId}`
  const count = pollCallCount.get(key) ?? 0
  pollCallCount.set(key, count + 1)
  const status = count === 0 ? 'generating' : 'ready'
  return ok<PollRoadmapResponse>({ roadmapId, status })
}

// Simulates ~800ms fetch delay
export async function mockGetRoadmap(): Promise<ApiResponse<RoadmapResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return ok<RoadmapResponse>(MOCK_ROADMAP)
}

// Stub — no real PDF; returns '#' so callers can show toast instead of crashing
export async function mockGetRoadmapPdf(): Promise<ApiResponse<GetRoadmapPdfResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return ok<GetRoadmapPdfResponse>({ pdfUrl: '#' })
}
