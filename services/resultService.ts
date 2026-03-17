// services/resultService.ts
// Handles parsing poll and free result fetch.
// Set NEXT_PUBLIC_USE_MOCK=true to use mock data instead of real API calls.
// TODO: wire real GET /api/result/status and GET /api/result/free when backend is ready.

import type { ApiResponse } from '@/types/api.types'
import { fail } from '@/types/api.types'
import type {
  PollParsingRequest,
  PollParsingResponse,
  GetFreeResultRequest,
  FreeResultResponse,
} from '@/types/result.types'
import { mockPollParsing, mockGetFreeResult } from '@/mocks/result.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function pollParsing(
  req: PollParsingRequest,
): Promise<ApiResponse<PollParsingResponse>> {
  if (USE_MOCK) {
    return mockPollParsing()
  }

  // TODO: replace with real endpoint
  try {
    const url = `/api/result/status?uploadId=${encodeURIComponent(req.uploadId)}`
    const res = await fetch(url)
    if (!res.ok) {
      return fail<PollParsingResponse>('Ошибка при проверке статуса анализа', res.status)
    }
    const data = (await res.json()) as PollParsingResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<PollParsingResponse>('Не удалось связаться с сервером')
  }
}

export async function getFreeResult(
  req: GetFreeResultRequest,
): Promise<ApiResponse<FreeResultResponse>> {
  if (USE_MOCK) {
    return mockGetFreeResult()
  }

  // TODO: replace with real endpoint
  try {
    const url = `/api/result/free?uploadId=${encodeURIComponent(req.uploadId)}`
    const res = await fetch(url)
    if (!res.ok) {
      return fail<FreeResultResponse>('Ошибка при получении результата', res.status)
    }
    const data = (await res.json()) as FreeResultResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<FreeResultResponse>('Не удалось связаться с сервером')
  }
}
