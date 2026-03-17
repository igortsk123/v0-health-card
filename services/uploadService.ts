// services/uploadService.ts
// Handles file upload to the backend.
// Set NEXT_PUBLIC_USE_MOCK=true to use mock data instead of real API calls.
// TODO: wire real POST /api/upload endpoint when backend is ready.

import type { ApiResponse } from '@/types/api.types'
import { fail } from '@/types/api.types'
import type { UploadFileRequest, UploadFileResponse } from '@/types/upload.types'
import { mockUploadFile } from '@/mocks/upload.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function uploadFile(
  req: UploadFileRequest,
): Promise<ApiResponse<UploadFileResponse>> {
  if (USE_MOCK) {
    return mockUploadFile()
  }

  // TODO: replace with real endpoint
  try {
    const body = new FormData()
    body.append('file', req.file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body,
    })

    if (!res.ok) {
      return fail<UploadFileResponse>('Ошибка при загрузке файла', res.status)
    }

    const data = (await res.json()) as UploadFileResponse
    return { data, error: null, status: res.status }
  } catch {
    return fail<UploadFileResponse>('Не удалось связаться с сервером')
  }
}
