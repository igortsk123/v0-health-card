// services/roadmapService.ts
// Handles roadmap generation, polling, retrieval, and PDF stub.
// Set NEXT_PUBLIC_USE_MOCK=true to use mock data instead of real API calls.
// TODO: wire real POST /api/roadmap/generate, GET /api/roadmap/status,
//       GET /api/roadmap, and GET /api/roadmap/pdf when backend is ready.

import type { ApiResponse } from '@/types/api.types'
import { fail } from '@/types/api.types'
import type {
  GenerateRoadmapRequest,
  GenerateRoadmapResponse,
  PollRoadmapRequest,
  PollRoadmapResponse,
  GetRoadmapRequest,
  RoadmapResponse,
  GetRoadmapPdfRequest,
  GetRoadmapPdfResponse,
} from '@/types/roadmap.types'
import {
  mockGenerateRoadmap,
  mockPollRoadmap,
  mockGetRoadmap,
  mockGetRoadmapPdf,
} from '@/mocks/roadmap.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function generateRoadmap(
  req: GenerateRoadmapRequest,
): Promise<ApiResponse<GenerateRoadmapResponse>> {
  if (USE_MOCK) {
    return mockGenerateRoadmap(req.sessionId, req.scenarioId)
  }

  // TODO: replace with real endpoint
  try {
    const res = await fetch('/api/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) {
      return fail<GenerateRoadmapResponse>('Ошибка при запуске генерации маршрутной карты', res.status)
    }
    const data = (await res.json()) as GenerateRoadmapResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<GenerateRoadmapResponse>('Не удалось связаться с сервером')
  }
}

export async function pollRoadmap(
  req: PollRoadmapRequest,
  sessionId: string,
  scenarioId: string,
): Promise<ApiResponse<PollRoadmapResponse>> {
  if (USE_MOCK) {
    return mockPollRoadmap(req.roadmapId, sessionId, scenarioId)
  }

  // TODO: replace with real endpoint
  try {
    const url = `/api/roadmap/status?roadmapId=${encodeURIComponent(req.roadmapId)}`
    const res = await fetch(url)
    if (!res.ok) {
      return fail<PollRoadmapResponse>('Ошибка при проверке статуса маршрутной карты', res.status)
    }
    const data = (await res.json()) as PollRoadmapResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<PollRoadmapResponse>('Не удалось связаться с сервером')
  }
}

export async function getRoadmap(
  req: GetRoadmapRequest,
): Promise<ApiResponse<RoadmapResponse>> {
  if (USE_MOCK) {
    return mockGetRoadmap()
  }

  // TODO: replace with real endpoint
  try {
    const url = `/api/roadmap?roadmapId=${encodeURIComponent(req.roadmapId)}`
    const res = await fetch(url)
    if (!res.ok) {
      return fail<RoadmapResponse>('Ошибка при получении маршрутной карты', res.status)
    }
    const data = (await res.json()) as RoadmapResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<RoadmapResponse>('Не удалось связаться с сервером')
  }
}

export async function getRoadmapPdf(
  req: GetRoadmapPdfRequest,
): Promise<ApiResponse<GetRoadmapPdfResponse>> {
  if (USE_MOCK) {
    return mockGetRoadmapPdf()
  }

  // TODO: replace with real endpoint
  try {
    const url = `/api/roadmap/pdf?roadmapId=${encodeURIComponent(req.roadmapId)}`
    const res = await fetch(url)
    if (!res.ok) {
      return fail<GetRoadmapPdfResponse>('Ошибка при получении PDF', res.status)
    }
    const data = (await res.json()) as GetRoadmapPdfResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<GetRoadmapPdfResponse>('Не удалось связаться с сервером')
  }
}
