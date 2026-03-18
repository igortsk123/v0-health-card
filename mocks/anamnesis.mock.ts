// mocks/anamnesis.mock.ts
// Life-anamnesis mock for Workstream D.
// Illness-anamnesis mock for Workstream E.
// mockStartLifeAnamnesis: 800ms delay, returns question 0.
// mockAnswerLifeQuestion: 1000ms delay, advances through 10 questions.
//   On step 10 (after final answer) returns { question: null, anamnesisId }.
// mockStartIllnessAnamnesis: 800ms delay, returns illness question 0.
// mockAnswerIllnessQuestion: 1000ms delay, advances through 10 questions.
//   On step 10 returns { question: null, illnessAnamnesisId, redFlag }.
// Per-session step indices are tracked in separate module-level Maps.
// TODO: remove when real anamnesis API is ready.

import type { ApiResponse } from '@/types/api.types'
import { ok } from '@/types/api.types'
import type {
  AnamnesisQuestion,
  StartAnamnesisResponseDTO,
  AnswerAnamnesisResponseDTO,
  IllnessAnswerResponseDTO,
  RedFlagDTO,
} from '@/types/anamnesis.types'

const START_DELAY_MS = 800
const ANSWER_DELAY_MS = 1000
const TOTAL_STEPS = 10

// ---------------------------------------------------------------------------
// Question bank — 10 life-anamnesis questions covering lifestyle, chronic
// conditions, medications, activity, diet, sleep, stress, smoking, alcohol.
// ---------------------------------------------------------------------------

const QUESTION_BANK: AnamnesisQuestion[] = [
  {
    id: 'la_q0',
    text: 'Есть ли у вас хронические заболевания?',
    input: { type: 'boolean' },
  },
  {
    id: 'la_q1',
    text: 'Какие именно хронические заболевания у вас диагностированы?',
    hint: 'Перечислите через запятую или опишите кратко.',
    input: { type: 'text', placeholder: 'Например: гипертония, сахарный диабет 2 типа…' },
  },
  {
    id: 'la_q2',
    text: 'Принимаете ли вы лекарственные препараты на регулярной основе?',
    input: { type: 'boolean' },
  },
  {
    id: 'la_q3',
    text: 'Укажите препараты, которые принимаете регулярно.',
    hint: 'Название и дозировка, если знаете.',
    input: { type: 'text', placeholder: 'Например: метформин 500 мг, лизиноприл 10 мг…' },
  },
  {
    id: 'la_q4',
    text: 'Как вы оцениваете свою физическую активность?',
    input: {
      type: 'single',
      options: [
        'Сидячий образ жизни',
        'Лёгкая активность (прогулки 1–2 раза в неделю)',
        'Умеренная активность (3–4 тренировки в неделю)',
        'Высокая активность (ежедневные тренировки)',
      ],
    },
  },
  {
    id: 'la_q5',
    text: 'Как вы могли бы охарактеризовать своё питание?',
    input: {
      type: 'multi',
      options: [
        'Регулярное, сбалансированное',
        'Часто ем фастфуд или полуфабрикаты',
        'Ограничиваю углеводы / на диете',
        'Вегетарианство или веганство',
        'Нерегулярное, пропускаю приёмы пищи',
      ],
    },
  },
  {
    id: 'la_q6',
    text: 'Сколько часов вы обычно спите за ночь?',
    input: { type: 'number', unit: 'ч', placeholder: '7', min: 1, max: 24 },
  },
  {
    id: 'la_q7',
    text: 'Как бы вы оценили уровень стресса в последние три месяца?',
    input: {
      type: 'single',
      options: [
        'Низкий — чувствую себя спокойно',
        'Умеренный — периодически нервничаю',
        'Высокий — постоянное напряжение',
        'Очень высокий — испытываю хроническую тревогу',
      ],
    },
  },
  {
    id: 'la_q8',
    text: 'Курите ли вы (сигареты, вейп, кальян)?',
    input: { type: 'boolean' },
  },
  {
    id: 'la_q9',
    text: 'Употребляете ли вы алкоголь?',
    input: {
      type: 'single',
      options: [
        'Нет',
        'Редко (1–2 раза в месяц)',
        'Умеренно (1–2 раза в неделю)',
        'Часто (более 3 раз в неделю)',
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Per-session step tracker
// ---------------------------------------------------------------------------

/** stepIndex is the 0-based index of the NEXT question to return after an answer. */
const sessionStepMap = new Map<string, number>()

function getStep(sessionId: string): number {
  return sessionStepMap.get(sessionId) ?? 0
}

function advanceStep(sessionId: string): number {
  const next = getStep(sessionId) + 1
  sessionStepMap.set(sessionId, next)
  return next
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Public mock functions
// ---------------------------------------------------------------------------

export async function mockStartLifeAnamnesis(
  sessionId: string,
): Promise<ApiResponse<StartAnamnesisResponseDTO>> {
  await delay(START_DELAY_MS)
  // Reset step for this session so re-mounts start fresh
  sessionStepMap.set(sessionId, 0)
  return ok<StartAnamnesisResponseDTO>({
    question: QUESTION_BANK[0],
    progress: { currentStep: 1, estimatedTotal: TOTAL_STEPS },
  })
}

export async function mockAnswerLifeQuestion(
  sessionId: string,
  _questionId: string,
  _value: string | string[] | boolean | number,
): Promise<ApiResponse<AnswerAnamnesisResponseDTO>> {
  await delay(ANSWER_DELAY_MS)
  const nextStep = advanceStep(sessionId)

  if (nextStep >= TOTAL_STEPS) {
    // All questions answered — return completion signal
    return ok<AnswerAnamnesisResponseDTO>({
      question: null,
      progress: { currentStep: TOTAL_STEPS, estimatedTotal: TOTAL_STEPS },
      anamnesisId: `mock_life_${sessionId}`,
    })
  }

  return ok<AnswerAnamnesisResponseDTO>({
    question: QUESTION_BANK[nextStep],
    progress: { currentStep: nextStep + 1, estimatedTotal: TOTAL_STEPS },
  })
}

// ---------------------------------------------------------------------------
// Illness-anamnesis mock — Workstream E
// ---------------------------------------------------------------------------

const ILLNESS_TOTAL_STEPS = 10

/**
 * 10-question illness anamnesis bank.
 * Questions cover chief complaint, onset, dynamics, severity, accompanying
 * symptoms, prior consultations, current treatment, and triggers.
 * Backend AI will determine the actual question sequence; this bank is mock-only.
 */
const ILLNESS_QUESTION_BANK: AnamnesisQuestion[] = [
  {
    id: 'ia_q0',
    text: 'Что вас беспокоит в первую очередь?',
    hint: 'Опишите главную жалобу как можно точнее.',
    input: { type: 'text', placeholder: 'Например: боль в правом боку, усталость…' },
  },
  {
    id: 'ia_q1',
    text: 'Как давно появились симптомы?',
    input: {
      type: 'single',
      options: ['Несколько дней', 'Около недели', 'Несколько недель', 'Более месяца'],
    },
  },
  {
    id: 'ia_q2',
    text: 'Как изменились симптомы со временем?',
    input: {
      type: 'single',
      options: ['Нарастают', 'Стабильны', 'Уменьшаются', 'Волнообразно'],
    },
  },
  {
    id: 'ia_q3',
    text: 'Насколько симптомы мешают повседневной жизни?',
    input: {
      type: 'single',
      options: ['Незначительно', 'Умеренно', 'Существенно'],
    },
  },
  {
    id: 'ia_q4',
    text: 'Есть ли сопутствующие симптомы?',
    input: { type: 'boolean' },
  },
  {
    id: 'ia_q5',
    text: 'Опишите сопутствующие симптомы.',
    hint: 'Перечислите всё, что вы заметили помимо основной жалобы.',
    input: { type: 'text', placeholder: 'Например: слабость, тошнота, головная боль…' },
  },
  {
    id: 'ia_q6',
    text: 'Обращались ли вы уже к врачу по этому поводу?',
    input: { type: 'boolean' },
  },
  {
    id: 'ia_q7',
    text: 'Что сказал врач / какое лечение назначено?',
    hint: 'Если диагноза нет — опишите рекомендации.',
    input: { type: 'text', placeholder: 'Например: назначили УЗИ, рекомендовали диету…' },
  },
  {
    id: 'ia_q8',
    text: 'Принимаете ли что-то для облегчения симптомов?',
    input: { type: 'boolean' },
  },
  {
    id: 'ia_q9',
    text: 'Что помогает или ухудшает состояние?',
    hint: 'Например: еда, физическая нагрузка, положение тела, время суток.',
    input: { type: 'text', placeholder: 'Опишите, что замечаете…' },
  },
]

/** Per-session step index for illness anamnesis — separate from life-anamnesis map. */
const illnessSessionStepMap = new Map<string, number>()

function getIllnessStep(sessionId: string): number {
  return illnessSessionStepMap.get(sessionId) ?? 0
}

function advanceIllnessStep(sessionId: string): number {
  const next = getIllnessStep(sessionId) + 1
  illnessSessionStepMap.set(sessionId, next)
  return next
}

/**
 * Stored answers per session so we can evaluate red-flag logic at completion.
 * Key: `${sessionId}:${questionId}`, Value: submitted answer value.
 */
const illnessAnswerCache = new Map<string, string | string[] | boolean | number>()

export async function mockStartIllnessAnamnesis(
  sessionId: string,
  _lifeAnamnesisId: string | null,
): Promise<ApiResponse<StartAnamnesisResponseDTO>> {
  await delay(START_DELAY_MS)
  // Reset step and answer cache for this session so re-mounts start fresh
  illnessSessionStepMap.set(sessionId, 0)
  // Clear previous cached answers for this session
  for (const key of illnessAnswerCache.keys()) {
    if (key.startsWith(`${sessionId}:`)) {
      illnessAnswerCache.delete(key)
    }
  }
  return ok<StartAnamnesisResponseDTO>({
    question: ILLNESS_QUESTION_BANK[0],
    progress: { currentStep: 1, estimatedTotal: ILLNESS_TOTAL_STEPS },
  })
}

export async function mockAnswerIllnessQuestion(
  sessionId: string,
  questionId: string,
  value: string | string[] | boolean | number,
): Promise<ApiResponse<IllnessAnswerResponseDTO>> {
  await delay(ANSWER_DELAY_MS)

  // Cache the answer for red-flag evaluation
  illnessAnswerCache.set(`${sessionId}:${questionId}`, value)

  const nextStep = advanceIllnessStep(sessionId)

  if (nextStep >= ILLNESS_TOTAL_STEPS) {
    // All questions answered — evaluate red flag and return completion signal
    const severityAnswer = illnessAnswerCache.get(`${sessionId}:ia_q3`)
    const redFlag: RedFlagDTO =
      severityAnswer === 'Существенно'
        ? {
            flagged: true,
            urgencyLevel: 'watch',
            reason: 'Симптомы существенно влияют на повседневную жизнь',
          }
        : { flagged: false, urgencyLevel: 'none' }

    return ok<IllnessAnswerResponseDTO>({
      question: null,
      progress: { currentStep: ILLNESS_TOTAL_STEPS, estimatedTotal: ILLNESS_TOTAL_STEPS },
      illnessAnamnesisId: `mock_ill_${sessionId}`,
      redFlag,
    })
  }

  return ok<IllnessAnswerResponseDTO>({
    question: ILLNESS_QUESTION_BANK[nextStep],
    progress: { currentStep: nextStep + 1, estimatedTotal: ILLNESS_TOTAL_STEPS },
  })
}
