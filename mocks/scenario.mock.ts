// mocks/scenario.mock.ts
// Scenario mock for Workstream F.
// mockGenerateScenarios: first call returns status:'generating', 1000ms delay.
//   Second call per sessionId returns status:'ready' with full scenarios, 1500ms delay.
// mockGetScenarioDetail: returns full detail DTO, 1000ms delay.
// TODO: remove when real scenario API is ready.

import type { ApiResponse } from '@/types/api.types'
import { ok } from '@/types/api.types'
import type { Scenario, ScenariosResultDTO, ScenarioDetailDTO } from '@/types/scenario.types'

// ---------------------------------------------------------------------------
// Delays
// ---------------------------------------------------------------------------

const GENERATING_DELAY_MS = 1000
const READY_DELAY_MS = 1500
const DETAIL_DELAY_MS = 1000

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Mock scenario data — 3 realistic Russian scenarios
// ---------------------------------------------------------------------------

export const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 'iron_deficiency',
    title: 'Дефицит железа',
    shortDescription:
      'Состояние, при котором организм получает недостаточно железа для нормальной работы. Может проявляться усталостью, слабостью и снижением концентрации.',
    whyItFits: [
      'Описанные симптомы усталости и слабости характерны для данного состояния',
      'Изменения в привычном рационе питания могут влиять на поступление железа',
      'Сочетание симптомов соответствует типичной картине',
    ],
    whatSupports: [
      'Жалобы на постоянную усталость и снижение работоспособности',
      'Трудности с концентрацией внимания',
      'Питание с ограниченным употреблением красного мяса',
    ],
    urgencyLevel: 'none',
    confidenceNote: 'Один из возможных вариантов — не является диагнозом',
  },
  {
    id: 'subclinical_hypothyroidism',
    title: 'Субклинический гипотиреоз',
    shortDescription:
      'Лёгкое снижение функции щитовидной железы, при котором уровень гормонов остаётся в пределах нормы, но на нижней границе. Может влиять на общее самочувствие.',
    whyItFits: [
      'Симптомы вялости и нарушений сна могут соответствовать данному состоянию',
      'Чаще встречается у женщин старше 30 лет',
      'Сочетание усталости и изменений веса характерно для нарушений функции щитовидной железы',
    ],
    whatSupports: [
      'Периодические нарушения сна и ощущение разбитости после отдыха',
      'Некоторые изменения веса без очевидной причины',
      'Повышенная чувствительность к холоду',
    ],
    urgencyLevel: 'watch',
    confidenceNote: 'Возможное объяснение части симптомов — требует лабораторного уточнения',
  },
  {
    id: 'chronic_inflammation',
    title: 'Хроническое воспаление',
    shortDescription:
      'Длительное низкоуровневое воспаление, которое может проявляться неспецифическими симптомами: усталостью, болями, нарушениями самочувствия.',
    whyItFits: [
      'Неспецифические симптомы усталости и дискомфорта могут указывать на фоновое воспаление',
      'Хронический стресс является известным фактором, поддерживающим воспалительные процессы',
      'Описанная картина совместима с данным состоянием',
    ],
    whatSupports: [
      'Длительность симптомов более нескольких недель',
      'Высокий уровень стресса в последние месяцы',
      'Периодические боли или дискомфорт без явной причины',
    ],
    urgencyLevel: 'none',
    confidenceNote: 'Один из вероятных сценариев — необходима консультация специалиста',
  },
]

// ---------------------------------------------------------------------------
// Mock scenario detail data
// ---------------------------------------------------------------------------

export const MOCK_SCENARIO_DETAILS: Record<string, ScenarioDetailDTO> = {
  iron_deficiency: {
    ...MOCK_SCENARIOS[0],
    whatToDiscussWithDoctor: [
      'Попросить направление на общий анализ крови с оценкой гемоглобина и эритроцитов',
      'Уточнить, нужна ли проверка уровня сывороточного железа и ферритина',
      'Обсудить, могут ли принимаемые препараты влиять на усвоение железа',
      'Рассказать об особенностях рациона и возможных ограничениях в питании',
    ],
    whatToCheckNext: [
      'Общий анализ крови (ОАК)',
      'Сывороточное железо и ферритин',
      'Трансферрин и насыщение трансферрина',
    ],
    selfMonitoringNotes:
      'Обратите внимание на характер усталости: ухудшается ли она к концу дня, связана ли с физической нагрузкой. Отмечайте, помогает ли изменение режима отдыха.',
    lifestyleNotes:
      'Продукты, богатые железом: красное мясо, бобовые, шпинат, тёмный шоколад. Витамин C помогает усвоению железа. Чай и кофе могут снижать усвоение при употреблении сразу после еды.',
    warningSignsToWatch: [
      'Одышка при привычной физической нагрузке',
      'Учащённое сердцебиение в покое',
      'Появление обмороков или предобморочных состояний',
    ],
  },

  subclinical_hypothyroidism: {
    ...MOCK_SCENARIOS[1],
    whatToDiscussWithDoctor: [
      'Попросить направление на анализ ТТГ (тиреотропный гормон) — ключевой показатель',
      'Уточнить, нужны ли дополнительные гормоны щитовидной железы (Т3, Т4)',
      'Обсудить семейный анамнез по заболеваниям щитовидной железы',
      'Спросить об УЗИ щитовидной железы, если ТТГ окажется на границе нормы',
    ],
    whatToCheckNext: [
      'ТТГ (тиреотропный гормон)',
      'Свободный Т4 (FT4)',
      'Антитела к тиреопероксидазе (АТ-ТПО)',
      'УЗИ щитовидной железы',
    ],
    selfMonitoringNotes:
      'Ведите дневник сна: фиксируйте время засыпания, ощущение после пробуждения, количество часов сна. Отмечайте динамику веса раз в неделю в одинаковых условиях.',
    lifestyleNotes:
      'Регулярный режим сна и питания помогает стабилизировать работу гормональной системы. Умеренная физическая активность (прогулки) может положительно влиять на общее самочувствие.',
    warningSignsToWatch: [
      'Значительное изменение веса без изменений в питании',
      'Выраженная отёчность, особенно лица и конечностей',
      'Нарушения сердечного ритма',
      'Резкое ухудшение памяти или концентрации',
    ],
  },

  chronic_inflammation: {
    ...MOCK_SCENARIOS[2],
    whatToDiscussWithDoctor: [
      'Обсудить возможность проверки маркеров воспаления: СРБ, СОЭ',
      'Рассказать обо всех симптомах, даже кажущихся несвязанными',
      'Уточнить, нужна ли консультация смежного специалиста',
      'Обсудить влияние уровня стресса на текущее самочувствие',
    ],
    whatToCheckNext: [
      'С-реактивный белок (СРБ) высокочувствительный',
      'СОЭ (скорость оседания эритроцитов)',
      'Общий анализ крови',
      'Биохимический анализ крови',
    ],
    selfMonitoringNotes:
      'Отмечайте, в какое время суток симптомы усиливаются. Фиксируйте возможные триггеры: определённые продукты, стрессовые события, физическую нагрузку.',
    lifestyleNotes:
      'Противовоспалительный рацион включает рыбу, оливковое масло, овощи и фрукты. Сон и управление стрессом — важные немедикаментозные факторы.',
    warningSignsToWatch: [
      'Появление выраженной боли в суставах или мышцах',
      'Стойкое повышение температуры',
      'Быстрая потеря веса без изменений в питании',
    ],
  },
}

// ---------------------------------------------------------------------------
// Per-session call counter for polling simulation
// ---------------------------------------------------------------------------

/** Tracks how many times generateScenarios has been called per session. */
const callCountMap = new Map<string, number>()

// ---------------------------------------------------------------------------
// Public mock functions
// ---------------------------------------------------------------------------

/**
 * Simulate scenario generation polling.
 * Call 1 → status:'generating', empty array, 1s delay.
 * Call 2+ → status:'ready', full scenarios, 1.5s delay.
 */
export async function mockGenerateScenarios(
  sessionId: string,
): Promise<ApiResponse<ScenariosResultDTO>> {
  const count = (callCountMap.get(sessionId) ?? 0) + 1
  callCountMap.set(sessionId, count)

  if (count === 1) {
    await delay(GENERATING_DELAY_MS)
    return ok<ScenariosResultDTO>({
      sessionId,
      status: 'generating',
      scenarios: [],
      generatedAt: new Date().toISOString(),
    })
  }

  await delay(READY_DELAY_MS)
  return ok<ScenariosResultDTO>({
    sessionId,
    status: 'ready',
    scenarios: MOCK_SCENARIOS,
    generatedAt: new Date().toISOString(),
  })
}

/**
 * Return full detail for a given scenario id.
 * Returns null data if the id is unknown.
 */
export async function mockGetScenarioDetail(
  scenarioId: string,
): Promise<ApiResponse<ScenarioDetailDTO | null>> {
  await delay(DETAIL_DELAY_MS)
  const detail = MOCK_SCENARIO_DETAILS[scenarioId] ?? null
  return ok<ScenarioDetailDTO | null>(detail)
}
